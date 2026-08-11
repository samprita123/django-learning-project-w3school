import { fetchApi } from "./core";
import { format } from "date-fns";

export interface CreateReservationPayload {
  fullName: string;
  nationality: string;
  email: string;
  phone: string;
  address: string;
  checkIn: string;
  checkInTime?: string;
  checkOut: string;
  checkOutTime?: string;
  adults: string;
  children: string;
  roomSelections: Array<{
    roomType: string;
    assignedRooms: string[];
    ratePlan: string;
    mealPlan: string;
    occupancyType: string;
  }>;
  dynamicPricingPct: string;
  source: string;
  specialRequests: string[];
  notes: string;
  idType?: string;
  idNumber?: string;
  uploadedFile?: File | null;
  packages?: string[];
  eventVenue?: string;
  eventType?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventPax?: string;
  eventStart?: string;
  eventEnd?: string;
  eventOrganizer?: string;
  eventContact?: string;
  eventOrganizerEmail?: string;
  eventOrganizerAddress?: string;
  eventSeatingStyle?: string;
  eventCateringMenu?: string;
  eventAvRequirements?: string[];
  eventDecorNotes?: string;
  services?: string[];
  coupon_code?: string;
}

// Module-level caching for metadata to speed up price estimation
let cachedRoomTypes: any[] | null = null;
let cachedRatePlans: any[] | null = null;
let cachedRatePlanInventories: any[] | null = null;
const cachedVersions: Record<string, any[]> = {};

