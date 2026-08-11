import * as db from "@/services/mock/db";
import type { FrontDeskWorkflowReservation, ReservationType } from "@/types/pms";
import { reservationsApi } from "@/services/api/reservations";
import { format } from "date-fns";
import { fetchApi } from "@/services/api/core";

const delay = (ms = 80) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const SUBMITTED_KEY = "retrod:new-reservation:last-submitted:v1";
const OPS_TASKS_KEY = "retrod:ops-tasks:v1";
const RATE_PLANS_KEY = "retrod:rate-plans:v1";
const RATE_PLAN_VERSIONS_KEY = "retrod:rate-plans:versions:v1";
const TAX_COMPONENTS_KEY = "retrod:tax-components:v1";
const TAX_GROUPS_KEY = "retrod:tax-groups:v1";
const TAX_ASSIGNMENTS_KEY = "retrod:tax-assignments:v1";
const AVAILABILITY_CELLS_KEY = "retrod:availability-cells:v1";
const WB_WORKSPACE_KEY = "retrod:website-builder:workspace:v1";
const WB_APPROVALS_KEY = "retrod:website-builder:approvals:v1";
const WB_PUBLISH_KEY = "retrod:website-builder:publish-history:v1";
const GROUP_BLOCKS_KEY = "retrod:group-blocks:v1";

export const dataKeys = {
  reservations: ["data", "reservations"] as const,
  arrivalsToday: ["data", "arrivalsToday"] as const,
  departuresToday: ["data", "departuresToday"] as const,
  housekeepingRooms: ["data", "housekeepingRooms"] as const,
  revenueTrend: ["data", "revenueTrend"] as const,
  otaBreakdown: ["data", "otaBreakdown"] as const,
  roomStatusDonut: ["data", "roomStatusDonut"] as const,
  activityFeed: ["data", "activityFeed"] as const,
  occupancyByType: ["data", "occupancyByType"] as const,
  revenueKpis: ["data", "revenueKpis"] as const,
  dashboardAlerts: ["data", "dashboardAlerts"] as const,
  forecast7d: ["data", "forecast7d"] as const,
  availabilityMatrix: ["data", "availabilityMatrix"] as const,
  rateCalendar: ["data", "rateCalendar"] as const,
  restrictions: ["data", "restrictions"] as const,
  guests: ["data", "guests"] as const,
  waitlist: ["data", "waitlist"] as const,
  groupBlocks: ["data", "groupBlocks"] as const,
  workOrders: ["data", "workOrders"] as const,
  opsTasks: ["data", "opsTasks"] as const,
  guestServiceRequests: ["data", "guestServiceRequests"] as const,
  otaMappings: ["data", "otaMappings"] as const,
  otaSyncLogs: ["data", "otaSyncLogs"] as const,
  pricingRules: ["data", "pricingRules"] as const,
  corporateAccounts: ["data", "corporateAccounts"] as const,
  onlineCheckIns: ["data", "onlineCheckIns"] as const,
  commThreads: ["data", "commThreads"] as const,
  loyaltyMembers: ["data", "loyaltyMembers"] as const,
  registrationCards: ["data", "registrationCards"] as const,
  lostFoundItems: ["data", "lostFoundItems"] as const,
  feedbackEntries: ["data", "feedbackEntries"] as const,
  bookingPromos: ["data", "bookingPromos"] as const,
  packageProducts: ["data", "packageProducts"] as const,
  addOnProducts: ["data", "addOnProducts"] as const,
  conciergeRequests: ["data", "conciergeRequests"] as const,
  transportTrips: ["data", "transportTrips"] as const,
  activitySlots: ["data", "activitySlots"] as const,
  portfolioProperties: ["data", "portfolioProperties"] as const,
  aiRevenueDashboard: ["data", "aiRevenueDashboard"] as const,
  mealPlans: ["data", "mealPlans"] as const,
  ratePlans: ["data", "ratePlans"] as const,
  ratePlanVersions: ["data", "ratePlanVersions"] as const,
  ratePlanPolicies: ["data", "ratePlanPolicies"] as const,
  taxComponents: ["data", "taxComponents"] as const,
  taxGroups: ["data", "taxGroups"] as const,
  taxAssignments: ["data", "taxAssignments"] as const,
  availabilityCells: ["data", "availabilityCells"] as const,
  hotelPackages: ["data", "hotelPackages"] as const,
  packageItems: ["data", "packageItems"] as const,
  occupancyPricingRules: ["data", "occupancyPricingRules"] as const,
  frontDeskWorkflowReservations: ["data", "frontDeskWorkflowReservations"] as const,
  frontDeskArrivalQueue: ["data", "frontDeskArrivalQueue"] as const,
  frontDeskCheckoutQueue: ["data", "frontDeskCheckoutQueue"] as const,
  websiteBuilderWorkspace: ["data", "websiteBuilderWorkspace"] as const,
  websiteBuilderApprovals: ["data", "websiteBuilderApprovals"] as const,
  websiteBuilderPublishHistory: ["data", "websiteBuilderPublishHistory"] as const,
};

function mapBackendStatusToFrontend(s: string): "Confirmed" | "Checked-In" | "Checked-Out" | "Pending" | "No-Show" | "Cancelled" {
  switch (s) {
    case "CONFIRMED":
    case "GUARANTEED":
      return "Confirmed";
    case "CHECKED_IN":
      return "Checked-In";
    case "CHECKED_OUT":
      return "Checked-Out";
    case "PENDING":
    case "INQUIRY":
      return "Pending";
    case "CANCELLED":
      return "Cancelled";
    case "NO_SHOW":
      return "No-Show";
    default:
      return "Pending";
  }
}

function mapBackendReservation(r: any) {
  const firstAllocation = r.room_allocations?.[0];
  const roomName = firstAllocation?.unit_name || "Unassigned";
  const roomType = firstAllocation?.unit_type_code || "Deluxe King";
  const nights = Math.max(
    1,
    Math.round(
      (new Date(r.departure_date).getTime() - new Date(r.arrival_date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  let ciStr = "";
  let coStr = "";
  try {
    ciStr = format(new Date(r.arrival_date), "dd MMM");
    coStr = format(new Date(r.departure_date), "dd MMM");
  } catch (e) {
    ciStr = r.arrival_date || "";
    coStr = r.departure_date || "";
  }

  return {
    id: r.confirmation_number || r.id,
    guest: r.primary_guest_name || "Unknown Guest",
    room: roomName,
    type: roomType,
    ci: ciStr,
    co: coStr,
    nights: nights,
    amount: Number(r.total_amount) + Number(r.tax_amount),
    status: mapBackendStatusToFrontend(r.status),
    source: r.reservation_source_name || "Direct",
    balance: Number(r.balance_amount),
  };
}

export async function fetchReservations() {
  const list = await reservationsApi.getReservations();
  return (list || []).map(mapBackendReservation);
}

export async function fetchReservation(id: string) {
  const found = await reservationsApi.getReservation(id);
  return mapBackendReservation(found);
}
export async function fetchArrivalsToday() {
  await delay();
  return db.arrivalsToday;
}
export async function fetchDeparturesToday() {
  await delay();
  return db.departuresToday;
}
export async function fetchHousekeepingRooms() {
  await delay();
  return db.housekeepingRooms;
}
export async function fetchRevenueTrend() {
  await delay();
  return db.revenueTrend;
}
export async function fetchOtaBreakdown() {
  await delay();
  return db.otaBreakdown;
}
export async function fetchRoomStatusDonut() {
  await delay();
  return db.roomStatusDonut;
}
export async function fetchActivityFeed() {
  await delay();
  return db.activityFeed;
}
export async function fetchOccupancyByType() {
  await delay();
  return db.occupancyByType;
}
export async function fetchRevenueKpis() {
  await delay();
  return db.revenueKpis;
}
export async function fetchDashboardAlerts() {
  await delay();
  return db.dashboardAlerts;
}
export async function fetchForecast7d() {
  await delay();
  return db.forecast7d;
}
export async function fetchAvailabilityMatrix() {
  await delay();
  return db.availabilityMatrix;
}
export async function fetchRateCalendar() {
  await delay();
  return db.rateCalendar;
}
export async function fetchRestrictions() {
  await delay();
  return db.restrictions;
}
export async function fetchGuests() {
  await delay();
  return db.guests;
}
export async function fetchWaitlist() {
  await delay();
  return db.waitlist;
}
export async function fetchGroupBlocks() {
  await delay();
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return readStoredArray(GROUP_BLOCKS_KEY, db.groupBlocks);
}

export async function saveGroupBlock(block: typeof db.groupBlocks[0]) {
  await delay(40);
  const existing = await fetchGroupBlocks();
  const next = [block, ...existing];
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  writeStoredArray(GROUP_BLOCKS_KEY, next);
  return next;
}
export async function fetchWorkOrders() {
  await delay();
  return db.workOrders;
}
export async function saveWorkOrder(workOrder: any) {
  await delay();
  db.workOrders.unshift(workOrder);
  return db.workOrders;
}
export async function updateWorkOrderStatus(id: string, status: string) {
  await delay();
  const idx = db.workOrders.findIndex(w => w.id === id);
  if (idx !== -1) db.workOrders[idx] = { ...db.workOrders[idx], status: status as any };
  return db.workOrders;
}
export async function fetchOpsTasks() {
  await delay();
  const raw = typeof window !== "undefined" ? localStorage.getItem(OPS_TASKS_KEY) : null;
  if (!raw) return db.opsTasks;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return db.opsTasks;
    return parsed;
  } catch {
    return db.opsTasks;
  }
}
export async function saveOpsTasks(tasks: typeof db.opsTasks) {
  await delay(100);
  writeStoredArray(OPS_TASKS_KEY, tasks);
  db.opsTasks.splice(0, db.opsTasks.length, ...tasks);
  return tasks;
}
export async function updateOpsTask(id: string, updates: any) {
  await delay(100);
  const tasks = await fetchOpsTasks();
  const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, ...updates } : task));
  writeStoredArray(OPS_TASKS_KEY, updatedTasks);
  db.opsTasks.splice(0, db.opsTasks.length, ...updatedTasks);
  return updatedTasks;
}
export async function fetchGuestServiceRequests() {
  await delay();
  return db.guestServiceRequests;
}
export async function fetchOtaMappings() {
  await delay();
  return db.otaMappings;
}
export async function fetchOtaSyncLogs() {
  await delay();
  return db.otaSyncLogs;
}
export async function fetchPricingRules() {
  await delay();
  return db.pricingRules;
}
export async function fetchCorporateAccounts() {
  await delay();
  return db.corporateAccounts;
}
export async function fetchOnlineCheckIns() {
  await delay();
  return db.onlineCheckIns;
}
export async function fetchCommThreads() {
  await delay();
  return db.commThreads;
}
export async function fetchLoyaltyMembers() {
  await delay();
  return db.loyaltyMembers;
}
export async function fetchRegistrationCards() {
  await delay();
  return db.registrationCards;
}
export async function fetchLostFoundItems() {
  await delay();
  return db.lostFoundItems;
}
export async function saveLostFoundItem(item: any) {
  await delay();
  db.lostFoundItems.unshift(item);
  return db.lostFoundItems;
}
export async function fetchFeedbackEntries() {
  await delay();
  return db.feedbackEntries;
}
export async function fetchBookingPromos() {
  await delay();
  return db.bookingPromos;
}
export async function fetchPackageProducts() {
  await delay();
  return db.packageProducts;
}
export async function fetchAddOnProducts() {
  try {
    const data = await fetchApi<any[]>("/api/rates/services/");
    return data.map((s: any) => {
      const template = db.addOnProducts.find((tp) => tp.id === s.id) || db.addOnProducts[0];
      return {
        ...template,
        id: s.id,
        name: s.name,
        price: Number(s.price || 0),
        category: s.category,
        isService: true,
        status: s.is_active !== false ? "Active" : "Inactive",
      };
    });
  } catch (e) {
    console.error("Failed to fetch services from API", e);
    return db.addOnProducts;
  }
}
export async function fetchConciergeRequests() {
  await delay();
  return db.conciergeRequests;
}
export async function fetchTransportTrips() {
  await delay();
  return db.transportTrips;
}
export async function fetchActivitySlots() {
  await delay();
  return db.activitySlots;
}
export async function fetchPortfolioProperties() {
  await delay();
  return db.portfolioProperties;
}
export async function fetchAIRevenueDashboard() {
  await delay();
  return db.aiRevenueDashboard;
}
export async function fetchMealPlans() {
  try {
    const data = await fetchApi<any[]>("/api/rates/meal-plans/");
    return data.map((m: any) => ({
      id: m.id,
      code: m.code as "EP" | "CP" | "MAP" | "AP" | "AI" | "UAI",
      name: m.name,
      description: m.description || "",
      includedMeals: m.included_meals || [],
      taxPercent: Number(m.tax_percent || 0),
      priceAdjustment: Number(m.price_adjustment || 0),
      status: (m.is_active !== false ? "Active" : "Inactive") as "Active" | "Inactive",
    }));
  } catch (e) {
    console.error("Failed to fetch meal plans from API, falling back to mock", e);
    return db.mealPlans;
  }
}
export async function fetchRatePlans() {
  try {
    const data = await fetchApi<any[]>("/api/rates/rate-plans/");
    return data.map((r: any) => {
      const template = db.ratePlans.find((tp) => tp.externalRatePlanCode === r.code) || db.ratePlans[0];
      return {
        ...template,
        id: r.id,
        externalRatePlanCode: r.code || template.externalRatePlanCode,
        name: r.name || template.name,
        description: r.description || template.description,
        discountPercent: Number(r.discount_percentage || r.discountPercent || 0),
        status: (r.is_active ? "Active" : "Inactive") as "Active" | "Inactive" | "Draft",
        roomTypeIds: r.room_types || template.roomTypeIds || [],
      };
    });
  } catch (e) {
    console.error("Failed to fetch rate plans from API", e);
    return db.ratePlans;
  }
}