export const reservationsApi = {
  getReservations: () => {
    return fetchApi<any[]>("/api/reservations/bookings/");
  },
  
  getReservation: (id: string) => {
    return fetchApi<any>(`/api/reservations/bookings/${id}/`);
  },

  createReservation: async (form: CreateReservationPayload) => {
    // 1. Create Guest Profile
    const firstName = form.fullName.split(" ")[0] || "Unknown";
    const lastName = form.fullName.split(" ").slice(1).join(" ") || "Guest";
    const guest = await fetchApi<any>("/api/crm/guests/", {
      method: "POST",
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        nationality: form.nationality || "Indian",
        guest_type: "DOMESTIC",
      }),
    });

    // 2. Create Guest Contact
    try {
      await fetchApi<any>("/api/crm/contacts/", {
        method: "POST",
        body: JSON.stringify({
          guest: guest.id,
          email: form.email || "guest@example.com",
          phone: form.phone || "0000000000",
          address_line_1: form.address || "",
          is_primary: true,
        }),
      });
    } catch (e) {
      console.warn("Failed to create guest contact details:", e);
    }

    // 2.5 Upload & Create Guest Document
    if (form.idType || form.idNumber || form.uploadedFile) {
      try {
        let attachmentUrl = "";
        if (form.uploadedFile) {
          try {
            const formData = new FormData();
            formData.append("file", form.uploadedFile);
            const uploadRes = await fetchApi<any>("/api/crm/documents/upload/", {
              method: "POST",
              body: formData,
            });
            attachmentUrl = uploadRes?.url || uploadRes?.attachment_url || "";
          } catch (uploadErr) {
            console.warn("Failed to upload document file to media storage:", uploadErr);
          }
        }

        const cleanIdType = (form.idType || "Passport").replace(/['"]+/g, '');
        const docTypes = await fetchApi<any[]>("/api/reference/document-types/").catch(() => []);
        const docTypeObj = docTypes.find(dt => dt.id === cleanIdType);
        const docTypeName = docTypeObj ? docTypeObj.name : cleanIdType;
        
        let mappedDocType = "PASSPORT";
        if (docTypeName) {
          const name = docTypeName.toUpperCase();
          if (name.includes("PASSPORT")) {
            mappedDocType = "PASSPORT";
          } else if (name.includes("NATIONAL ID") || name.includes("AADHAAR") || name.includes("CARD") || name.includes("PAN") || name.includes("VOTER")) {
            mappedDocType = "NATIONAL_ID";
          } else if (name.includes("DRIVER") || name.includes("LICEN")) {
            mappedDocType = "DRIVING_LICENCE";
          }
        }

        await fetchApi<any>("/api/crm/documents/", {
          method: "POST",
          body: JSON.stringify({
            guest: guest.id,
            document_type: mappedDocType,
            document_number: form.idNumber || ("DOC-" + Math.random().toString(36).substring(2, 8).toUpperCase()),
            attachment_url: attachmentUrl,
          }),
        });
      } catch (e) {
        console.warn("Failed to create guest document details:", e);
      }
    }

    // 3. Resolve Reservation Source ID
    const sources = await fetchApi<any[]>("/api/reference/reservation-sources/");
    let sourceId = sources.find((s) => s.name.toLowerCase() === form.source.toLowerCase())?.id;
    if (!sourceId) {
      sourceId = sources.find((s) => s.name.includes("Direct"))?.id || sources[0]?.id;
    }

    // 4. Resolve Country ID
    let countryId: string | null = null;
    try {
      const countries = await fetchApi<any[]>("/api/reference/countries/");
      countryId = countries.find(
        (c) => c.name.toLowerCase() === (form.nationality || "India").toLowerCase()
      )?.id || null;
    } catch (e) {
      console.warn("Failed to resolve country ID:", e);
    }

    // 5. Fetch Room Types, Rate Plans, and Units to build allocations
    const roomTypes = await fetchApi<any[]>("/api/inventory/types/");
    const ratePlans = await fetchApi<any[]>("/api/rates/rate-plans/");
    const dbUnits = await fetchApi<any>("/api/inventory/units/?limit=1000").then((data: any) => data.results || data);

    const allocationsList: any[] = [];

    for (const rs of form.roomSelections) {
      let unitTypeId = roomTypes.find((rt) => rt.name.toLowerCase() === rs.roomType.toLowerCase())?.id;
      if (!unitTypeId) {
        unitTypeId = roomTypes[0]?.id;
      }

      let ratePlanId = ratePlans.find((rp) => rp.code.toLowerCase() === rs.ratePlan.toLowerCase() || rp.name.toLowerCase().includes(rs.ratePlan.toLowerCase()))?.id;
      if (!ratePlanId) {
        ratePlanId = ratePlans[0]?.id;
      }

      // Fetch rate plan versions to get the active one
      const versions = await fetchApi<any[]>(`/api/rates/rate-plan-versions/?rate_plan_id=${ratePlanId}`);
      const activeVersionId = versions[0]?.id;

      // Look up the actual base_rate for this room type from rate plan inventories
      if (!cachedRatePlanInventories) {
        cachedRatePlanInventories = await fetchApi<any[]>("/api/rates/rate-plan-inventories/").then((d: any) => d.results || d);
      }
      const rpi = (cachedRatePlanInventories || []).find(
        (inv: any) => inv.inventory_unit_type === unitTypeId && inv.rate_plan === ratePlanId
      ) || (cachedRatePlanInventories || []).find(
        (inv: any) => inv.inventory_unit_type === unitTypeId
      );
      const baseRate = rpi ? String(parseFloat(rpi.base_rate)) : "3000";

      // Fetch rate calendar for this room type and date range to get per-night rates
      let calendarEntries: any[] = [];
      try {
        // Try to find the property id via the rate plan
        const rpData = ratePlans.find((rp: any) => rp.id === ratePlanId);
        const propertyId = rpData?.property;
        if (propertyId) {
          // Use date__lte = last night (checkout - 1 day is the last night so end_date = checkOut - 1)
          const lastNight = format(
            new Date(new Date(form.checkOut).setDate(new Date(form.checkOut).getDate() - 1)),
            "yyyy-MM-dd"
          );
          const calendarData = await fetchApi<any>(
            `/api/rates/calendar/property/${propertyId}/?start_date=${form.checkIn}&end_date=${lastNight}&page_size=90`
          );
          // API may return paginated { results: [...] } or a plain array
          calendarEntries = Array.isArray(calendarData)
            ? calendarData
            : calendarData?.results || [];
        }
      } catch (e) {
        console.warn("Failed to fetch rate calendar, using base rate for all nights:", e);
      }

      // Generate nightly rates for each day between check-in and check-out
      // Use the rate calendar amount for each date; fall back to base_rate if missing
      const nightlyRates = [];
      const start = new Date(form.checkIn);
      const end = new Date(form.checkOut);
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, "yyyy-MM-dd");
        // The calendar serializer returns inventory_unit_type and rate_plan as nested objects {id, name, code}
        const calEntry = calendarEntries.find(
          (c: any) =>
            c.date === dateStr &&
            (c.inventory_unit_type?.id === unitTypeId || c.inventory_unit_type === unitTypeId) &&
            (c.rate_plan?.id === ratePlanId || c.rate_plan === ratePlanId)
        );
        // If we found a specific calendar rate use it, otherwise fall back to base_rate
        const nightlyAmount = calEntry ? String(parseFloat(calEntry.amount)) : baseRate;
        nightlyRates.push({
          date: dateStr,
          amount: nightlyAmount,
          rate_plan_version_id: activeVersionId,
        });
      }

      // Split allocation per assigned room unit
      if (rs.assignedRooms && rs.assignedRooms.length > 0) {
        for (const roomNum of rs.assignedRooms) {
          const roomUnit = (dbUnits || []).find((u: any) => u.name === roomNum && u.inventory_unit_type === unitTypeId);
          allocationsList.push({
            inventory_unit_type_id: unitTypeId,
            inventory_unit_id: roomUnit?.id || null,
            check_in_date: form.checkIn,
            check_out_date: form.checkOut,
            adult_count: Number(form.adults) || 2,
            child_count: Number(form.children) || 0,
            infant_count: 0,
            rate_plan_id: ratePlanId,
            meal_plan_id: rs.mealPlan || null,
            nightly_rates: nightlyRates,
          });
        }
      } else {
        allocationsList.push({
          inventory_unit_type_id: unitTypeId,
          inventory_unit_id: null,
          check_in_date: form.checkIn,
          check_out_date: form.checkOut,
          adult_count: Number(form.adults) || 2,
          child_count: Number(form.children) || 0,
          infant_count: 0,
          rate_plan_id: ratePlanId,
          meal_plan_id: rs.mealPlan || null,
          nightly_rates: nightlyRates,
        });
      }
    }

    // 6. Build Create Booking payload
    const payload = {
      primary_guest_id: guest.id,
      reservation_source_id: sourceId,
      reservation_type: "Guaranteed",
      market_segment: "FIT",
      corporate_account_id: form.corporateAccountId || null,
      corporate_po_ref: form.corporatePoRef || "",
      corporate_billing_type: form.corporateBilling || "",
      corporate_employee_id: form.corporateGuestId || "",
      corporate_cost_center: form.corporateCostCenter || "",
      corporate_gst_number: form.corporateGst || "",
      corporate_travel_purpose: form.corporateTravelPurpose || "",
      origin_country_id: countryId,
      arrival_date: form.checkIn || form.eventStartDate || "",
      departure_date: form.checkOut || form.eventEndDate || "",
      check_in_time: form.checkInTime || "12:00 PM",
      check_out_time: form.checkOutTime || "11:00 AM",
      notes: form.notes || "",
      remarks: form.notes || "",
      special_requests: form.specialRequests || [],
      allocations: allocationsList,
      packages: form.packages || [],
      services: form.services || [],
      coupon_code: form.couponCode || form.coupon_code || "",
      event_venue: form.eventVenue || "",
      event_type: form.eventType || "",
      event_pax: Number(form.eventPax) || 0,
      event_start_time: form.eventStart || "",
      event_end_time: form.eventEnd || "",
      event_organizer_name: form.eventOrganizer || "",
      event_organizer_contact: form.eventContact || "",
      event_organizer_email: form.eventOrganizerEmail || "",
      event_organizer_billing_address: form.eventOrganizerAddress || "",
      event_seating_arrangement: form.eventSeatingStyle || "",
      event_catering_menu: form.eventCateringMenu || "",
      paid_amount: form.paidAmount || "0",
      payment_method: form.paymentMethod || "Cash",
      payment_remark: form.paymentRemark || "",
    };

    return fetchApi<any>("/api/reservations/bookings/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  checkIn: (id: string) =>
    fetchApi<any>(`/api/reservations/bookings/${id}/check-in/`, {
      method: "POST",
    }),

  checkOut: (id: string) =>
    fetchApi<any>(`/api/reservations/bookings/${id}/check-out/`, {
      method: "POST",
    }),

  estimatePrice: async (form: CreateReservationPayload) => {
    // 1. Resolve room types & rate plans using memory cache if available
    if (!cachedRoomTypes) {
      cachedRoomTypes = await fetchApi<any[]>("/api/inventory/types/");
    }
    if (!cachedRatePlans) {
      cachedRatePlans = await fetchApi<any[]>("/api/rates/rate-plans/");
    }
    const roomTypes = cachedRoomTypes;
    const ratePlans = cachedRatePlans;

    // Pre-fetch shared data once
    if (!cachedRatePlanInventories) {
      cachedRatePlanInventories = await fetchApi<any[]>("/api/rates/rate-plan-inventories/").then((d: any) => d.results || d);
    }

    // Fetch meal plans, tenant meal plan prices, and occupancy types once
    let allMealPlans: any[] = [];
    let allTenantMealPlanPrices: any[] = [];
    let allOccupancyTypes: any[] = [];
    try {
      allMealPlans = await fetchApi<any[]>("/api/rates/meal-plans/").then((d: any) => d.results || d);
    } catch { /* ignore */ }
    try {
      allTenantMealPlanPrices = await fetchApi<any[]>("/api/rates/tenant-meal-plan-prices/").then((d: any) => d.results || d);
    } catch { /* ignore */ }
    try {
      allOccupancyTypes = await fetchApi<any[]>("/api/superadmin-occupancy-types/").then((d: any) => d.results || d);
    } catch { /* ignore */ }

    const allocations = await Promise.all(
      form.roomSelections.map(async (rs) => {
      // rs.roomType is stored as the unit type ID (UUID) from the Add Room dialog
      let unitTypeId = roomTypes.find((rt) => rt.id === rs.roomType)?.id;
      if (!unitTypeId) {
        // Fallback: try name match
        unitTypeId = roomTypes.find((rt) => rt.name.toLowerCase() === rs.roomType.toLowerCase())?.id;
      }
      if (!unitTypeId) {
        unitTypeId = roomTypes[0]?.id;
      }

        let ratePlanId = ratePlans.find((rp) => rp.code.toLowerCase() === rs.ratePlan.toLowerCase() || rp.name.toLowerCase().includes(rs.ratePlan.toLowerCase()))?.id;
        if (!ratePlanId) {
          ratePlanId = ratePlans[0]?.id;
        }

        if (!cachedVersions[ratePlanId]) {
          cachedVersions[ratePlanId] = await fetchApi<any[]>(`/api/rates/rate-plan-versions/?rate_plan_id=${ratePlanId}`);
        }
        const versions = cachedVersions[ratePlanId];
        const activeVersionId = versions[0]?.id;

        // Look up actual base_rate for this room type
        const rpi = (cachedRatePlanInventories || []).find(
          (inv: any) => inv.inventory_unit_type === unitTypeId && inv.rate_plan === ratePlanId
        ) || (cachedRatePlanInventories || []).find(
          (inv: any) => inv.inventory_unit_type === unitTypeId
        );
        const baseRate = rpi ? parseFloat(rpi.base_rate) : 3000;

        // Meal plan rate: use tenant-specific price first, then system default
        let mealPlanRate = 0;
        if (rs.mealPlan) {
          const mp = allMealPlans.find((m: any) => m.id === rs.mealPlan || m.code === rs.mealPlan);
          if (mp) {
            // Check for tenant-specific override (per room type)
            const tenantPrice = allTenantMealPlanPrices.find(
              (p: any) => p.meal_plan === mp.id && p.inventory_unit_type === unitTypeId
            ) || allTenantMealPlanPrices.find(
              (p: any) => p.meal_plan === mp.id
            );
            mealPlanRate = tenantPrice
              ? parseFloat(tenantPrice.price) || 0
              : parseFloat(mp.price_adjustment ?? 0) || 0;
          }
        }

        // Occupancy multiplier
        let occupancyMultiplier = 1;
        if (rs.occupancyType) {
          const occ = allOccupancyTypes.find((o: any) => o.code === rs.occupancyType || o.name === rs.occupancyType);
          if (occ) occupancyMultiplier = parseFloat(occ.multiplier) || 1;
        }

        // Fetch rate calendar for this room type and date range to get per-night rates
        let calendarEntries: any[] = [];
        try {
          const rpData = ratePlans.find((rp: any) => rp.id === ratePlanId);
          const propertyId = rpData?.property;
          if (propertyId) {
            const lastNight = format(
              new Date(new Date(form.checkOut).setDate(new Date(form.checkOut).getDate() - 1)),
              "yyyy-MM-dd"
            );
            const calendarData = await fetchApi<any>(
              `/api/rates/calendar/property/${propertyId}/?start_date=${form.checkIn}&end_date=${lastNight}&page_size=90`
            );
            calendarEntries = Array.isArray(calendarData)
              ? calendarData
              : calendarData?.results || [];
          }
        } catch (e) {
          console.warn("Failed to fetch rate calendar during estimation:", e);
        }

        const nightlyRates = [];
        const start = new Date(form.checkIn);
        const end = new Date(form.checkOut);
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          const dateStr = format(d, "yyyy-MM-dd");
          // Find the calendar entry for this date + unit type + rate plan
          const calEntry = calendarEntries.find(
            (c: any) =>
              c.date === dateStr &&
              (c.inventory_unit_type?.id === unitTypeId || c.inventory_unit_type === unitTypeId) &&
              (c.rate_plan?.id === ratePlanId || c.rate_plan === ratePlanId)
          );
          // If we found a specific calendar rate use it, otherwise fall back to baseRate
          const nightlyBase = calEntry ? parseFloat(calEntry.amount) : baseRate;
          const nightlyAmount = Math.round((nightlyBase + mealPlanRate) * occupancyMultiplier);

          nightlyRates.push({
            date: dateStr,
            amount: String(nightlyAmount),
            rate_plan_version_id: activeVersionId,
          });
        }

        return {
          inventory_unit_type_id: unitTypeId,
          check_in_date: form.checkIn,
          check_out_date: form.checkOut,
          adult_count: Number(form.adults) || 2,
          child_count: Number(form.children) || 0,
          infant_count: 0,
          rate_plan_id: ratePlanId,
          nightly_rates: nightlyRates,
        };
      })
    );

    const payload = {
      arrival_date: form.checkIn,
      departure_date: form.checkOut,
      allocations: allocations,
      packages: form.packages || [],
      services: form.services || [],
      coupon_code: form.coupon_code || "",
    };

    return fetchApi<any>("/api/reservations/bookings/estimate/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createGroupBlock: async (form: any) => {
    // 1. Resolve property from localStorage
    const propertyId = localStorage.getItem("retrod:active-property-id");
    if (!propertyId) {
      throw new Error("No active property selected.");
    }

    // Split contact field if it has a delimiter or use it directly
    const contactParts = (form.groupContact || "").split(/[·|]/);
    const contactName = contactParts[0]?.trim() || form.fullName || "";
    const contactPhone = contactParts[1]?.trim() || form.phone || "";
    const contactEmail = form.email || "";

    const payload = {
      property: propertyId,
      name: form.groupName,
      block_type: "Tour Group", // Group bookings default block type
      cutoff_date: form.groupCutoffDate || null,
      total_rooms: Number(form.groupRooms) || (form.roomSelections?.length || 0),
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      start_date: form.checkIn || null,
      end_date: form.checkOut || null,
      status: "OPEN",
      code: `GRP-${Math.floor(100000 + Math.random() * 900000)}`, // unique code required by constraint
      pickup_target: form.groupPickupTarget || "",
      pickup_location: form.groupPickupLocation || "",
      room_selections: form.roomSelections || [],
      paid_amount: form.paidAmount ? String(form.paidAmount) : "0.00",
      payment_method: form.paymentMethod || "Cash",
      payment_remark: form.paymentRemark || "",
      id_type: form.idType || "",
      id_number: form.idNumber || "",
      address: form.address || "",
    };

    return fetchApi<any>("/api/reservations/group-blocks/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export interface AddToWaitlistPayload {
  guest_name: string;
  email: string;
  phone: string;
  check_in_date: string;
  check_out_date: string;
  inventory_unit_type_id: string; // UUID of room type
  priority: "HIGH" | "NORMAL" | "LOW";
  notes?: string;
}

export const waitlistApi = {
  getAll: (statusFilter?: string) => {
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    return fetchApi<any[]>(`/api/reservations/waitlist/${qs}`);
  },

  addToWaitlist: (payload: AddToWaitlistPayload) => {
    return fetchApi<any>("/api/reservations/waitlist/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  convertEntry: (id: string) => {
    return fetchApi<any>(`/api/reservations/waitlist/${id}/convert/`, {
      method: "POST",
    });
  },

  cancelEntry: (id: string) => {
    return fetchApi<any>(`/api/reservations/waitlist/${id}/cancel/`, {
      method: "POST",
    });
  },
};

export const groupBlocksApi = {
  getAll: async () => {
    const propertyId = localStorage.getItem("retrod:active-property-id");
    const qs = propertyId ? `?property_id=${propertyId}` : "";
    return fetchApi<any>(`/api/reservations/group-blocks/${qs}`);
  },
  create: async (payload: any) => {
    return fetchApi<any>("/api/reservations/group-blocks/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update: async (id: string, payload: any) => {
    return fetchApi<any>(`/api/reservations/group-blocks/${id}/`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  delete: async (id: string) => {
    return fetchApi<any>(`/api/reservations/group-blocks/${id}/`, {
      method: "DELETE",
    });
  },
};