export async function saveRatePlans(plans: typeof db.ratePlans) {
  await delay(40);
  if (typeof window !== "undefined") {
    localStorage.setItem(RATE_PLANS_KEY, JSON.stringify(plans));
  }
  return plans;
}

export async function fetchRatePlanVersions() {
  await delay();
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(RATE_PLAN_VERSIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendRatePlanVersion(version: unknown) {
  await delay(40);
  const existing = await fetchRatePlanVersions();
  const next = [version, ...existing];
  if (typeof window !== "undefined") {
    localStorage.setItem(RATE_PLAN_VERSIONS_KEY, JSON.stringify(next.slice(0, 200)));
  }
  return next;
}

function readStoredArray<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredArray(key: string, value: unknown[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export async function fetchTaxComponents() {
  await delay();
  return readStoredArray(TAX_COMPONENTS_KEY, db.taxComponents);
}

export async function saveTaxComponents(components: typeof db.taxComponents) {
  await delay(40);
  writeStoredArray(TAX_COMPONENTS_KEY, components);
  return components;
}

export async function fetchTaxGroups() {
  await delay();
  return readStoredArray(TAX_GROUPS_KEY, db.taxGroups);
}

export async function saveTaxGroups(groups: typeof db.taxGroups) {
  await delay(40);
  writeStoredArray(TAX_GROUPS_KEY, groups);
  return groups;
}

export async function fetchTaxAssignments() {
  await delay();
  return readStoredArray(TAX_ASSIGNMENTS_KEY, db.taxAssignments);
}

export async function saveTaxAssignments(assignments: typeof db.taxAssignments) {
  await delay(40);
  writeStoredArray(TAX_ASSIGNMENTS_KEY, assignments);
  return assignments;
}

export async function fetchAvailabilityCells() {
  await delay();
  return readStoredArray(AVAILABILITY_CELLS_KEY, db.availabilityCells);
}

export async function saveAvailabilityCells(cells: typeof db.availabilityCells) {
  await delay(40);
  writeStoredArray(AVAILABILITY_CELLS_KEY, cells);
  return cells;
}

export async function fetchRatePlanPolicies() {
  await delay();
  return db.ratePlanPolicies;
}
export async function fetchHotelPackages() {
  try {
    const data = await fetchApi<any[]>("/api/rates/packages/");
    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      basePrice: Number(p.base_price || 0),
      status: (p.is_active ? "Active" : "Inactive") as "Active" | "Inactive" | "Draft",
    }));
  } catch (e) {
    console.error("Failed to fetch packages from API", e);
    return db.hotelPackages;
  }
}
export async function fetchPackageItems() {
  await delay();
  return db.packageItems;
}
export async function fetchOccupancyPricingRules() {
  await delay();
  return db.occupancyPricingRules;
}
export async function fetchFrontDeskWorkflowReservations() {
  await delay();
  const dynamic = typeof window !== "undefined" ? readSubmittedReservation() : null;
  if (!dynamic) return db.frontDeskWorkflowReservations;
  return [dynamic, ...db.frontDeskWorkflowReservations.filter((r) => r.id !== dynamic.id)];
}
export async function fetchFrontDeskArrivalQueue() {
  await delay();
  return (await fetchFrontDeskWorkflowReservations()).filter((r) =>
    ["pre_arrival", "pending_id", "pending_payment", "room_assigned"].includes(r.frontDeskStatus),
  );
}
export async function fetchFrontDeskCheckoutQueue() {
  await delay();
  return (await fetchFrontDeskWorkflowReservations()).filter((r) =>
    ["checkout_due", "checkout_in_progress"].includes(r.frontDeskStatus),
  );
}

export async function fetchWebsiteBuilderWorkspace() {
  await delay();
  const raw = typeof window !== "undefined" ? localStorage.getItem(WB_WORKSPACE_KEY) : null;
  if (!raw) return db.websiteBuilderWorkspace;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.id || !Array.isArray(parsed?.pages)) return db.websiteBuilderWorkspace;
    return parsed;
  } catch {
    return db.websiteBuilderWorkspace;
  }
}

export async function saveWebsiteBuilderWorkspace(workspace: unknown) {
  await delay(40);
  if (typeof window !== "undefined") {
    localStorage.setItem(WB_WORKSPACE_KEY, JSON.stringify(workspace));
  }
  return workspace;
}


export async function fetchWebsiteBuilderApprovals() {
  await delay();
  const raw = typeof window !== "undefined" ? localStorage.getItem(WB_APPROVALS_KEY) : null;
  if (!raw) return db.websiteBuilderApprovals;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return db.websiteBuilderApprovals;
    return parsed;
  } catch {
    return db.websiteBuilderApprovals;
  }
}

export async function saveWebsiteBuilderApprovals(approvals: unknown) {
  await delay(40);
  if (typeof window !== "undefined") {
    localStorage.setItem(WB_APPROVALS_KEY, JSON.stringify(approvals));
  }
  return approvals;
}

export async function fetchWebsiteBuilderPublishHistory() {
  await delay();
  const raw = typeof window !== "undefined" ? localStorage.getItem(WB_PUBLISH_KEY) : null;
  if (!raw) return db.websiteBuilderPublishHistory;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return db.websiteBuilderPublishHistory;
    return parsed;
  } catch {
    return db.websiteBuilderPublishHistory;
  }
}

export async function saveWebsiteBuilderPublishHistory(history: unknown) {
  await delay(40);
  if (typeof window !== "undefined") {
    localStorage.setItem(WB_PUBLISH_KEY, JSON.stringify(history));
  }
  return history;
}

function readSubmittedReservation(): FrontDeskWorkflowReservation | null {
  try {
    const raw = localStorage.getItem(SUBMITTED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      createdAt: string;
      type: ReservationType;
      form: {
        fullName: string;
        roomType: string;
        checkIn: string;
        checkOut: string;
        nights?: number;
        source: string;
        adults: string;
        notes?: string;
        groupName?: string;
        groupRooms?: string;
        corporateCompany?: string;
        corporatePoRef?: string;
        packageName?: string;
        walkinDeposit?: string;
        walkinVehicleNo?: string;
        eventType?: string;
        eventVenue?: string;
        eventOrganizer?: string;
        eventContact?: string;
      };
    };
    if (!parsed?.form?.fullName) return null;

    const checkIn = parsed.form.checkIn || new Date().toISOString().slice(0, 10);
    const checkOut = parsed.form.checkOut || checkIn;
    const nights = Math.max(1, Number(parsed.form.nights ?? 1));
    const amountSeed: Record<ReservationType, number> = {
      individual: 12000,
      group: 180000,
      corporate: 24000,
      package: 28000,
      walkin: 9500,
      event: 96000,
    };
    const amount = amountSeed[parsed.type] * nights;
    const reservationId = `RES-${new Date(parsed.createdAt).getTime().toString().slice(-4)}`;
    const room = parsed.type === "event" ? "BANQ-1" : "TBD";

    const base: FrontDeskWorkflowReservation = {
      id: reservationId,
      guest: parsed.form.fullName,
      room,
      type: parsed.form.roomType || "Deluxe King",
      ci: checkIn,
      co: checkOut,
      nights,
      amount,
      status: "Confirmed",
      source: parsed.form.source || "Direct",
      balance: 0,
      reservationType: parsed.type,
      frontDeskStatus: "pre_arrival",
      billingMode:
        parsed.type === "corporate"
          ? "direct_bill"
          : parsed.type === "group"
            ? "split"
            : "guest_pay",
      folioState: "open",
      checkinChecklist: [
        { key: "find_guest", label: "Find guest", done: true, required: true },
        { key: "verify_id", label: "Verify ID", done: false, required: true },
        { key: "assign_room", label: "Assign room", done: false, required: true },
        { key: "collect_payment", label: "Collect payment", done: false, required: true },
        { key: "issue_key", label: "Issue key", done: false, required: true },
      ],
      checkoutChecklist: [
        { key: "review_folio", label: "Review folio", done: false, required: true },
        { key: "return_key", label: "Return key", done: false, required: true },
        { key: "send_invoice", label: "Send invoice", done: false, required: true },
        { key: "handover_hk", label: "Handover to HK", done: false, required: true },
      ],
      blockerCodes: ["missing_id"],
    };

    if (parsed.type === "group") {
      base.groupMeta = {
        blockName: parsed.form.groupName || "New Group Block",
        blockedRooms: Number(parsed.form.groupRooms || 0),
        pickedUpRooms: 0,
        roomingListReady: false,
        settlementMode: "master",
      };
    }
    if (parsed.type === "corporate") {
      base.corporateMeta = {
        company: parsed.form.corporateCompany || "Corporate Account",
        poRef: parsed.form.corporatePoRef || "",
      };
      if (!parsed.form.corporatePoRef) base.blockerCodes.push("pending_po");
    }
    if (parsed.type === "package") {
      base.packageMeta = {
        packageName: parsed.form.packageName || "Selected Package",
        inclusions: ["Welcome amenity", "Inclusions as booked"],
        benefitsPosted: false,
      };
    }
    if (parsed.type === "walkin") {
      const deposit = Number(parsed.form.walkinDeposit || 0);
      base.walkinMeta = {
        idVerified: false,
        depositAmount: Number.isFinite(deposit) ? deposit : 0,
        vehicleNo: parsed.form.walkinVehicleNo || "",
      };
    }
    if (parsed.type === "event") {
      base.eventMeta = {
        eventName: parsed.form.eventType || "Event booking",
        venue: parsed.form.eventVenue || "Banquet",
        organizer: parsed.form.eventOrganizer || parsed.form.fullName,
        contact: parsed.form.eventContact || "",
        billingSplit: "venue_catering_av",
      };
    }
    return base;
  } catch {
    return null;
  }
}
