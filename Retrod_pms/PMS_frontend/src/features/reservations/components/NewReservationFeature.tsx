import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  User,
  Users,
  Building2,
  Gift,
  Footprints,
  CalendarClock,
  CheckCircle2,
  Mail,
  Phone,
  CreditCard,
  Plus,
  X,
  Camera,
  CalendarDays,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { reservationsApi } from "@/services/api/reservations";
import { fetchApi } from "@/services/api/core";
import { PageHeader, Card, CardHeader, Button, StatusBadge } from "@/components/ui/Primitives";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { createWorker } from "tesseract.js";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useMealPlansQuery,
  useRatePlansQuery,
  useHotelPackagesQuery,
  useAddOnProductsQuery,
  useOccupancyPricingRulesQuery,
  useAvailabilityCellsQuery,
  useHousekeepingRoomsQuery,
  useSaveGroupBlockMutation,
  useAddToWaitlistMutation,
} from "@/services/mock/queries";
import {
  eligibilityHint,
  filterEligibleRatePlans,
  type ReservationTypeForRates,
} from "@/features/rate-plans/lib/eligibility";
import PaymentGatewayModal from "./PaymentGatewayModal";
import {
  availabilityBlockReason,
  listBookableRoomTypes,
  getStayDates,
} from "@/features/availability/lib/eligibility";
import type { ReservationPricingBreakdown, RatePlan, AvailabilityCell } from "@/types/pms";
import { CameraCaptureModal } from "./CameraCaptureModal";

const types = [
  { id: "individual", label: "Individual", icon: User, hint: "Single guest or family" },
  { id: "group", label: "Group", icon: Users, hint: "Block of rooms · rooming list" },
  { id: "corporate", label: "Corporate", icon: Building2, hint: "Negotiated rate · direct bill" },
  { id: "event", label: "Event / Banquet", icon: CalendarClock, hint: "Venue + catering + AV" },
] as const;

type T = (typeof types)[number]["id"];

type ReservationFormData = {
  fullName: string;
  nationality: string;
  email: string;
  phone: string;
  address: string;
  idType: string;
  idNumber: string;
  idProofFilename?: string;
  idProofPreviewUrl?: string;
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
  selectedPackageId: string;
  addOnSelections: Array<{
    id: string;
    quantity: number;
    scheduledTime?: string;
    isComplimentary: boolean;
  }>;
  dynamicPricingPct: string;
  source: string;
  specialRequests: string[];
  notes: string;
  groupName: string;
  groupCompany: string;
  groupContact: string;
  groupPickupTarget: string;
  groupPickupLocation: string;
  groupRooms: string;
  groupCutoffDate: string;
  groupMealPlan: string;
  corporateCompany: string;
  corporateAccountId: string;
  couponCode: string;
  paymentMethod: string;
  paidAmount: string;
  paymentRemark: string;
  includeTax: boolean;
  corporatePoRef: string;
  corporateBilling: string;
  corporateGuestId: string;
  corporateCostCenter: string;
  corporateGst: string;
  corporateTravelPurpose: string;
  packageName: string;
  packageOccasion: string;
  packageInclusionNotes: string;
  walkinPayment: string;
  walkinIdVerified: boolean;
  walkinVehicleNo: string;
  walkinDeposit: string;
  eventVenue: string;
  eventType: string;
  eventStartDate: string;
  eventEndDate: string;
  eventPax: string;
  eventStart: string;
  eventEnd: string;
  eventOrganizer: string;
  eventContact: string;
  eventOrganizerEmail: string;
  eventOrganizerAddress: string;
  eventSeatingStyle: string;
  eventCateringMenu: string;
  eventAvRequirements: string[];
  eventDecorNotes: string;
  sendEmail: boolean;
  sendSms: boolean;
  preAuthCard: boolean;
};

const DRAFT_KEY = "retrod:new-reservation:draft:v1";
const SUBMITTED_KEY = "retrod:new-reservation:last-submitted:v1";

const initialFormData: ReservationFormData = {
  fullName: "",
  nationality: "",
  email: "",
  phone: "",
  address: "",
  idType: "Passport",
  idNumber: "",
  checkIn: "",
  checkInTime: "12:00 PM",
  checkOut: "",
  checkOutTime: "11:00 AM",
  adults: "2",
  children: "0",
  roomSelections: [],
  selectedPackageId: "",
  addOnSelections: [],
  dynamicPricingPct: "0",
  source: "Direct",
  specialRequests: [],
  notes: "",
  groupName: "",
  groupCompany: "",
  groupContact: "",
  groupPickupTarget: "",
  groupPickupLocation: "",
  groupRooms: "",
  groupCutoffDate: "",
  groupMealPlan: "Breakfast",
  corporateCompany: "",
  corporateAccountId: "",
  couponCode: "",
  paymentMethod: "",
  paidAmount: "",
  paymentRemark: "",
  includeTax: true,
  corporatePoRef: "",
  corporateBilling: "Direct bill to company (City Ledger)",
  corporateGuestId: "",
  corporateCostCenter: "",
  corporateGst: "",
  corporateTravelPurpose: "",
  packageName: "",
  packageOccasion: "",
  packageInclusionNotes: "",
  walkinPayment: "Cash",
  walkinIdVerified: false,
  walkinVehicleNo: "",
  walkinDeposit: "",
  eventVenue: "",
  eventType: "",
  eventStartDate: "",
  eventEndDate: "",
  eventPax: "",
  eventStart: "",
  eventEnd: "",
  eventOrganizer: "",
  eventContact: "",
  eventOrganizerEmail: "",
  eventOrganizerAddress: "",
  eventSeatingStyle: "",
  eventCateringMenu: "Standard Buffet",
  eventAvRequirements: [],
  eventDecorNotes: "",
  sendEmail: true,
  sendSms: true,
  preAuthCard: false,
};

function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  if (Number.isNaN(ci.getTime()) || Number.isNaN(co.getTime())) return 0;
  return Math.max(0, Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)));
}

function estimateTotal(type: T, data: ReservationFormData, nights: number) {
  // Uses a generic fallback; real pricing comes from backend estimate API
  const defaultRate = 3000;
  if (type === "event") return (Number(data.eventPax) || 0) * 2800;
  if (type === "group") return 0;
  const nightly = data.roomSelections.reduce((acc, rs) => acc + defaultRate * Math.max(1, rs.assignedRooms.length), 0);
  return nightly * Math.max(1, nights);
}

function calculatePricingBreakdown(input: {
  type: T;
  nights: number;
  roomSelections: Array<{
    roomType: string;
    assignedRooms: string[];
    ratePlan: string;
    mealPlan: string;
    occupancyType: string;
  }>;
  selectedPackageId: string;
  addOnSelections: Array<{
    id: string;
    quantity: number;
    scheduledTime?: string;
    isComplimentary: boolean;
  }>;
  dynamicPricingPct: number;
  adults: number;
  children: number;
  mealPlans: Array<{ id: string; priceAdjustment: number; taxPercent: number }>;
  ratePlans: Array<{ id: string; discountPercent: number }>;
  hotelPackages: Array<{ id: string; basePrice: number }>;
  addOnProducts: Array<{ id: string; price: number }>;
  includeTax: boolean;
  occupancyRules: Array<{
    occupancyType: string;
    multiplier: number;
  }>;
  ratePlanInventories?: Array<any>;
  unitTypes?: Array<any>;
  taxComponents?: Array<any>;
}): ReservationPricingBreakdown {
  
  const stayUnits = Math.max(1, input.nights);
  let roomRate = 0;
  let mealPlanCharges = 0;
  let ratePlanDiscountAmount = 0;

  if (input.type === "event") {
    roomRate = 2800 * stayUnits;
  } else {
    input.roomSelections.forEach((rs) => {
      // Dynamically resolve base rate from ratePlanInventories
      let baseNightly = 3000; // fallback
      if (input.ratePlanInventories && input.unitTypes) {
        const ut = input.unitTypes.find((u: any) => u.name === rs.roomType || u.id === rs.roomType);
        if (ut) {
          const rpi = input.ratePlanInventories.find(
            (item: any) => item.inventory_unit_type === ut.id && item.rate_plan === rs.ratePlan
          ) || input.ratePlanInventories.find(
            (item: any) => item.inventory_unit_type === ut.id
          );
          if (rpi) baseNightly = parseFloat(rpi.base_rate) || 3000;
        }
      }
      const count = Math.max(1, rs.assignedRooms.length);
      const occupancyMultiplier = input.occupancyRules.find((rule) => rule.occupancyType === rs.occupancyType)?.multiplier ?? 1;
      const roomBase = Math.round(baseNightly * stayUnits * occupancyMultiplier) * count;
      roomRate += roomBase;

      const mealPlan = input.mealPlans.find((item) => item.id === rs.mealPlan);
      let roomMealCharges = 0;
      if (mealPlan) {
        roomMealCharges = Math.round((mealPlan.priceAdjustment ?? 0) * stayUnits * occupancyMultiplier) * count;
        mealPlanCharges += roomMealCharges;
      }

      const ratePlanDiscountPct = input.ratePlans.find((item) => item.id === rs.ratePlan)?.discountPercent ?? 0;
      ratePlanDiscountAmount += Math.round(((roomBase + roomMealCharges) * ratePlanDiscountPct) / 100);
    });
  }

  const selectedPackage = input.hotelPackages.find((item) => item.id === input.selectedPackageId);
  const packageCharges = Math.round((selectedPackage?.basePrice ?? 0) * stayUnits);

  const addOnCharges = input.addOnSelections.reduce((sum, selection) => {
    if (selection.isComplimentary) return sum;
    const product = input.addOnProducts.find((item) => item.id === selection.id);
    return sum + (product?.price ?? 0) * selection.quantity;
  }, 0);

  const extraAdults = Math.max(0, input.adults - 2);
  const extraChildren = Math.max(0, input.children);
  const extraGuestCharges = extraAdults * 1800 * stayUnits + extraChildren * 900 * stayUnits;

  const subtotalBeforeRatePlan = roomRate + mealPlanCharges + packageCharges + addOnCharges + extraGuestCharges;
  const subtotalAfterRatePlan = subtotalBeforeRatePlan - ratePlanDiscountAmount;
  const dynamicPricingAmount = Math.round((subtotalAfterRatePlan * input.dynamicPricingPct) / 100);

  const taxableBase = subtotalAfterRatePlan + dynamicPricingAmount;

  // DYNAMIC TAX CALCULATION FROM DATABASE TAX COMPONENTS
  const perNightTariff = roomRate / Math.max(1, stayUnits);
  let totalTaxAmount = 0;
  let appliedTaxRate = 0;
  let taxLabelName = "";

  const activeTaxes = (input.taxComponents || []).filter(
    (t: any) => (t.status || "").toLowerCase() === "active" || t.is_active === true
  );

  if (activeTaxes.length > 0) {
    activeTaxes.forEach((t: any) => {
      const minVal = t.min_tariff != null ? Number(t.min_tariff) : (t.gstSlabMin != null ? Number(t.gstSlabMin) : null);
      const maxVal = t.max_tariff != null ? Number(t.max_tariff) : (t.gstSlabMax != null ? Number(t.gstSlabMax) : null);

      const minPass = minVal == null || perNightTariff >= minVal;
      const maxPass = maxVal == null || maxVal === 0 || perNightTariff <= maxVal;

      if (minPass && maxPass) {
        const ratePct = Number(t.percentage ?? t.ratePercent ?? t.rate ?? 0);
        const flatAmt = Number(t.flat_amount ?? t.flatAmount ?? 0);
        const base = t.calculation_base || t.calculationBase || "room_tariff";

        if (base === "per_night" || base === "flat") {
          totalTaxAmount += flatAmt * stayUnits;
        } else if (base === "per_guest_night") {
          const guestCount = input.adults + input.children;
          totalTaxAmount += flatAmt * stayUnits * Math.max(1, guestCount);
        } else {
          appliedTaxRate += ratePct;
          totalTaxAmount += Math.round((taxableBase * ratePct) / 100);
        }
        if (t.name) taxLabelName = t.name;
      }
    });
  }

  const taxes = input.includeTax ? Math.round(totalTaxAmount) : 0;
  const total = taxableBase + taxes;

  const displayTaxLabel = taxLabelName || (appliedTaxRate > 0 ? `GST Tax (${appliedTaxRate}%)` : "GST Tax");

  return {
    roomRate,
    mealPlanCharges,
    packageCharges,
    addOnCharges,
    taxes,
    extraGuestCharges,
    total,
    lines: [
      { label: "Room charges", amount: roomRate },
      ...(mealPlanCharges > 0 ? [{ label: "Meal plan charges", amount: mealPlanCharges }] : []),
      ...(packageCharges > 0 ? [{ label: "Package charges", amount: packageCharges }] : []),
      ...(addOnCharges > 0 ? [{ label: "Add-on charges", amount: addOnCharges }] : []),
      ...(extraGuestCharges > 0 ? [{ label: "Extra guest charges", amount: extraGuestCharges }] : []),
      ...(ratePlanDiscountAmount > 0 ? [{ label: "Rate plan discount", amount: -ratePlanDiscountAmount }] : []),
      ...(dynamicPricingAmount !== 0 ? [{ label: "Dynamic pricing", amount: dynamicPricingAmount }] : []),
      { label: displayTaxLabel, amount: taxes },
    ],
  };
}

function validate(
  data: ReservationFormData,
  type: T,
  mode: "draft" | "confirm",
): Record<string, string> {
  const errors: Record<string, string> = {};

  // Draft validation: minimum viable capture.
  if (type === "event") {
    if (!data.eventOrganizer?.trim() && !data.fullName?.trim()) {
      errors.eventOrganizer = "Organizer name is required.";
    }
    if (!data.eventContact?.trim() && !data.phone?.trim()) {
      errors.eventContact = "Organizer contact is required.";
    }
    if (!data.eventStartDate) errors.eventStartDate = "Event start date is required.";
    if (!data.eventEndDate) errors.eventEndDate = "Event end date is required.";
  } else {
    if (!data.fullName.trim()) errors.fullName = "Guest name is required.";
    if (!data.phone.trim()) errors.phone = "Phone is required.";
    if (!data.checkIn) errors.checkIn = "Check-in date is required.";
    if (!data.checkOut) errors.checkOut = "Check-out date is required.";
    if (data.roomSelections.length === 0) errors.roomSelections = "Add at least one room.";
  }

  if (mode === "draft") {
    if (type !== "event" && data.checkIn && data.checkOut && nightsBetween(data.checkIn, data.checkOut) < 1) {
      errors.checkOut = "Check-out must be after check-in.";
    }
    return errors;
  }

  // Confirm validation: production-grade rule set.
  if (type !== "event") {
    if (data.roomSelections.length > 0) {
      if (data.roomSelections.some(rs => !rs.ratePlan)) errors.roomSelections = "Select a rate plan for all rooms.";
      if (data.roomSelections.some(rs => !rs.mealPlan)) errors.roomSelections = "Select a meal plan for all rooms.";
    }
    if (!data.source?.trim()) errors.source = "Booking source is required.";
    if (Number(data.adults || 0) < 1) errors.adults = "At least one adult is required.";
    if (data.checkIn && data.checkOut && nightsBetween(data.checkIn, data.checkOut) < 1) {
      errors.checkOut = "Check-out must be after check-in.";
    }
  }

  if (type === "event" && data.eventStartDate && data.eventEndDate && data.eventEndDate < data.eventStartDate) {
    errors.eventEndDate = "Departure date cannot be before start date.";
  }

  if (!data.sendEmail && !data.sendSms) {
    errors.confirmation = "Enable at least one confirmation channel (Email or SMS).";
  }

  if (type === "group" && !data.groupName.trim()) errors.groupName = "Group name is required.";
  if (type === "group" && !data.groupContact.trim()) {
    errors.groupContact = "Group contact is required for confirmation.";
  }
  if (type === "corporate" && !data.corporateCompany.trim()) {
    errors.corporateCompany = "Company is required for corporate booking.";
  }
  if (type === "corporate" && !data.corporateBilling.trim()) {
    errors.corporateBilling = "Billing mode is required for corporate booking.";
  }
  if (
    type === "corporate" &&
    data.corporateBilling.includes("Direct bill") &&
    !data.corporatePoRef.trim()
  ) {
    errors.corporatePoRef = "PO / Reference is required for direct billing.";
  }
  if (type === "package" && !data.packageName) errors.packageName = "Select a package.";
  if (type === "walkin" && !data.walkinPayment.trim()) {
    errors.walkinPayment = "Payment method is required for walk-in reservation.";
  }
  if (type === "event") {
    if (!data.eventVenue) errors.eventVenue = "Venue is required.";
    if (!data.eventType) errors.eventType = "Event type is required.";
    if (!data.eventStartDate) errors.eventStartDate = "Start date is required.";
    if (!data.eventEndDate) errors.eventEndDate = "End date is required.";
    if (Number(data.eventPax || 0) < 1) errors.eventPax = "Expected pax is required.";
    if (!data.eventOrganizer?.trim() && !data.fullName?.trim()) errors.eventOrganizer = "Organizer name is required.";
    if (!data.eventContact?.trim() && !data.phone?.trim()) errors.eventContact = "Organizer contact is required.";
  }
  return errors;
}

export function NewReservationFeature() {
  const navigate = useNavigate();
  const saveGroupBlock = useSaveGroupBlockMutation();
  const addToWaitlistMutation = useAddToWaitlistMutation();
  const { data: mealPlans = [] } = useMealPlansQuery();
  const { data: ratePlans = [] } = useRatePlansQuery();
  const { data: hotelPackages = [] } = useHotelPackagesQuery();
  const { data: addOnProducts = [] } = useAddOnProductsQuery();
  const { data: occupancyRules = [] } = useOccupancyPricingRulesQuery();
  const { data: availabilityCells = [] } = useAvailabilityCellsQuery();
  const { data: mockHousekeepingRooms = [] } = useHousekeepingRoomsQuery();
  const [dbUnits, setDbUnits] = useState<any[]>([]);
  const [dbReservations, setDbReservations] = useState<any[]>([]);
  const [type, setType] = useState<T>("individual");
  const [form, setForm] = useState<ReservationFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [isPriceEstimating, setIsPriceEstimating] = useState(false);
  const [corporateAccounts, setCorporateAccounts] = useState<any[]>([]);

  const [eventRangePopoverOpen, setEventRangePopoverOpen] = useState(false);
  const [eventTempRange, setEventTempRange] = useState<any>(undefined);
  const [eventStartTimeHour, setEventStartTimeHour] = useState("12");
  const [eventStartTimeMin, setEventStartTimeMin] = useState("00");
  const [eventStartTimePeriod, setEventStartTimePeriod] = useState("PM");
  const [eventEndTimeHour, setEventEndTimeHour] = useState("11");
  const [eventEndTimeMin, setEventEndTimeMin] = useState("00");
  const [eventEndTimePeriod, setEventEndTimePeriod] = useState("AM");

  const [activePaymentGateway, setActivePaymentGateway] = useState<{ gateway: string; amount: number } | null>(null);
  const [paymentGatewayStatus, setPaymentGatewayStatus] = useState<"idle" | "processing" | "success" | "failure">("idle");
  const [gatewayTxnId, setGatewayTxnId] = useState("");

  const handleApplyEventDateRange = () => {
    if (eventTempRange?.from) {
      setField("eventStartDate", format(eventTempRange.from, "yyyy-MM-dd"));
    } else {
      setField("eventStartDate", "");
    }
    if (eventTempRange?.to) {
      setField("eventEndDate", format(eventTempRange.to, "yyyy-MM-dd"));
    } else {
      setField("eventEndDate", "");
    }
    setField("eventStart", `${eventStartTimeHour.padStart(2, "0")}:${eventStartTimeMin} ${eventStartTimePeriod}`);
    setField("eventEnd", `${eventEndTimeHour.padStart(2, "0")}:${eventEndTimeMin} ${eventEndTimePeriod}`);
    setEventRangePopoverOpen(false);
  };

  const handleOpenEventDateRangePopover = () => {
    setEventTempRange({
      from: form.eventStartDate ? new Date(form.eventStartDate) : undefined,
      to: form.eventEndDate ? new Date(form.eventEndDate) : undefined,
    });
    if (form.eventStart) {
      const parts = form.eventStart.split(":");
      if (parts.length === 2) {
        const hPart = parseInt(parts[0]);
        const minPartAndPeriod = parts[1].trim().split(" ");
        if (minPartAndPeriod.length === 2) {
          setEventStartTimeHour(String(hPart));
          setEventStartTimeMin(minPartAndPeriod[0]);
          setEventStartTimePeriod(minPartAndPeriod[1]);
        }
      }
    }
    if (form.eventEnd) {
      const parts = form.eventEnd.split(":");
      if (parts.length === 2) {
        const hPart = parseInt(parts[0]);
        const minPartAndPeriod = form.eventEnd.split(":")[1].trim().split(" ");
        if (minPartAndPeriod.length === 2) {
          setEventEndTimeHour(String(hPart));
          setEventEndTimeMin(minPartAndPeriod[0]);
          setEventEndTimePeriod(minPartAndPeriod[1]);
        }
      }
    }
    setEventRangePopoverOpen(true);
  };

  const parseTextLocally = (extractedText: string) => {
    const details = {
      first_name: "",
      last_name: "",
      nationality: "Indian",
      document_type: "NATIONAL_ID",
      document_number: "",
      expiry_date: null as string | null,
      phone: "",
      email: "",
      address: "",
    };

    const textUpper = extractedText.toUpperCase();

    // 1. Document Type Detection
    if (textUpper.includes("PASSPORT") || textUpper.includes("REPUBLIC OF INDIA")) {
      details.document_type = "PASSPORT";
    } else if (textUpper.includes("DRIV") || textUpper.includes("LICENSE") || textUpper.includes("LICENCE")) {
      details.document_type = "DRIVING_LICENCE";
    } else {
      details.document_type = "NATIONAL_ID";
    }

    // 2. Document Number Extraction
    const aadhaarMatch = extractedText.match(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b|\b\d{12}\b/);
    const panMatch = textUpper.match(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/);
    const passportMatch = textUpper.match(/\b[A-Z][0-9]{7}\b/);
    const dlMatch = textUpper.match(/\b[A-Z]{2}[-|\s]?[0-9]{2}[-|\s]?[0-9]{11}\b|\b[A-Z]{2}[0-9]{13,15}\b/);

    if (passportMatch) {
      details.document_number = passportMatch[0];
      details.document_type = "PASSPORT";
    } else if (aadhaarMatch) {
      details.document_number = aadhaarMatch[0].replace(/[\s-]/g, "");
      details.document_type = "NATIONAL_ID";
    } else if (panMatch) {
      details.document_number = panMatch[0];
      details.document_type = "NATIONAL_ID";
    } else if (dlMatch) {
      details.document_number = dlMatch[0];
      details.document_type = "DRIVING_LICENCE";
    }

    // 3. Name Extraction
    const nameMatch = extractedText.match(/(?:Name|NAME|नाम|Nom|NOM)\s*[:|-]?\s*([A-Za-z\s]+)/);
    const lines = extractedText.split("\n").map(l => l.trim()).filter(l => l);
    let dobLineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      const lineUpper = lines[i].toUpperCase();
      if (["DOB", "DATE OF BIRTH", "YEAR OF BIRTH", "जन्म तिथि", "FATHER", "S/O", "D/O", "W/O", "C/O"].some(x => lineUpper.includes(x))) {
        dobLineIdx = i;
        break;
      }
    }

    if (nameMatch) {
      const nameParts = nameMatch[1].trim().split("\n")[0].trim().split(/\s+/);
      if (nameParts.length > 0) {
        details.first_name = nameParts[0];
        if (nameParts.length > 1) {
          details.last_name = nameParts.slice(1).join(" ");
        }
      }
    } else if (dobLineIdx > 0) {
      const candidate = lines[dobLineIdx - 1];
      const candidateClean = candidate.replace(/[^A-Za-z\s]/g, "").trim();
      const words = candidateClean.split(/\s+/).filter(w => !["name", "holder", "government", "india"].includes(w.toLowerCase()));
      if (words.length >= 2) {
        details.first_name = words[0];
        details.last_name = words.slice(1).join(" ");
      }
    }

    if (!details.first_name) {
      const toMatch = extractedText.match(/(?:To|TO|To,)\s*\n\s*([A-Za-z\s]+)/i);
      if (toMatch) {
        const nameParts = toMatch[1].trim().split("\n")[0].trim().split(/\s+/);
        if (nameParts.length > 0) {
          details.first_name = nameParts[0];
          if (nameParts.length > 1) {
            details.last_name = nameParts.slice(1).join(" ");
          }
        }
      }
    }

    if (!details.first_name) {
      for (const line of lines.slice(0, 5)) {
        if (["GOVERNMENT", "INDIA", "AUTHORITY", "UNIQUE", "INCOME", "TAX", "REPUBLIC"].some(x => line.toUpperCase().includes(x))) {
          continue;
        }
        const words = line.split(/\s+/).filter(w => w && (w[0] === w[0].toUpperCase() || w === w.toUpperCase()));
        if (words.length >= 2 && words.length <= 4) {
          details.first_name = words[0];
          details.last_name = words.slice(1).join(" ");
          break;
        }
      }
    }

    if (!details.first_name) {
      details.first_name = "Extracted";
      details.last_name = "Guest";
    }

    // 4. Email Extraction
    const emailMatch = extractedText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    details.email = emailMatch ? emailMatch[0] : "";

    // 5. Phone Extraction
    const phoneMatch = extractedText.match(/(?:Mobile|Phone|Mob|Ph|Mobile No|Mobile:)\s*[:|-]?\s*([+0-9\s-]{10,15})/i);
    if (phoneMatch) {
      details.phone = phoneMatch[1].replace(/[^\d+]/g, "").trim();
    } else {
      const rawPhone = extractedText.match(/\b(?:[+]91|91)?[6-9]\d{9}\b/);
      details.phone = rawPhone ? rawPhone[0] : "";
    }

    // 6. Address Extraction
    const addrMatch = extractedText.match(/(?:Address|ADDRESS|Add|ADD)\s*[:|-]\s*([\s\S]*?)(?=\b\d{6}\b)/i);
    if (addrMatch) {
      let addrText = addrMatch[1].trim();
      const pinMatch = extractedText.match(/\b\d{6}\b/);
      if (pinMatch) {
        addrText += " - " + pinMatch[0];
      }
      addrText = addrText.replace(/Details\s+on\s*:\s*\d{2}\/\d{2}\/\d{4}/gi, "");
      addrText = addrText.replace(/^[:\-\s,|]+|[:\-\s,|]+$/g, "");
      details.address = addrText.replace(/\s+/g, " ").trim();
    } else {
      const pinMatch = extractedText.match(/\b\d{6}\b/);
      if (pinMatch) {
        const pinIdx = extractedText.indexOf(pinMatch[0]);
        const preText = extractedText.substring(Math.max(0, pinIdx - 250), pinIdx).trim();
        const addrLines = preText.split("\n").map(l => l.trim()).filter(l => l);
        const lastLines = addrLines.slice(-4);
        if (lastLines.length > 0) {
          details.address = lastLines.join(", ") + " - " + pinMatch[0];
        }
      }
    }

    return details;
  };

  const runLocalOcr = async (file: File): Promise<any> => {
    const worker = await createWorker("eng");
    try {
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      return parseTextLocally(text);
    } catch (e) {
      try {
        await worker.terminate();
      } catch {}
      throw e;
    }
  };

  const handleExtractDetails = async (fileToParse?: File) => {
    const targetFile = fileToParse || uploadedFile;
    if (!targetFile) {
      toast.error("Please upload a document first.");
      return;
    }
    
    setIsOcrLoading(true);
    setOcrError(null);
    let toastId = toast.loading("Processing document... (AI/OCR)");
    
    try {
      let result: any = null;
      let usedLocal = false;

      const isImage = !targetFile.name.toLowerCase().endsWith(".pdf") && (targetFile.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp)$/i.test(targetFile.name));

      if (isImage) {
        toast.dismiss(toastId);
        toastId = toast.loading("Attempting fast local OCR...");
        
        const localTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("LocalOcrTimeout")), 5000)
        );

        try {
          result = await Promise.race([
            runLocalOcr(targetFile),
            localTimeoutPromise
          ]);
          usedLocal = true;
        } catch (localErr: any) {
          toast.dismiss(toastId);
          toastId = toast.loading("Local OCR timed out or failed. Falling back to backend parser...");
        }
      }

      if (!result) {
        const formData = new FormData();
        formData.append("document_file", targetFile);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 30000)
        );

        result = await Promise.race([
          fetchApi<any>("/api/crm/guests/parse-document/", {
            method: "POST",
            body: formData,
          }),
          timeoutPromise
        ]) as any;
      }

      toast.dismiss(toastId);
      setIsOcrLoading(false);

      if (result) {
        const lookupType = result.document_type || "NATIONAL_ID";
        const matchingDocTypeObj = (documentTypes || []).find(dt => {
          const nameUpper = dt.name.toUpperCase();
          if (lookupType === "PASSPORT" && nameUpper.includes("PASSPORT")) return true;
          if (lookupType === "NATIONAL_ID" && (nameUpper.includes("NATIONAL") || nameUpper.includes("AADHAAR") || nameUpper.includes("PAN") || nameUpper.includes("ID"))) return true;
          if (lookupType === "DRIVING_LICENCE" && (nameUpper.includes("DRIV") || nameUpper.includes("LICEN") || nameUpper.includes("LICEC"))) return true;
          return false;
        });
        
        setForm((prev) => ({
          ...prev,
          fullName: (result.first_name + " " + (result.last_name !== "Guest" && result.last_name ? result.last_name : "")).trim() || prev.fullName,
          idNumber: result.document_number || prev.idNumber,
          idType: matchingDocTypeObj?.id || prev.idType,
          nationality: result.nationality || prev.nationality,
          email: result.email || prev.email,
          phone: result.phone || prev.phone,
          address: result.address || prev.address,
        }));
        
        setGuestSearchQuery((result.first_name + " " + (result.last_name !== "Guest" && result.last_name ? result.last_name : "")).trim());
        toast.success(usedLocal ? "Guest details extracted locally!" : "Guest details extracted successfully!");
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      setIsOcrLoading(false);
      
      if (err.message === "Timeout") {
        toast.warning("Extraction took too long. Please enter details manually.");
        setOcrError("Extraction timed out (20s). Please fill details manually.");
      } else {
        toast.error("Failed to extract details. Please enter manually.");
        setOcrError("Failed to parse document. Please fill details manually.");
      }
    }
  };

  // Dynamic state for dropdowns and auto-suggest
  const [dbTaxComponents, setDbTaxComponents] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [couponsList, setCouponsList] = useState<any[]>([]);
  const [unitTypes, setUnitTypes] = useState<any[]>([]);
  const [guestSuggestions, setGuestSuggestions] = useState<any[]>([]);
  const [nationalitiesList, setNationalitiesList] = useState<any[]>([]);
  const [guestSearchQuery, setGuestSearchQuery] = useState("");
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<any>(null);
  const [dbMealPlans, setDbMealPlans] = useState<any[]>([]);
  const [dbMealPlanPrices, setDbMealPlanPrices] = useState<any[]>([]);
  const [dbOccupancyTypes, setDbOccupancyTypes] = useState<any[]>([]);
  const [ratePlanInventories, setRatePlanInventories] = useState<any[]>([]);
  const [dbBookingSources, setDbBookingSources] = useState<any[]>([]);
  const [dbGroupBlocks, setDbGroupBlocks] = useState<any[]>([]);

  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [draftRoomType, setDraftRoomType] = useState("");
  const [draftAssignedRooms, setDraftAssignedRooms] = useState<string[]>([]);
  const [draftRatePlan, setDraftRatePlan] = useState("");
  const [draftMealPlan, setDraftMealPlan] = useState("");
  const [draftOccupancyType, setDraftOccupancyType] = useState("double");

  const roomSpecificMealPlans = useMemo(() => {
    if (!draftRoomType || !unitTypes || unitTypes.length === 0) return [];
    const selectedUt = unitTypes.find((ut: any) => ut.id === draftRoomType);
    if (!selectedUt) return [];
    const prices = (dbMealPlanPrices || []).filter(
      (p: any) => p.inventory_unit_type === selectedUt.id
    );
    const list: any[] = [];
    prices.forEach((p: any) => {
      const mp = (dbMealPlans || []).find((m: any) => m.id === p.meal_plan);
      if (mp) {
        list.push({
          id: mp.id,
          code: mp.code,
          name: mp.name,
          priceAdjustment: Number(p.price),
          is_active: mp.is_active,
        });
      }
    });
    // Fallback: if no unit-type specific prices are found, return all active meal plans with 0 adjustment
    if (list.length === 0 && dbMealPlans && dbMealPlans.length > 0) {
      dbMealPlans
        .filter((mp: any) => mp.is_active !== false)
        .forEach((mp: any) => {
          list.push({
            id: mp.id,
            code: mp.code,
            name: mp.name,
            priceAdjustment: 0,
            is_active: mp.is_active,
          });
        });
    }
    return list;
  }, [draftRoomType, unitTypes, dbMealPlanPrices, dbMealPlans]);

  const handleSaveRoomSelection = () => {
    if (!draftRoomType || !draftMealPlan) return;
    const selectedUt = unitTypes.find((ut: any) => ut.id === draftRoomType);
    const newSelection = { 
      roomType: selectedUt ? selectedUt.name : draftRoomType, 
      assignedRooms: draftAssignedRooms,
      ratePlan: draftRatePlan || ratePlans[0]?.id || "",
      mealPlan: draftMealPlan,
      occupancyType: draftOccupancyType,
    };
    setField("roomSelections", [...form.roomSelections, newSelection]);
    setIsAddRoomOpen(false);
    setDraftRoomType("");
    setDraftAssignedRooms([]);
    setDraftRatePlan("");
    setDraftMealPlan("");
    setDraftOccupancyType("double");
  };

  const handleRemoveRoomSelection = (index: number) => {
    const newSelections = [...form.roomSelections];
    newSelections.splice(index, 1);
    setField("roomSelections", newSelections);
  };

  useEffect(() => {
    fetchApi("/api/reference/document-types/").then((data: any) => setDocumentTypes(data)).catch(console.error);
    fetchApi("/api/rates/packages/").then((data: any) => setPackagesList(data)).catch(console.error);
    fetchApi("/api/rates/services/").then((data: any) => setServicesList(data)).catch(console.error);
    fetchApi("/api/rates/coupons/").then((data: any) => setCouponsList(data)).catch(console.error);
    fetchApi("/api/inventory/types/").then((data: any) => setUnitTypes(data.results || data)).catch(console.error);
    fetchApi("/api/reference/nationalities/").then((data: any) => setNationalitiesList(data)).catch(console.error);
    fetchApi("/api/inventory/units/?limit=1000").then((data: any) => setDbUnits(data.results || data)).catch(console.error);
    fetchApi("/api/rates/meal-plans/").then((data: any) => setDbMealPlans(data.results || data)).catch(console.error);
    fetchApi("/api/rates/tenant-meal-plan-prices/").then((data: any) => setDbMealPlanPrices(data.results || data)).catch(console.error);
    fetchApi("/api/superadmin-occupancy-types/").then((data: any) => setDbOccupancyTypes(data.results || data)).catch(console.error);
    fetchApi("/api/rates/rate-plan-inventories/").then((data: any) => setRatePlanInventories(data.results || data)).catch(console.error);
    fetchApi("/api/superadmin-booking-sources/").then((data: any) => setDbBookingSources(data.results || data)).catch(console.error);
    fetchApi("/api/reservations/bookings/").then((data: any) => setDbReservations(data.results || data)).catch(console.error);
    fetchApi("/api/reservations/group-blocks/").then((data: any) => setDbGroupBlocks(data.results || data || [])).catch(console.error);
  }, []);

  const housekeepingRooms = useMemo(() => {
    if (dbUnits && dbUnits.length > 0 && unitTypes && unitTypes.length > 0) {
      return dbUnits.map((u: any) => {
        const ut = unitTypes.find((t) => t.id === u.inventory_unit_type);
        
        let isBooked = false;
        let isBlocked = false;
        if (form.checkIn && form.checkOut) {
          const checkInDate = form.checkIn;
          const checkOutDate = form.checkOut;
          
          isBooked = dbReservations.some((res: any) => {
            if (res.status === "CANCELLED" || res.status === "NO_SHOW") return false;
            return (res.room_allocations || []).some((alloc: any) => {
              if (alloc.inventory_unit !== u.id) return false;
              return alloc.check_in_date < checkOutDate && checkInDate < alloc.check_out_date;
            });
          });

          isBlocked = dbGroupBlocks.some((b: any) => {
            if (b.status === "CLOSED" || b.status === "CANCELLED") return false;
            if (b.block_type !== "Conference Block") return false;
            if (!b.start_date || !b.end_date || !b.pickup_location) return false;
            
            const overlaps = b.start_date < checkOutDate && checkInDate < b.end_date;
            if (!overlaps) return false;
            
            const blockedRooms = b.pickup_location.split(",");
            return blockedRooms.includes(u.name);
          });
        }

        // Room is also unavailable if it is in maintenance or OOO
        const isMaintenanceOrOOO = u.status === "OOO" || u.status === "Maintenance" || 
                                     u.housekeeping_status === "OOO" || u.housekeeping_status === "maintenance" || 
                                     u.status === "Blocked";

        return {
          id: u.id,
          num: u.name,
          type: ut ? ut.name : "",
          typeId: u.inventory_unit_type,
          status: u.housekeeping_status ? u.housekeeping_status.charAt(0).toUpperCase() + u.housekeeping_status.slice(1) : "Clean",
          isBooked: isBooked || isBlocked || isMaintenanceOrOOO,
          isBlocked: isBlocked || isMaintenanceOrOOO,
          buildingName: u.building_name || "",
          floorName: u.floor_name || "",
        };
      });
    }
    return mockHousekeepingRooms;
  }, [dbUnits, unitTypes, mockHousekeepingRooms, form.checkIn, form.checkOut, dbReservations, dbGroupBlocks]);

  useEffect(() => {
    if (guestSearchQuery.length > 2) {
      const delayFn = setTimeout(() => {
        fetchApi(`/api/crm/guests/?search=${encodeURIComponent(guestSearchQuery)}`)
          .then((data: any) => {
            setGuestSuggestions(data);
            setIsGuestDropdownOpen(data.length > 0);
          })
          .catch(console.error);
      }, 300);
      return () => clearTimeout(delayFn);
    } else {
      setGuestSuggestions([]);
      setIsGuestDropdownOpen(false);
    }
  }, [guestSearchQuery]);

  const selectGuest = (guest: any) => {
    // Find matching document type from loaded list if backend returns choice string (e.g. PASSPORT, NATIONAL_ID)
    const matchingDocTypeObj = (documentTypes || []).find(dt => 
      guest.id_type && (
        dt.name.toUpperCase().includes(guest.id_type.replace('_', ' ')) ||
        guest.id_type.replace('_', ' ').toUpperCase().includes(dt.name.toUpperCase())
      )
    );

    setForm((prev) => ({
      ...prev,
      fullName: (guest.first_name + " " + guest.last_name).trim(),
      nationality: guest.nationality || prev.nationality,
      email: guest.primary_email || prev.email,
      phone: guest.primary_phone || prev.phone,
      address: guest.primary_address || prev.address,
      idType: matchingDocTypeObj?.id || guest.id_type || prev.idType,
      idNumber: guest.id_number || prev.idNumber,
      idProofPreviewUrl: guest.id_proof_url || prev.idProofPreviewUrl,
      idProofFilename: guest.id_proof_url ? guest.id_proof_url.split('/').pop() : prev.idProofFilename,
    }));
    setGuestSearchQuery((guest.first_name + " " + guest.last_name).trim());
    setIsGuestDropdownOpen(false);
  };

  const loadEstimate = async (currentForm: ReservationFormData) => {
    if (!currentForm.checkIn || !currentForm.checkOut || currentForm.roomSelections.length === 0) {
      setPriceEstimate(null);
      return;
    }
    setIsPriceEstimating(true);
    try {
      const payload: any = {
        fullName: currentForm.fullName,
        nationality: currentForm.nationality,
        email: currentForm.email,
        phone: currentForm.phone,
        address: currentForm.address,
        checkIn: currentForm.checkIn,
        checkOut: currentForm.checkOut,
        adults: currentForm.adults,
        children: currentForm.children,
        roomSelections: currentForm.roomSelections,
        source: currentForm.source,
        specialRequests: currentForm.specialRequests,
        notes: currentForm.notes,
        packages: currentForm.selectedPackageId ? [currentForm.selectedPackageId] : [],
        services: currentForm.addOnSelections.map(s => s.id),
        coupon_code: currentForm.couponCode,
      };
      const res = await reservationsApi.estimatePrice(payload);
      setPriceEstimate(res);
    } catch (e) {
      console.error("Failed to estimate price", e);
      setPriceEstimate(null);
    } finally {
      setIsPriceEstimating(false);
    }
  };

  useEffect(() => {
    const delayFn = setTimeout(() => {
      loadEstimate(form);
    }, 500);
    return () => clearTimeout(delayFn);
  }, [form.checkIn, form.checkOut, form.roomSelections, form.selectedPackageId, form.addOnSelections, form.couponCode]);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    
    if (typeParam && ["individual", "group", "corporate", "package", "walkin", "event"].includes(typeParam)) {
      setType(typeParam as T);
    }

    // Fetch corporate accounts
    fetchApi<any>("/api/reservations/corporate-accounts/")
      .then((res) => {
        setCorporateAccounts(res.results || res);
      })
      .catch((err) => console.error("Failed to load corporate accounts", err));
  }, []);

  const nights = useMemo(
    () => nightsBetween(form.checkIn, form.checkOut),
    [form.checkIn, form.checkOut],
  );

  const eligibleRatePlans = useMemo(
    () =>
      filterEligibleRatePlans(ratePlans, {
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        roomTypeNames: form.roomSelections.map(rs => rs.roomType),
        reservationType: type as ReservationTypeForRates,
        corporateCompany: form.corporateCompany,
      }),
    [ratePlans, form.checkIn, form.checkOut, form.roomSelections, type, form.corporateCompany],
  );

  const bookableRoomTypes = useMemo(
    () => {
      if (unitTypes && unitTypes.length > 0) {
        return unitTypes
          .filter((ut: any) => ut.is_sellable !== false && ut.status !== "INACTIVE")
          .map((ut: any) => {
            const stayDates = getStayDates(form.checkIn, form.checkOut);
            const relevant = stayDates
              .map((date) => availabilityCells.find((c) => (c.roomTypeId === ut.id || (c as any).roomTypeName === ut.name) && c.date === date))
              .filter((cell): cell is AvailabilityCell => !!cell);
            
            const freeValues = relevant.map((cell) => cell.total - cell.sold);
            const freeMin = freeValues.length ? Math.min(...freeValues) : (ut.rooms_count ?? 5); // Default fallback to rooms_count if no cells in database

            return {
              id: ut.id,
              name: ut.name,
              freeMin: Math.max(0, freeMin),
              blocked: false,
              blockReason: undefined,
            };
          });
      }
      return listBookableRoomTypes(availabilityCells, form.checkIn, form.checkOut);
    },
    [availabilityCells, form.checkIn, form.checkOut, unitTypes],
  );

  const availabilityError = useMemo(() => {
    if (form.roomSelections.length === 0 || !form.checkIn || !form.checkOut || type === "event") return null;
    for (const rs of form.roomSelections) {
      const err = availabilityBlockReason(availabilityCells, rs.roomType, form.checkIn, form.checkOut);
      if (err) return err;
    }
    return null;
  }, [availabilityCells, form.roomSelections, form.checkIn, form.checkOut, type]);



  // useEffect(() => {
  //   setForm((prev) => {
  //     if (prev.roomTypes.length === 0 || !prev.checkIn || !prev.checkOut || type === "event") return prev;
  //     // const block = availabilityBlockReason(...)
  //     return prev;
  //   });
  // }, [form.checkIn, form.checkOut, availabilityCells, type]);

  const total = useMemo(() => estimateTotal(type, form, nights), [type, form, nights]);
  const pricingBreakdown = useMemo(
    () =>
      calculatePricingBreakdown({
        type,
        nights,
        roomSelections: form.roomSelections,
        selectedPackageId: form.selectedPackageId,
        addOnSelections: form.addOnSelections,
        dynamicPricingPct: Number(form.dynamicPricingPct || 0),
        adults: Number(form.adults || 0),
        children: Number(form.children || 0),
        mealPlans: (mealPlans || []).map((m) => ({
          id: m.id,
          priceAdjustment: m.priceAdjustment,
          taxPercent: m.taxPercent,
        })),
        ratePlans: (ratePlans || []).map((r) => ({ id: r.id, discountPercent: r.discountPercent })),
        hotelPackages: (hotelPackages || []).map((p) => ({ id: p.id, basePrice: p.basePrice })),
        addOnProducts: (addOnProducts || []).map((a) => ({ id: a.id, price: a.price })),
        includeTax: form.includeTax,
        occupancyRules: (dbOccupancyTypes || []).map((o: any) => ({
          occupancyType: o.code,
          multiplier: Number(o.multiplier),
        })),
        ratePlanInventories,
        unitTypes,
        taxComponents: dbTaxComponents,
      }),
    [type, nights, form, mealPlans, ratePlans, hotelPackages, addOnProducts, dbOccupancyTypes, ratePlanInventories, unitTypes, dbTaxComponents],
  );

  const setField = <K extends keyof ReservationFormData>(key: K, value: ReservationFormData[K]) => {
    setDirty(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key as string];
      if (key === "sendEmail" || key === "sendSms") {
        delete next.confirmation;
      }
      return next;
    });
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showDraftsList, setShowDraftsList] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);

  const loadDraftsList = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setDrafts(Array.isArray(parsed) ? parsed : []);
      } else {
        setDrafts([]);
      }
    } catch (e) {
      console.error(e);
      setDrafts([]);
    }
  };

  useEffect(() => {
    loadDraftsList();
    fetchApi<any>("/api/superadmin-taxes/")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.results || [];
        setDbTaxComponents(list);
      })
      .catch(() => setDbTaxComponents([]));
  }, []);

  const handleSaveDraft = (navigateBackAfter = false) => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      let currentDrafts: any[] = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            currentDrafts = parsed;
          }
        } catch {}
      }

      const newDraft = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleString(),
        guestName: form.fullName.trim() || form.groupName.trim() || "Untitled Guest",
        type,
        form
      };

      currentDrafts = [newDraft, ...currentDrafts].slice(0, 3);
      localStorage.setItem(DRAFT_KEY, JSON.stringify(currentDrafts));
      setDrafts(currentDrafts);
      setDirty(false);
      setForm(initialFormData);
      toast.success("Draft saved and fields cleared.");
      if (navigateBackAfter) {
        navigate({ to: "/reservations" });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save draft.");
    }
  };

  const handleLoadDraft = (selectedDraft: any) => {
    if (selectedDraft?.form) {
      setForm(selectedDraft.form);
      if (selectedDraft.type) setType(selectedDraft.type);
      setDirty(true);
      setShowDraftsList(false);
      toast.success(`Draft for "${selectedDraft.guestName}" loaded!`);
    }
  };

  const handleDeleteDraft = (draftId: string) => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((d: any) => d.id !== draftId);
          localStorage.setItem(DRAFT_KEY, JSON.stringify(filtered));
          setDrafts(filtered);
          toast.success("Draft deleted.");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!dirty) return;
    e.preventDefault();
    setShowBackConfirm(true);
  };

  const isTodayCheckIn = useMemo(() => {
    if (!form.checkIn) return false;
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return form.checkIn === todayStr;
  }, [form.checkIn]);

  const handleGatewayPaymentComplete = async (transactionId: string, gatewayName?: string, shouldCheckIn = false) => {
    setField("paymentRemark", transactionId);
    if (gatewayName) setField("paymentMethod", gatewayName);

    setSubmitting(true);
    try {
      if (type === "event") {
        form.checkIn = form.eventStartDate;
        form.checkOut = form.eventEndDate;
      }
      const updatedForm = {
        ...form,
        paymentRemark: transactionId,
        paymentMethod: gatewayName || form.paymentMethod || "Razorpay",
      };

      let createdRes: any = null;
      if (type === "group") {
        createdRes = await (reservationsApi as any).createGroupBlock(updatedForm);
      } else {
        createdRes = await reservationsApi.createReservation({ ...updatedForm, uploadedFile });
      }

      const bookingId = createdRes?.id || createdRes?.booking_id || (Array.isArray(createdRes) ? createdRes[0]?.id : null);

      if (shouldCheckIn && bookingId) {
        try {
          await reservationsApi.checkIn(bookingId);
          toast.success(`🎉 Reservation confirmed & Checked In via ${gatewayName || "Razorpay"}!`);
        } catch (checkInErr: any) {
          toast.success(`Reservation confirmed via ${gatewayName || "Razorpay"}!`);
        }
      } else {
        toast.success(`Reservation confirmed via ${gatewayName || "Razorpay"}!`);
      }

      localStorage.setItem(
        SUBMITTED_KEY,
        JSON.stringify({
          createdAt: new Date().toISOString(),
          type,
          form: updatedForm,
        }),
      );
      localStorage.removeItem(DRAFT_KEY);
      setDirty(false);
      setActivePaymentGateway(null);
      navigate({ to: "/reservations" });
    } catch (error: any) {
      console.error("Failed to confirm reservation after payment:", error);
      toast.error(error.message || "Failed to confirm reservation. Please contact admin.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (shouldCheckIn = false) => {
    if (type === "event") {
      form.checkIn = form.eventStartDate;
      form.checkOut = form.eventEndDate;
      form.fullName = form.eventOrganizer || form.fullName || "Event Organizer";
      form.phone = form.eventContact || form.phone || "N/A";
      form.email = form.eventOrganizerEmail || form.email;
      form.address = form.eventOrganizerAddress || form.address;
      form.adults = form.eventPax || form.adults || "1";
      if (!form.source) form.source = "Direct";
    }
    const nextErrors = validate(form, type, "confirm");
    if (availabilityError) nextErrors.roomSelections = availabilityError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const errList = Object.values(nextErrors).join(" | ");
      toast.error(`Please fix the highlighted fields: ${errList}`);
      return;
    }

    const gateways = ["Razorpay", "CC Avenue", "PhonePe", "HDFC", "PayU", "Easebuzz", "Paytm", "Card", "UPI", "Net Banking"];
    const finalPayableAmount = Number(form.paidAmount) || (priceEstimate ? Number(priceEstimate.total_price) : Math.max(total, pricingBreakdown.total));

    if ((gateways.includes(form.paymentMethod) || !form.paymentMethod) && form.paymentMethod !== "Cash") {
      setActivePaymentGateway({ gateway: form.paymentMethod || "Razorpay", amount: finalPayableAmount, shouldCheckIn });
      return;
    }

    setSubmitting(true);
    try {
      let createdRes: any = null;
      if (type === "group") {
        createdRes = await (reservationsApi as any).createGroupBlock(form);
      } else {
        createdRes = await reservationsApi.createReservation({ ...form, uploadedFile });
      }

      const bookingId = createdRes?.id || createdRes?.booking_id || (Array.isArray(createdRes) ? createdRes[0]?.id : null);

      if (shouldCheckIn && bookingId) {
        try {
          await reservationsApi.checkIn(bookingId);
          toast.success("🎉 Reservation created & Guest checked in immediately!");
        } catch (checkInErr: any) {
          console.warn("Reservation created, but immediate check-in failed:", checkInErr);
          toast.error(`Reservation created, but check-in failed: ${checkInErr?.message || checkInErr}`);
        }
      } else {
        toast.success("Reservation created successfully.");
      }

      localStorage.setItem(
        SUBMITTED_KEY,
        JSON.stringify({
          createdAt: new Date().toISOString(),
          type,
          form,
        }),
      );
      localStorage.removeItem(DRAFT_KEY);
      setDirty(false);
      navigate({ to: "/reservations" });
    } catch (error: any) {
      console.error("Failed to confirm reservation:", error);
      toast.error(error.message || "Failed to confirm reservation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToWaitlist = async () => {
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Guest name is required.";
    if (!form.checkIn) nextErrors.checkIn = "Check-in date is required.";
    if (!form.checkOut) nextErrors.checkOut = "Check-out date is required.";
    if (form.roomSelections.length === 0) nextErrors.roomSelections = "Add at least one room selection to indicate room type.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fill guest name, dates, and select a room type.");
      return;
    }

    setSubmitting(true);
    try {
      const roomTypeUUID = form.roomSelections[0]?.roomType;
      await addToWaitlistMutation.mutateAsync({
        guest_name: form.fullName,
        email: form.email,
        phone: form.phone,
        check_in_date: form.checkIn,
        check_out_date: form.checkOut,
        inventory_unit_type_id: roomTypeUUID,
        priority: "NORMAL",
        notes: form.notes,
      });

      localStorage.removeItem(DRAFT_KEY);
      setDirty(false);
      toast.success("Added to waitlist successfully.");
      navigate({ to: "/reservations" });
    } catch (error: any) {
      console.error("Failed to add to waitlist:", error);
      toast.error(error.message || "Failed to add to waitlist. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="New reservation"
        actions={
          <>
            <Link to="/reservations" onClick={handleBack}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            </Link>
            {drafts.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowDraftsList(true)} className="border-primary text-primary hover:bg-primary-tint">
                Load Draft ({drafts.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => handleSaveDraft(false)} disabled={submitting}>
              Save draft
            </Button>
            {(isTodayCheckIn || type === "walkin") && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="gap-1.5 font-semibold"
              >
                <CheckCircle2 className="w-4 h-4" />
                Reserve & Check-In Now (Walk-In)
              </Button>
            )}
            <Button size="sm" onClick={() => handleSubmit(false)} disabled={submitting} variant={isTodayCheckIn ? "outline" : "default"}>
              {submitting ? "Confirming..." : "Confirm reservation only"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[260px_1fr]">
        <Card>
          <CardHeader title="Booking type" />
          <ul className="p-2">
            {types.map((t) => {
              const active = type === t.id;
              const Icon = t.icon;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setType(t.id)}
                    className={`flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition ${
                      active ? "bg-primary-tint text-primary-pressed" : "hover:bg-surface-2"
                    }`}
                  >
                    <Icon
                      className={`mt-0.5 h-4 w-4 ${active ? "text-primary" : "text-text-secondary"}`}
                    />
                    <div>
                      <div className="text-[13px] font-medium">{t.label}</div>
                      <div className="text-[11px] text-text-secondary">{t.hint}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="space-y-4">
          {type === "group" && <GroupForm form={form} errors={errors} setField={setField} />}
          {type === "corporate" && (
            <CorporateForm form={form} errors={errors} setField={setField} corporateAccounts={corporateAccounts} />
          )}
          {type === "package" && <PackageForm form={form} errors={errors} setField={setField} />}
          {type === "walkin" && <WalkinForm form={form} errors={errors} setField={setField} />}
          {type === "event" && (
            <EventForm
              form={form}
              errors={errors}
              setField={setField}
              eventRangePopoverOpen={eventRangePopoverOpen}
              setEventRangePopoverOpen={setEventRangePopoverOpen}
              eventTempRange={eventTempRange}
              setEventTempRange={setEventTempRange}
              eventStartTimeHour={eventStartTimeHour}
              setEventStartTimeHour={setEventStartTimeHour}
              eventStartTimeMin={eventStartTimeMin}
              setEventStartTimeMin={setEventStartTimeMin}
              eventStartTimePeriod={eventStartTimePeriod}
              setEventStartTimePeriod={setEventStartTimePeriod}
              eventEndTimeHour={eventEndTimeHour}
              setEventEndTimeHour={setEventEndTimeHour}
              eventEndTimeMin={eventEndTimeMin}
              setEventEndTimeMin={setEventEndTimeMin}
              eventEndTimePeriod={eventEndTimePeriod}
              setEventEndTimePeriod={setEventEndTimePeriod}
              handleApplyEventDateRange={handleApplyEventDateRange}
              handleOpenEventDateRangePopover={handleOpenEventDateRangePopover}
              setIsAddRoomOpen={setIsAddRoomOpen}
              handleRemoveRoomSelection={handleRemoveRoomSelection}
              ratePlans={ratePlans}
              mealPlans={mealPlans}
            />
          )}
          <GuestStayForm
            type={type}
            form={form}
            errors={errors}
            setField={setField}
            nights={nights}
            mealPlans={mealPlans}
            ratePlans={eligibleRatePlans}
            allRatePlansCount={ratePlans.length}
            bookableRoomTypes={bookableRoomTypes}
            packagesList={packagesList}
            servicesList={servicesList}
            housekeepingRooms={housekeepingRooms}
            documentTypes={documentTypes}
            guestSuggestions={guestSuggestions}
            guestSearchQuery={guestSearchQuery}
            setGuestSearchQuery={setGuestSearchQuery}
            isGuestDropdownOpen={isGuestDropdownOpen}
            setIsGuestDropdownOpen={setIsGuestDropdownOpen}
            selectGuest={selectGuest}
            couponsList={couponsList}
            priceEstimate={priceEstimate}
            unitTypes={unitTypes}
            nationalitiesList={nationalitiesList}
            dbMealPlans={dbMealPlans}
            dbMealPlanPrices={dbMealPlanPrices}
            dbOccupancyTypes={dbOccupancyTypes}
            dbBookingSources={dbBookingSources}
            isOcrLoading={isOcrLoading}
            ocrError={ocrError}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            handleExtractDetails={handleExtractDetails}
            setIsAddRoomOpen={setIsAddRoomOpen}
            handleRemoveRoomSelection={handleRemoveRoomSelection}
            isAddRoomOpen={isAddRoomOpen}
          />
          <Summary
            form={form}
            errors={errors}
            setField={setField}
            total={Math.max(total, pricingBreakdown.total)}
            pricingBreakdown={pricingBreakdown}
            onSubmit={handleSubmit}
            onAddToWaitlist={handleAddToWaitlist}
            submitting={submitting}
            priceEstimate={priceEstimate}
            couponsList={couponsList}
            isPriceEstimating={isPriceEstimating}
            isTodayCheckIn={isTodayCheckIn}
          />
        </div>
      </div>

      {showBackConfirm && (
        <Dialog open={showBackConfirm} onOpenChange={setShowBackConfirm}>
          <DialogContent className="max-w-[400px] bg-surface p-6 border border-border rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-text">Unsaved Reservation</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-text-secondary my-4">
              You have unsaved changes in this reservation form. What would you like to do?
            </p>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowBackConfirm(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-error border-error hover:bg-error/10"
                onClick={() => {
                  setForm(initialFormData);
                  setDirty(false);
                  setShowBackConfirm(false);
                  navigate({ to: "/reservations" });
                }}
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowBackConfirm(false);
                  handleSaveDraft(true);
                }}
              >
                Save draft
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showDraftsList && (
        <Dialog open={showDraftsList} onOpenChange={setShowDraftsList}>
          <DialogContent className="max-w-[500px] bg-surface p-6 border border-border rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-text">Saved Drafts</DialogTitle>
            </DialogHeader>
            <div className="my-4 space-y-3">
              {drafts.length === 0 ? (
                <div className="text-center py-6 text-sm text-text-secondary">No drafts saved.</div>
              ) : (
                drafts.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-4 border border-border rounded-md hover:border-primary/40 bg-surface-2/30 transition">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="text-sm font-medium text-text truncate">
                        {d.guestName}
                      </div>
                      <div className="text-[11px] text-text-secondary mt-1 flex items-center gap-2">
                        <span className="capitalize px-1.5 py-0.5 rounded bg-surface-3 font-semibold text-[10px] text-primary border border-primary/20">
                          {d.type}
                        </span>
                        <span>Saved: {d.timestamp}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2.5 h-8 border-primary text-primary hover:bg-primary-tint"
                        onClick={() => handleLoadDraft(d)}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 h-8 text-error border-error hover:bg-error/10"
                        onClick={() => handleDeleteDraft(d.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setShowDraftsList(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <PaymentGatewayModal
        open={!!activePaymentGateway}
        onClose={() => setActivePaymentGateway(null)}
        amount={activePaymentGateway?.amount || 0}
        guestName={form.fullName}
        guestEmail={form.email}
        guestPhone={form.phone}
        initialGateway={activePaymentGateway?.gateway}
        onPaymentComplete={(txnId, gatewayName) => {
          handleGatewayPaymentComplete(txnId, gatewayName, activePaymentGateway?.shouldCheckIn);
        }}
      />

      <Sheet open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <SheetContent className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Room</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <Field label="Room type">
              <select
                className={inputCls}
                value={draftRoomType}
                onChange={(e) => {
                  setDraftRoomType(e.target.value);
                  setDraftAssignedRooms([]); // clear rooms when type changes
                }}
              >
                <option value="">Select room type</option>
                {(bookableRoomTypes || []).map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                    {room.blocked ? ` · blocked` : room.freeMin > 0 ? ` · ${room.freeMin} left` : ""}
                  </option>
                ))}
              </select>
            </Field>

            {draftRoomType && (
              <>
                <Field label="Assign rooms" hint="Select multiple rooms">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto p-2 border border-border rounded-md bg-surface">
                    {(housekeepingRooms || [])
                      .filter((r) => r.typeId === draftRoomType || r.type === draftRoomType)
                      .map((room) => {
                        const isSelected = draftAssignedRooms.includes(room.num);
                        const isUnavailable = room.isBooked || room.isBlocked || room.status === "OOO" || room.status === "Maintenance" || room.status.toLowerCase() === "maintenance";
                        return (
                          <label 
                            key={room.num} 
                            className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${
                              isUnavailable 
                                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-65' 
                                : isSelected 
                                  ? 'bg-primary-tint border-primary text-primary-pressed cursor-pointer' 
                                  : 'border-border hover:bg-surface-2 cursor-pointer'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={isSelected}
                              disabled={isUnavailable}
                              onChange={(e) => {
                                if (isUnavailable) return;
                                if (e.target.checked) {
                                  setDraftAssignedRooms([...draftAssignedRooms, room.num]);
                                } else {
                                  setDraftAssignedRooms(draftAssignedRooms.filter(n => n !== room.num));
                                }
                              }} 
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold">Room {room.num}</span>
                              {(room.buildingName || room.floorName) && (
                                <span className="text-[10px] text-text-secondary leading-tight">
                                  {[room.buildingName, room.floorName].filter(Boolean).join(" · ")}
                                </span>
                              )}
                              <span className="text-[10px] font-semibold mt-0.5 opacity-80">
                                {room.isBlocked ? "Blocked" : room.isBooked ? "Booked" : room.status}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Occupancy type">
                    <select
                      className={inputCls}
                      value={draftOccupancyType}
                      onChange={(e) => setDraftOccupancyType(e.target.value as any)}
                    >
                      {(dbOccupancyTypes || []).map((occ: any) => (
                        <option key={occ.id} value={occ.code}>
                          {occ.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Meal plan">
                    <select
                      className={inputCls}
                      value={draftMealPlan}
                      onChange={(e) => setDraftMealPlan(e.target.value)}
                    >
                      <option value="">Select meal plan</option>
                      {(roomSpecificMealPlans || [])
                        .filter((meal) => meal.is_active !== false)
                        .map((meal) => (
                          <option key={meal.id} value={meal.id}>
                            {meal.code} – {meal.name}{meal.priceAdjustment > 0 ? ` · +₹${meal.priceAdjustment.toLocaleString()}` : ''}
                          </option>
                        ))}
                    </select>
                  </Field>
                </div>
              </>
            )}
          </div>
          <SheetFooter className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => setIsAddRoomOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRoomSelection} disabled={!draftRoomType || !draftMealPlan}>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({
  label,
  children,
  hint,
  error,
  tooltip,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
  error?: string;
  tooltip?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {typeof label === "string" ? (
            <span className="text-[11px] font-medium text-text-secondary">{label}</span>
          ) : (
            <div className="text-[11px] font-medium text-text-secondary flex-1">{label}</div>
          )}
          {tooltip && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="focus:outline-none">
                    <HelpCircle className="h-3.5 w-3.5 text-text-disabled hover:text-text-secondary cursor-help" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-popover border border-border text-popover-foreground shadow-md p-2">
                  <p className="max-w-[220px] text-xs font-normal">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {hint && <span className="text-[10px] text-text-disabled">{hint}</span>}
      </div>
      {children}
      {error && <div className="mt-1 text-[11px] text-error">{error}</div>}
    </label>
  );
}

const inputCls =
  "h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

type FormProps = {
  form: ReservationFormData;
  errors: Record<string, string>;
  setField: <K extends keyof ReservationFormData>(key: K, value: ReservationFormData[K]) => void;
};

function GuestStayForm({
  type,
  form,
  errors,
  setField,
  nights,
  mealPlans,
  ratePlans,
  allRatePlansCount,
  bookableRoomTypes,
  packagesList,
  servicesList,
  housekeepingRooms,
  documentTypes,
  guestSuggestions,
  guestSearchQuery,
  setGuestSearchQuery,
  isGuestDropdownOpen,
  setIsGuestDropdownOpen,
  selectGuest,
  couponsList,
  priceEstimate,
  unitTypes,
  nationalitiesList,
  dbMealPlans,
  dbMealPlanPrices,
  dbOccupancyTypes,
  dbBookingSources,
  isOcrLoading,
  ocrError,
  uploadedFile,
  setUploadedFile,
  handleExtractDetails,
  setIsAddRoomOpen,
  handleRemoveRoomSelection,
  isAddRoomOpen,
}: FormProps & {
  type: string;
  nights: number;
  mealPlans: Array<{
    id: string;
    code: string;
    name: string;
    includedMeals?: string[];
    priceAdjustment: number;
    status: string;
  }>;
  ratePlans: RatePlan[];
  allRatePlansCount: number;
  bookableRoomTypes: Array<{
    id: string;
    name: string;
    freeMin: number;
    blocked: boolean;
    blockReason?: string;
  }>;
  packagesList: Array<any>;
  servicesList: Array<any>;
  housekeepingRooms: Array<{ num: string; type: string; typeId?: string; status: string }>;
  documentTypes: Array<any>;
  guestSuggestions: Array<any>;
  guestSearchQuery: string;
  setGuestSearchQuery: (v: string) => void;
  isGuestDropdownOpen: boolean;
  setIsGuestDropdownOpen: (v: boolean) => void;
  selectGuest: (g: any) => void;
  couponsList: Array<any>;
  priceEstimate: any;
  unitTypes: Array<any>;
  nationalitiesList: Array<any>;
  dbMealPlans: Array<any>;
  dbMealPlanPrices: Array<any>;
  dbOccupancyTypes: Array<any>;
  dbBookingSources: Array<any>;
  isOcrLoading: boolean;
  ocrError: string | null;
  uploadedFile: File | null;
  setUploadedFile: (v: File | null) => void;
  handleExtractDetails: (f?: File) => Promise<void>;
  setIsAddRoomOpen: (open: boolean) => void;
  handleRemoveRoomSelection: (index: number) => void;
  isAddRoomOpen: boolean;
}) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [checkInTimeHour, setCheckInTimeHour] = useState("12");
  const [checkInTimeMin, setCheckInTimeMin] = useState("00");
  const [checkInTimePeriod, setCheckInTimePeriod] = useState("PM");

  const [checkOutTimeHour, setCheckOutTimeHour] = useState("11");
  const [checkOutTimeMin, setCheckOutTimeMin] = useState("00");
  const [checkOutTimePeriod, setCheckOutTimePeriod] = useState("AM");

  const [dateRangePopoverOpen, setDateRangePopoverOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(undefined);

  const handleOpenDateRangePopover = () => {
    const parseDateString = (dateStr?: string) => {
      if (!dateStr) return undefined;
      const parts = dateStr.split("-");
      if (parts.length !== 3) return undefined;
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    };

    const parseTime = (timeStr?: string, defaultHour = "12", defaultMin = "00", defaultPeriod = "PM") => {
      if (!timeStr) return { hour: defaultHour, min: defaultMin, period: defaultPeriod };
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return { hour: defaultHour, min: defaultMin, period: defaultPeriod };
      return { hour: String(Number(match[1])), min: match[2], period: match[3].toUpperCase() };
    };

    const parsedCiTime = parseTime(form.checkInTime, "12", "00", "PM");
    setCheckInTimeHour(parsedCiTime.hour);
    setCheckInTimeMin(parsedCiTime.min);
    setCheckInTimePeriod(parsedCiTime.period);

    const parsedCoTime = parseTime(form.checkOutTime, "11", "00", "AM");
    setCheckOutTimeHour(parsedCoTime.hour);
    setCheckOutTimeMin(parsedCoTime.min);
    setCheckOutTimePeriod(parsedCoTime.period);

    setTempRange({
      from: parseDateString(form.checkIn),
      to: parseDateString(form.checkOut)
    });
    setDateRangePopoverOpen(true);
  };

  const handleApplyDateRange = () => {
    if (tempRange?.from) {
      setField("checkIn", format(tempRange.from, "yyyy-MM-dd"));
    } else {
      setField("checkIn", "");
    }
    if (tempRange?.to) {
      setField("checkOut", format(tempRange.to, "yyyy-MM-dd"));
    } else {
      setField("checkOut", "");
    }
    setField("checkInTime", `${checkInTimeHour.padStart(2, "0")}:${checkInTimeMin} ${checkInTimePeriod}`);
    setField("checkOutTime", `${checkOutTimeHour.padStart(2, "0")}:${checkOutTimeMin} ${checkOutTimePeriod}`);
    setDateRangePopoverOpen(false);
  };

  return (
    <>
      {type !== "event" && (
        <Card>
          <CardHeader title="Stay & rate" hint="Stay dates, room, meal plan, rate plan" />
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
          <Field label="Choose Date" error={errors.checkIn}>
            <Popover open={dateRangePopoverOpen} onOpenChange={setDateRangePopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={handleOpenDateRangePopover}
                  className={cn(inputCls, "flex items-center justify-between text-left font-normal cursor-pointer w-full bg-surface border border-border")}
                >
                  <span className={!form.checkIn ? "text-text-secondary" : ""}>
                    {form.checkIn ? `${format(new Date(form.checkIn), "dd-MM-yyyy")}${form.checkInTime ? ` @ ${form.checkInTime}` : ""}` : "dd-mm-yyyy"}
                  </span>
                  <CalendarDays className="h-4 w-4 text-text-secondary" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border border-border bg-surface shadow-md" align="start">
                <div className="p-3">
                  <Calendar
                    mode="range"
                    numberOfMonths={2}
                    selected={tempRange}
                    onSelect={setTempRange}
                    disabled={{ before: new Date(new Date().setHours(0,0,0,0)) }}
                    className="rounded-md"
                  />
                  <div className="grid grid-cols-2 gap-4 border-t border-border pt-3 mt-1">
                    <div>
                      <div className="text-[11px] font-medium text-text-secondary mb-1">Check-in Time</div>
                      <div className="flex gap-1.5">
                        <select
                          className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                          value={checkInTimeHour}
                          onChange={(e) => setCheckInTimeHour(e.target.value)}
                        >
                          {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                            <option key={h} value={h}>{h.padStart(2, "0")}</option>
                          ))}
                        </select>
                        <select
                          className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                          value={checkInTimeMin}
                          onChange={(e) => setCheckInTimeMin(e.target.value)}
                        >
                          {["00", "15", "30", "45"].map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                          value={checkInTimePeriod}
                          onChange={(e) => setCheckInTimePeriod(e.target.value)}
                        >
                          {["AM", "PM"].map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-text-secondary mb-1">Check-out Time</div>
                      <div className="flex gap-1.5">
                        <select
                          className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                          value={checkOutTimeHour}
                          onChange={(e) => setCheckOutTimeHour(e.target.value)}
                        >
                          {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                            <option key={h} value={h}>{h.padStart(2, "0")}</option>
                          ))}
                        </select>
                        <select
                          className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                          value={checkOutTimeMin}
                          onChange={(e) => setCheckOutTimeMin(e.target.value)}
                        >
                          {["00", "15", "30", "45"].map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                          value={checkOutTimePeriod}
                          onChange={(e) => setCheckOutTimePeriod(e.target.value)}
                        >
                          {["AM", "PM"].map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-border pt-3 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setDateRangePopoverOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      onClick={handleApplyDateRange}
                    >
                      Ok
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </Field>
          <Field label="Departure" error={errors.checkOut}>
            <div
              className={cn(inputCls, "flex items-center justify-between text-left font-normal w-full bg-surface border border-border select-none")}
            >
              <span className={!form.checkOut ? "text-text-secondary" : ""}>
                {form.checkOut ? `${format(new Date(form.checkOut), "dd-MM-yyyy")}${form.checkOutTime ? ` @ ${form.checkOutTime}` : ""}` : "dd-mm-yyyy"}
              </span>
              <CalendarDays className="h-4 w-4 text-text-secondary/50" />
            </div>
          </Field>
          <Field label="Nights / Pax" error={errors.adults}>
            <div className="flex gap-2">
              <input className={inputCls} value={`${nights} nights`} readOnly />
              <input
                className={inputCls}
                placeholder="2 adults"
                value={`${form.adults}A / ${form.children}C`}
                readOnly
              />
            </div>
          </Field>
          <div className="col-span-1 md:col-span-3">
            <Field label="Room assignments" error={errors.roomSelections}>
              <div className="flex flex-col gap-3">
                {form.roomSelections.length > 0 ? (
                  <div className="grid gap-2">
                    {form.roomSelections.map((selection, i) => (
                      <div key={i} className="flex items-center justify-between border border-border rounded-md p-3 bg-surface">
                        <div>
                          <div className="font-medium text-sm text-text">{selection.roomType}</div>
                          <div className="text-xs text-text-secondary mt-1">
                            {selection.assignedRooms.length > 0
                              ? `Assigned: ${selection.assignedRooms.join(", ")}`
                              : "No specific rooms assigned"}
                          </div>
                          <div className="text-xs text-text-secondary mt-1 flex gap-2">
                            <Badge variant="outline" className="font-normal text-[10px]">{selection.occupancyType}</Badge>
                            <Badge variant="outline" className="font-normal text-[10px]">{ratePlans.find(r => r.id === selection.ratePlan)?.name || selection.ratePlan}</Badge>
                            <Badge variant="outline" className="font-normal text-[10px]">{mealPlans.find(m => m.id === selection.mealPlan)?.code || selection.mealPlan}</Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveRoomSelection(i)}>
                          <X className="w-4 h-4 text-text-secondary" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-text-secondary italic">No rooms added yet.</div>
                )}
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      if (!form.checkIn || !form.checkOut || !form.checkInTime || !form.checkOutTime) {
                        toast.error("Please select Check-in and Check-out dates and times first.");
                        return;
                      }
                      setIsAddRoomOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Room
                  </Button>
                </div>
              </div>
            </Field>
          </div>
          <Field label="Source" error={errors.source}>
            <select
              className={inputCls}
              value={form.source}
              onChange={(e) => setField("source", e.target.value)}
            >
              <option value="">Select booking source</option>
              {(dbBookingSources || [])
                .filter((src: any) => src.is_active !== false)
                .map((src: any) => (
                  <option key={src.id} value={src.name}>
                    {src.name}
                  </option>
                ))}
            </select>
          </Field>
          <div className="col-span-1 md:col-span-2">
            <Field label="Dynamic pricing adjustment (%)" tooltip="Revenue rule uplift/discount">
              <input
                className={cn(inputCls, "max-w-[200px]")}
                type="number"
                min={-40}
                max={80}
                value={form.dynamicPricingPct}
                onChange={(e) => setField("dynamicPricingPct", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Card>
      )}

      {type !== "event" && (
      <Card>
        <CardHeader title="Guest details" />
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <div className="relative">
            <Field label="ID type">
            <select
              className={inputCls}
              value={form.idType}
              onChange={(e) => setField("idType", e.target.value)}
            >
              <option value="">Select document type</option>
              {(documentTypes || []).map(dt => (
                <option key={dt.id} value={dt.id}>{dt.name}</option>
              ))}
            </select>
          </Field>
            <Field label="ID proof document">
            <div className="flex flex-col gap-3">
              {form.idProofPreviewUrl && (
                <div className="relative w-full aspect-video rounded-md overflow-hidden border border-border bg-surface-2 group">
                  {form.idProofPreviewUrl.toLowerCase().endsWith(".pdf") || form.idProofFilename?.toLowerCase().endsWith(".pdf") ? (
                    <iframe src={form.idProofPreviewUrl} className="w-full h-full border-none" title="PDF Preview" />
                  ) : (
                    <img src={form.idProofPreviewUrl} alt="ID Preview" className="w-full h-full object-contain" />
                  )}
                  <button
                    onClick={() => {
                      setField("idProofFilename", undefined);
                      setField("idProofPreviewUrl", undefined);
                    }}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              )}
              <div className="flex gap-2 w-full">
                <div className="flex-1 min-w-0">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    id="idProofUpload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedFile(file);
                        setField("idProofFilename", file.name);
                        if (file.type.startsWith("image/")) {
                          setField("idProofPreviewUrl", URL.createObjectURL(file));
                        } else {
                          setField("idProofPreviewUrl", undefined);
                        }
                        handleExtractDetails(file);
                      }
                    }}
                  />
                  <label 
                    htmlFor="idProofUpload" 
                    className="cursor-pointer flex items-center justify-center w-full h-[40px] rounded-md border border-dashed border-border bg-surface px-3 text-[13px] hover:border-primary hover:text-primary text-text-secondary transition-colors truncate"
                  >
                    {form.idProofFilename ? `Uploaded: ${form.idProofFilename}` : "+ Click to upload ID"}
                  </label>
                </div>
                {form.idProofFilename && (
                  <button
                    type="button"
                    onClick={() => handleExtractDetails()}
                    disabled={isOcrLoading}
                    className="shrink-0 flex items-center justify-center h-[40px] px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-medium text-[13px] transition-colors"
                  >
                    {isOcrLoading ? (
                      <span className="flex items-center gap-1.5">
                        <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Extracting...
                      </span>
                    ) : "Extract Details"}
                  </button>
                )}
                <button
                  type="button"
                  className="shrink-0 flex items-center justify-center h-[40px] px-3 rounded-md border border-border bg-surface hover:bg-surface-2 transition-colors text-text-secondary"
                  title="Capture from camera"
                  onClick={() => setIsCameraOpen(true)}
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              {isOcrLoading && (
                <div className="text-xs text-primary flex items-center gap-2 mt-1">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Extracting guest details... Please wait (Max 10s)</span>
                </div>
              )}
              {ocrError && (
                <div className="text-xs text-red-500 font-medium mt-1">
                  ⚠️ {ocrError}
                </div>
              )}
            </div>
          </Field>
          <Field label="ID number">
            <input
              className={inputCls}
              placeholder="UK-PP 893421"
              value={form.idNumber}
              onChange={(e) => setField("idNumber", e.target.value)}
            />
          </Field>
            <Field label="Full name" error={errors.fullName}>
              <input
                className={inputCls}
                placeholder="e.g. John Mathews"
                value={form.fullName}
                onChange={(e) => {
                  setField("fullName", e.target.value);
                  setGuestSearchQuery(e.target.value);
                }}
                onFocus={() => {
                  if (guestSuggestions.length > 0) setIsGuestDropdownOpen(true);
                }}
                onBlur={() => setTimeout(() => setIsGuestDropdownOpen(false), 200)}
              />
            </Field>
            {isGuestDropdownOpen && guestSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-surface border border-border rounded-md shadow-lg mt-1 max-h-48 overflow-auto">
                {guestSuggestions.map((g) => (
                  <li 
                    key={g.id} 
                    className="px-3 py-2 hover:bg-surface-2 cursor-pointer text-[13px]"
                    onMouseDown={() => selectGuest(g)}
                  >
                    <div className="font-semibold text-text-primary">{g.first_name} {g.last_name}</div>
                    <div className="text-[11px] text-text-secondary">{g.primary_email || "No Email"} • {g.primary_phone || "No Phone"}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Field label="Nationality">
            <select
              className={inputCls}
              value={form.nationality}
              onChange={(e) => setField("nationality", e.target.value)}
            >
              <option value="">Select nationality</option>
              {(nationalitiesList || []).map((nat: any) => (
                <option key={nat.id} value={nat.name}>{nat.name}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Email">
            <input
              className={inputCls}
              type="email"
              placeholder="john@email.com"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
            />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <input
              className={inputCls}
              placeholder="+44 7700 900812"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Address">
              <textarea
                className={`${inputCls} resize-none`}
                placeholder="123 Example Street, City, Country"
                rows={2}
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
              />
            </Field>
          </div>
          {/* <Field label="ID type">
            <select
              className={inputCls}
              value={form.idType}
              onChange={(e) => setField("idType", e.target.value)}
            >
              <option value="">Select document type</option>
              {(documentTypes || []).map(dt => (
                <option key={dt.id} value={dt.id}>{dt.name}</option>
              ))}
            </select>
          </Field> */}
          {/* <Field label="ID number">
            <input
              className={inputCls}
              placeholder="UK-PP 893421"
              value={form.idNumber}
              onChange={(e) => setField("idNumber", e.target.value)}
            />
          </Field> */}
        </div>
      </Card>
      )}

      <Card>
        <CardHeader
          title="Packages & add-ons"
          hint="Attach package and reservation add-on services"
        />
        <div className="grid grid-cols-1 gap-6 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <Field label="Package selection">
                <select
                  className={inputCls}
                  value={form.selectedPackageId}
                  onChange={(e) => setField("selectedPackageId", e.target.value)}
                >
                  <option value="">No package</option>
                  {(packagesList || [])
                    .filter((pkg) => pkg.status !== "Inactive")
                    .map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} · +₹{Number(pkg.price).toLocaleString()}
                      </option>
                    ))}
                </select>
              </Field>
              {form.selectedPackageId && (
                <>
                  <Field label="Occasion">
                    <select
                      className={inputCls}
                      value={form.packageOccasion}
                      onChange={(e) => setField("packageOccasion", e.target.value)}
                    >
                      <option value="">Select occasion (optional)</option>
                      <option value="Honeymoon">Honeymoon</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Business">Business</option>
                    </select>
                  </Field>
                  <Field label="Inclusion Notes">
                    <textarea
                      className={`${inputCls} resize-none`}
                      rows={2}
                      placeholder="E.g. Allergic to strawberries..."
                      value={form.packageInclusionNotes}
                      onChange={(e) => setField("packageInclusionNotes", e.target.value)}
                    />
                  </Field>
                </>
              )}
            </div>
            <div className="hidden md:block" />
          </div>

          <Field label="Add-on services">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(servicesList || []).map((addOn) => {
                const selection = form.addOnSelections.find((s) => s.id === addOn.id);
                const isSelected = !!selection;

                return (
                  <div key={addOn.id} className={`rounded-md border p-3 flex flex-col gap-2 transition-colors ${isSelected ? 'border-primary/50 bg-primary/5' : 'border-border-subtle bg-surface-2/40'}`}>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-text-primary'}`}>{addOn.name}</span>
                      <span className="flex items-center gap-2">
                        <span className={`font-mono text-[11px] ${isSelected && selection.isComplimentary ? 'line-through text-text-disabled' : 'text-text-secondary'}`}>
                          ₹{Number(addOn.price).toLocaleString()}
                        </span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setField("addOnSelections", [...form.addOnSelections, { id: addOn.id, quantity: 1, isComplimentary: false }]);
                            } else {
                              setField("addOnSelections", form.addOnSelections.filter(s => s.id !== addOn.id));
                            }
                          }}
                        />
                      </span>
                    </label>
                    {isSelected && (
                      <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle mt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-text-secondary">Quantity</span>
                          <input 
                            type="number" 
                            min="1" 
                            className={`${inputCls} w-20 h-7 text-xs`}
                            value={selection.quantity}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 1;
                              setField("addOnSelections", form.addOnSelections.map(s => s.id === addOn.id ? { ...s, quantity: qty } : s));
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-text-secondary">Schedule</span>
                          <input 
                            type="time" 
                            className={`${inputCls} w-28 h-7 text-xs`}
                            value={selection.scheduledTime || ""}
                            onChange={(e) => {
                              setField("addOnSelections", form.addOnSelections.map(s => s.id === addOn.id ? { ...s, scheduledTime: e.target.value } : s));
                            }}
                          />
                        </div>
                        <label className="flex items-center gap-2 mt-1">
                          <input 
                            type="checkbox" 
                            checked={selection.isComplimentary}
                            onChange={(e) => {
                              setField("addOnSelections", form.addOnSelections.map(s => s.id === addOn.id ? { ...s, isComplimentary: e.target.checked } : s));
                            }}
                          />
                          <span className="text-[11px] text-text-secondary">Complimentary (₹0)</span>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Special requests & preferences" />
        <div className="space-y-3 p-5">
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set([
              ...form.roomSelections.flatMap((rs) => {
                const ut = (unitTypes || []).find((u) => u.name === rs.roomType);
                return ut?.amenities || [];
              }),
              "High floor",
              "Sea view",
              "Twin beds",
              "Late check-out",
              "Airport pickup"
            ])).map((t) => {
              const isSelected = form.specialRequests?.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => {
                    const current = form.specialRequests || [];
                    if (isSelected) {
                      setField("specialRequests", current.filter((r) => r !== t));
                    } else {
                      setField("specialRequests", [...current, t]);
                    }
                  }}
                  className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-text-secondary hover:border-primary hover:text-primary"
                  }`}
                >
                  {isSelected ? "✓" : "+"} {t}
                </button>
              );
            })}
          </div>
          <textarea
            className="w-full rounded-md border border-border bg-surface p-3 text-[13px] focus:border-primary focus:outline-none"
            rows={3}
            placeholder="Free-text notes for the front office team…"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </div>
      </Card>

      {isCameraOpen && (
        <CameraCaptureModal 
          onClose={() => setIsCameraOpen(false)}
          onCapture={(dataUrl) => {
            setField("idProofFilename", `captured_id_${new Date().getTime()}.jpg`);
            setField("idProofPreviewUrl", dataUrl);
          }}
        />
      )}
    </>
  );
}

function GroupForm({ form, errors, setField }: FormProps) {
  return (
    <Card>
      <CardHeader title="Group details" />
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
        <Field label="Group name" error={errors.groupName}>
          <input
            className={inputCls}
            placeholder="Tata Steel Annual Offsite"
            value={form.groupName}
            onChange={(e) => setField("groupName", e.target.value)}
          />
        </Field>
        <Field label="Company / event">
          <input
            className={inputCls}
            placeholder="Tata Steel Ltd."
            value={form.groupCompany}
            onChange={(e) => setField("groupCompany", e.target.value)}
          />
        </Field>
        <Field label="Primary contact" error={errors.groupContact}>
          <input
            className={inputCls}
            placeholder="Anil Kumar · +91 98xxxxxx20"
            value={form.groupContact}
            onChange={(e) => setField("groupContact", e.target.value)}
          />
        </Field>
        <Field label="Pickup target">
          <input
            className={inputCls}
            placeholder="40 of 50 rooms"
            value={form.groupPickupTarget}
            onChange={(e) => setField("groupPickupTarget", e.target.value)}
          />
        </Field>
        <Field label="Pickup location">
          <input
            className={inputCls}
            placeholder="Airport Terminal 3"
            value={form.groupPickupLocation}
            onChange={(e) => setField("groupPickupLocation", e.target.value)}
          />
        </Field>
        <Field label="Room block count">
          <input
            className={inputCls}
            type="number"
            min={1}
            placeholder="e.g. 50"
            value={form.groupRooms}
            onChange={(e) => setField("groupRooms", e.target.value)}
          />
        </Field>
        <Field label="Cutoff date">
          <input
            className={inputCls}
            type="date"
            value={form.groupCutoffDate}
            onChange={(e) => setField("groupCutoffDate", e.target.value)}
          />
        </Field>
      </div>
    </Card>
  );
}

function CorporateForm({
  form,
  errors,
  setField,
  corporateAccounts = [],
}: FormProps & { corporateAccounts?: any[] }) {
  return (
    <Card>
      <CardHeader title="Corporate account" />
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
        <Field
          label={
            <div className="flex items-center justify-between w-full min-w-[200px]">
              <span>Company</span>
              <a
                href="/corporate?action=new"
                className="text-[10px] text-primary hover:underline font-semibold"
              >
                + Add corporate account
              </a>
            </div>
          }
          error={errors.corporateCompany}
        >
          <select
            className={inputCls}
            value={form.corporateAccountId}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selectedAccount = corporateAccounts.find(a => a.id === selectedId);
              setField("corporateAccountId", selectedId);
              setField("corporateCompany", selectedAccount ? selectedAccount.company_name : "");
            }}
          >
            <option value="">Select corporate account</option>
            {corporateAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.company_name} ({account.negotiated_rate_code})
              </option>
            ))}
          </select>
        </Field>
        <Field label="PO / Reference" error={errors.corporatePoRef}>
          <input
            className={inputCls}
            placeholder="PO-2026-04812"
            value={form.corporatePoRef}
            onChange={(e) => setField("corporatePoRef", e.target.value)}
          />
        </Field>
        <Field label="Billing" error={errors.corporateBilling}>
          <select
            className={inputCls}
            value={form.corporateBilling}
            onChange={(e) => setField("corporateBilling", e.target.value)}
          >
            <option>Direct bill to company (City Ledger)</option>
            <option>Guest pays — company reimburses</option>
          </select>
        </Field>
        <Field label="Employee / traveler ID">
          <input
            className={inputCls}
            placeholder="EMP-22491"
            value={form.corporateGuestId}
            onChange={(e) => setField("corporateGuestId", e.target.value)}
          />
        </Field>
        <Field label="Cost center">
          <input
            className={inputCls}
            placeholder="SALES-NORTH"
            value={form.corporateCostCenter}
            onChange={(e) => setField("corporateCostCenter", e.target.value)}
          />
        </Field>
        <Field label="GST Number">
          <input
            className={inputCls}
            placeholder="GST Number"
            value={form.corporateGst}
            onChange={(e) => setField("corporateGst", e.target.value)}
          />
        </Field>
        <Field label="Travel purpose">
          <select
            className={inputCls}
            value={form.corporateTravelPurpose}
            onChange={(e) => setField("corporateTravelPurpose", e.target.value)}
          >
            <option value="">Select purpose</option>
            <option value="Client meeting">Client meeting</option>
            <option value="Training">Training</option>
            <option value="Sales visit">Sales visit</option>
            <option value="Audit">Audit</option>
          </select>
        </Field>
      </div>
    </Card>
  );
}

function PackageForm({ form, errors, setField }: FormProps) {
  return (
    <Card>
      <CardHeader title="Package selection" />
      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3">
        {[
          { name: "Honeymoon Bliss", price: 28000 },
          { name: "Stay & Spa", price: 18500 },
          { name: "Family Escape", price: 22000 },
        ].map((p) => (
          <button
            key={p.name}
            onClick={() => setField("packageName", p.name)}
            className={`rounded-lg border bg-surface p-4 text-left ${
              form.packageName === p.name ? "border-primary" : "border-border hover:border-primary"
            }`}
          >
            <div className="text-[14px] font-semibold text-text-primary">{p.name}</div>
            <div className="font-mono text-[12px] text-primary">
              ₹{p.price.toLocaleString()} / night
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-text-secondary">
              <CheckCircle2 className="h-3 w-3 text-success" />
              Tap to select package
            </div>
          </button>
        ))}
      </div>
      {errors.packageName && (
        <div className="px-5 pb-5 text-[11px] text-error">{errors.packageName}</div>
      )}
      <div className="grid grid-cols-1 gap-4 px-5 pb-5 md:grid-cols-2">
        <Field label="Occasion">
          <select
            className={inputCls}
            value={form.packageOccasion}
            onChange={(e) => setField("packageOccasion", e.target.value)}
          >
            <option value="">Select occasion</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Honeymoon">Honeymoon</option>
            <option value="Birthday">Birthday</option>
            <option value="Family vacation">Family vacation</option>
          </select>
        </Field>
        <Field label="Inclusion notes">
          <input
            className={inputCls}
            placeholder="Cake at 8 PM, spa slot preference..."
            value={form.packageInclusionNotes}
            onChange={(e) => setField("packageInclusionNotes", e.target.value)}
          />
        </Field>
      </div>
    </Card>
  );
}

function WalkinForm({ form, errors, setField }: FormProps) {
  return (
    <Card>
      <CardHeader title="Quick walk-in" hint="Minimum fields · ready in 60 seconds" />
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
        <Field label="Payment" error={errors.walkinPayment}>
          <select
            className={inputCls}
            value={form.walkinPayment}
            onChange={(e) => setField("walkinPayment", e.target.value)}
          >
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Net Banking">Net Banking</option>
          </select>
        </Field>
        <Field label="Vehicle number">
          <input
            className={inputCls}
            placeholder="DL 01 AB 1234"
            value={form.walkinVehicleNo}
            onChange={(e) => setField("walkinVehicleNo", e.target.value)}
          />
        </Field>
        <Field label="Deposit amount (INR)">
          <input
            className={inputCls}
            type="number"
            min={0}
            placeholder="0"
            value={form.walkinDeposit}
            onChange={(e) => setField("walkinDeposit", e.target.value)}
          />
        </Field>
      </div>
      <div className="px-5 pb-5">
        <label className="flex items-center gap-2 text-[12px] text-text-secondary">
          <input
            type="checkbox"
            checked={form.walkinIdVerified}
            onChange={(e) => setField("walkinIdVerified", e.target.checked)}
          />
          ID verified at front desk
        </label>
      </div>
    </Card>
  );
}

function EventForm({
  form,
  errors,
  setField,
  eventRangePopoverOpen,
  setEventRangePopoverOpen,
  eventTempRange,
  setEventTempRange,
  eventStartTimeHour,
  setEventStartTimeHour,
  eventStartTimeMin,
  setEventStartTimeMin,
  eventStartTimePeriod,
  setEventStartTimePeriod,
  eventEndTimeHour,
  setEventEndTimeHour,
  eventEndTimeMin,
  setEventEndTimeMin,
  eventEndTimePeriod,
  setEventEndTimePeriod,
  handleApplyEventDateRange,
  handleOpenEventDateRangePopover,
  setIsAddRoomOpen,
  handleRemoveRoomSelection,
  ratePlans,
  mealPlans,
}: FormProps & {
  eventRangePopoverOpen: boolean;
  setEventRangePopoverOpen: (open: boolean) => void;
  eventTempRange: any;
  setEventTempRange: (range: any) => void;
  eventStartTimeHour: string;
  setEventStartTimeHour: (h: string) => void;
  eventStartTimeMin: string;
  setEventStartTimeMin: (m: string) => void;
  eventStartTimePeriod: string;
  setEventStartTimePeriod: (p: string) => void;
  eventEndTimeHour: string;
  setEventEndTimeHour: (h: string) => void;
  eventEndTimeMin: string;
  setEventEndTimeMin: (m: string) => void;
  eventEndTimePeriod: string;
  setEventEndTimePeriod: (p: string) => void;
  handleApplyEventDateRange: () => void;
  handleOpenEventDateRangePopover: () => void;
  setIsAddRoomOpen: (open: boolean) => void;
  handleRemoveRoomSelection: (index: number) => void;
  ratePlans: any[];
  mealPlans: any[];
}) {
  return (
    <Card>
      <CardHeader title="Event details" />
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
        <Field label="Venue" error={errors.eventVenue}>
          <select
            className={cn(inputCls, errors.eventVenue && "border-error focus:border-error focus:ring-error/20")}
            value={form.eventVenue}
            onChange={(e) => setField("eventVenue", e.target.value)}
          >
            <option value="">Select venue</option>
            <option value="Grand Ballroom">Grand Ballroom · 500 pax</option>
            <option value="Boardroom">Boardroom · 16 pax</option>
            <option value="Garden Lawn">Garden Lawn · 250 pax</option>
          </select>
        </Field>
        <Field label="Event type" error={errors.eventType}>
          <select
            className={cn(inputCls, errors.eventType && "border-error focus:border-error focus:ring-error/20")}
            value={form.eventType}
            onChange={(e) => setField("eventType", e.target.value)}
          >
            <option value="">Select event type</option>
            <option value="Wedding">Wedding</option>
            <option value="Corporate conference">Corporate conference</option>
            <option value="Birthday">Birthday</option>
            <option value="Product launch">Product launch</option>
          </select>
        </Field>
        <Field label="Expected pax" error={errors.eventPax}>
          <input
            className={cn(inputCls, errors.eventPax && "border-error focus:border-error focus:ring-error/20")}
            type="number"
            value={form.eventPax}
            onChange={(e) => setField("eventPax", e.target.value)}
          />
        </Field>

        <Field label="Choose Event Date & Time" error={errors.eventStartDate}>
          <Popover open={eventRangePopoverOpen} onOpenChange={setEventRangePopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={handleOpenEventDateRangePopover}
                className={cn(inputCls, "flex items-center justify-between text-left font-normal cursor-pointer w-full bg-surface border", errors.eventStartDate ? "border-error focus:border-error focus:ring-error/20" : "border-border")}
              >
                <span className={!form.eventStartDate ? "text-text-secondary" : ""}>
                  {form.eventStartDate ? `${format(new Date(form.eventStartDate), "dd-MM-yyyy")}${form.eventStart ? ` @ ${form.eventStart}` : ""}` : "dd-mm-yyyy"}
                </span>
                <CalendarDays className="h-4 w-4 text-text-secondary" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border border-border bg-surface shadow-md" align="start">
              <div className="p-3">
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={eventTempRange}
                  onSelect={setEventTempRange}
                  disabled={{ before: new Date(new Date().setHours(0,0,0,0)) }}
                  className="rounded-md"
                />
                <div className="grid grid-cols-2 gap-4 border-t border-border pt-3 mt-1">
                  <div>
                    <div className="text-[11px] font-medium text-text-secondary mb-1">Start Time</div>
                    <div className="flex gap-1.5">
                      <select
                        className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                        value={eventStartTimeHour}
                        onChange={(e) => setEventStartTimeHour(e.target.value)}
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                          <option key={h} value={h}>{h.padStart(2, "0")}</option>
                        ))}
                      </select>
                      <select
                        className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                        value={eventStartTimeMin}
                        onChange={(e) => setEventStartTimeMin(e.target.value)}
                      >
                        {["00", "15", "30", "45"].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                        value={eventStartTimePeriod}
                        onChange={(e) => setEventStartTimePeriod(e.target.value)}
                      >
                        {["AM", "PM"].map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-text-secondary mb-1">End Time</div>
                    <div className="flex gap-1.5">
                      <select
                        className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                        value={eventEndTimeHour}
                        onChange={(e) => setEventEndTimeHour(e.target.value)}
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                          <option key={h} value={h}>{h.padStart(2, "0")}</option>
                        ))}
                      </select>
                      <select
                        className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                        value={eventEndTimeMin}
                        onChange={(e) => setEventEndTimeMin(e.target.value)}
                      >
                        {["00", "15", "30", "45"].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                        value={eventEndTimePeriod}
                        onChange={(e) => setEventEndTimePeriod(e.target.value)}
                      >
                        {["AM", "PM"].map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-border pt-3 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setEventRangePopoverOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    onClick={handleApplyEventDateRange}
                  >
                    Ok
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </Field>

        <Field label="Departure" error={errors.eventEndDate}>
          <div className={cn(inputCls, "flex items-center justify-between text-left font-normal w-full bg-surface border", errors.eventEndDate ? "border-error focus:border-error focus:ring-error/20" : "border-border", "select-none")}>
            <span className={!form.eventEndDate ? "text-text-secondary" : ""}>
              {form.eventEndDate ? `${format(new Date(form.eventEndDate), "dd-MM-yyyy")}${form.eventEnd ? ` @ ${form.eventEnd}` : ""}` : "dd-mm-yyyy"}
            </span>
            <CalendarDays className="h-4 w-4 text-text-secondary/50" />
          </div>
        </Field>

        <Field label="Organizer name" error={errors.eventOrganizer}>
          <input
            className={cn(inputCls, errors.eventOrganizer && "border-error focus:border-error focus:ring-error/20")}
            placeholder="Ritika Sharma"
            value={form.eventOrganizer}
            onChange={(e) => setField("eventOrganizer", e.target.value)}
          />
        </Field>
        <Field label="Organizer contact" error={errors.eventContact}>
          <input
            className={cn(inputCls, errors.eventContact && "border-error focus:border-error focus:ring-error/20")}
            placeholder="+91 98xxxxxx20"
            value={form.eventContact}
            onChange={(e) => setField("eventContact", e.target.value)}
          />
        </Field>
        <Field label="Organizer email">
          <input
            className={inputCls}
            type="email"
            placeholder="ritika@example.com"
            value={form.eventOrganizerEmail}
            onChange={(e) => setField("eventOrganizerEmail", e.target.value)}
          />
        </Field>
        <div className="md:col-span-3">
          <Field label="Organizer billing address">
            <input
              className={inputCls}
              placeholder="123 Corporate Park, Tech City"
              value={form.eventOrganizerAddress}
              onChange={(e) => setField("eventOrganizerAddress", e.target.value)}
            />
          </Field>
        </div>
        
        {/* Logistics Section */}
        <div className="col-span-1 md:col-span-3 mt-4 mb-2">
          <div className="label-uppercase text-text-secondary border-b border-border pb-2">Event Logistics</div>
        </div>
        
        <Field label="Seating arrangement">
          <select
            className={inputCls}
            value={form.eventSeatingStyle}
            onChange={(e) => setField("eventSeatingStyle", e.target.value)}
          >
            <option value="">Select style</option>
            <option value="Banquet">Banquet (Round tables)</option>
            <option value="Theater">Theater (Rows of chairs)</option>
            <option value="Classroom">Classroom (Desks & chairs)</option>
            <option value="U-Shape">U-Shape</option>
            <option value="Reception">Reception (Standing / Cocktail)</option>
          </select>
        </Field>
        <Field label="Catering menu">
          <select
            className={inputCls}
            value={form.eventCateringMenu}
            onChange={(e) => setField("eventCateringMenu", e.target.value)}
          >
            <option value="None">No Catering</option>
            <option value="Standard Buffet">Standard Buffet (Veg + Non-Veg)</option>
            <option value="Premium Buffet">Premium Buffet + Live Counters</option>
            <option value="Plated Service">Plated Service</option>
            <option value="High Tea">High Tea + Snacks</option>
          </select>
        </Field>
        <div className="md:col-span-1" />
        
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="AV & Equipment Requirements">
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                "Projector & Screen",
                "PA System",
                "Wireless Mics (x2)",
                "Stage / Podium",
                "Lighting setup",
                "DJ Console setup"
              ].map(req => {
                const isSelected = form.eventAvRequirements?.includes(req);
                return (
                  <label key={req} className="flex items-center gap-2 text-[12px] text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const current = form.eventAvRequirements || [];
                        if (e.target.checked) {
                          setField("eventAvRequirements", [...current, req]);
                        } else {
                          setField("eventAvRequirements", current.filter(r => r !== req));
                        }
                      }}
                    />
                    {req}
                  </label>
                );
              })}
            </div>
          </Field>
          
          <Field label="Decor & Setup Notes">
            <textarea
              className={`${inputCls} resize-none`}
              rows={4}
              placeholder="E.g. Flower arrangements needed, specific color themes, or external vendor arrival times."
              value={form.eventDecorNotes}
              onChange={(e) => setField("eventDecorNotes", e.target.value)}
            />
          </Field>
        </div>

        <div className="md:col-span-3 border-t border-border pt-4 mt-4">
          <Field label="Room assignments" error={errors.roomSelections}>
            <div className="flex flex-col gap-3">
              {form.roomSelections.length > 0 ? (
                <div className="grid gap-2">
                  {form.roomSelections.map((selection, i) => (
                    <div key={i} className="flex items-center justify-between border border-border rounded-md p-3 bg-surface">
                      <div>
                        <div className="font-medium text-sm text-text">{selection.roomType}</div>
                        <div className="text-xs text-text-secondary mt-1">
                          {selection.assignedRooms.length > 0
                            ? `Assigned: ${selection.assignedRooms.join(", ")}`
                            : "No specific rooms assigned"}
                        </div>
                        <div className="text-xs text-text-secondary mt-1 flex gap-2">
                          <Badge variant="outline" className="font-normal text-[10px]">{selection.occupancyType}</Badge>
                          <Badge variant="outline" className="font-normal text-[10px]">{ratePlans.find(r => r.id === selection.ratePlan)?.name || selection.ratePlan}</Badge>
                          <Badge variant="outline" className="font-normal text-[10px]">{mealPlans.find(m => m.id === selection.mealPlan)?.code || selection.mealPlan}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" type="button" onClick={() => handleRemoveRoomSelection(i)}>
                        <X className="w-4 h-4 text-text-secondary" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-text-secondary italic">No rooms added yet.</div>
              )}
              <div>
                <Button variant="outline" size="sm" type="button" onClick={() => setIsAddRoomOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Room
                </Button>
              </div>
            </div>
          </Field>
        </div>
      </div>
    </Card>
  );
}

function Summary({
  form,
  errors,
  setField,
  total,
  pricingBreakdown,
  onSubmit,
  onAddToWaitlist,
  submitting,
  priceEstimate,
  couponsList,
  isPriceEstimating,
  isTodayCheckIn,
}: {
  form: ReservationFormData;
  errors: Record<string, string>;
  setField: <K extends keyof ReservationFormData>(key: K, value: ReservationFormData[K]) => void;
  total: number;
  pricingBreakdown: ReservationPricingBreakdown;
  onSubmit: (shouldCheckIn?: boolean) => void;
  onAddToWaitlist: () => void;
  submitting: boolean;
  priceEstimate?: any;
  couponsList: any[];
  isPriceEstimating: boolean;
  isTodayCheckIn?: boolean;
}) {
  const formErrorConfirmation = errors.confirmation;
  const [typedCoupon, setTypedCoupon] = useState(form.couponCode || "");
  const [isCouponApplied, setIsCouponApplied] = useState(!!form.couponCode);

  useEffect(() => {
    setTypedCoupon(form.couponCode || "");
    setIsCouponApplied(!!form.couponCode);
  }, [form.couponCode]);

  const handleApply = () => {
    const code = typedCoupon.trim();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }
    const found = (couponsList || []).find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    );
    if (found) {
      setField("couponCode", found.code);
      setIsCouponApplied(true);
      toast.success(`Coupon "${found.code}" applied!`);
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const handleRemove = () => {
    setField("couponCode", "");
    setTypedCoupon("");
    setIsCouponApplied(false);
    toast.info("Coupon removed");
  };
  return (
    <Card>
      <CardHeader
        title="Pricing review, payment & confirmation"
        hint="Auto-send on submit"
      />
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[1fr_240px]">
        <div className="space-y-3 text-[12px]">
          <div className="rounded-md border border-border-subtle bg-surface-2/30 p-3">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">
              Price breakdown
            </div>
            <div className="space-y-1.5 text-[12px]">
              {priceEstimate ? (
                <>
                  {priceEstimate.breakdown?.map((line: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-text-secondary"
                    >
                      <span>{line.label}</span>
                      <span className="font-mono text-text-primary">
                        {line.amount < 0 ? "-" : ""}₹{Math.abs(line.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {pricingBreakdown.lines.map((line) => (
                    <div
                      key={line.label}
                      className="flex items-center justify-between text-text-secondary"
                    >
                      <span>{line.label}</span>
                      <span className="font-mono text-text-primary">
                        {line.amount < 0 ? "-" : ""}₹{Math.abs(line.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.sendEmail}
              onChange={(e) => setField("sendEmail", e.target.checked)}
            />
            <Mail className="h-3.5 w-3.5 text-text-secondary" /> Email confirmation
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.sendSms}
              onChange={(e) => setField("sendSms", e.target.checked)}
            />
            <Phone className="h-3.5 w-3.5 text-text-secondary" /> SMS confirmation
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.preAuthCard}
              onChange={(e) => setField("preAuthCard", e.target.checked)}
            />
            <CreditCard className="h-3.5 w-3.5 text-text-secondary" /> Pre-authorize card on file
          </label>
          {formErrorConfirmation ? (
            <div className="text-[11px] text-error">{formErrorConfirmation}</div>
          ) : null}
        </div>
        <div className="rounded-md border border-border bg-surface-2/40 p-4 space-y-4">
          <div>
            <div className="label-uppercase flex items-center justify-between">
              Estimated total
              <label className="flex items-center gap-1.5 text-[10px] normal-case text-text-secondary hover:text-text cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.includeTax} 
                  onChange={(e) => setField("includeTax", e.target.checked)} 
                />
                Include tax
              </label>
            </div>
            <div className="mt-1 flex items-baseline gap-2 min-h-[32px]">
              {isPriceEstimating ? (
                <div className="flex items-center gap-2 text-primary font-medium py-1 animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-[14px]">Recalculating...</span>
                </div>
              ) : isCouponApplied && priceEstimate && Number(priceEstimate.coupon_discount || 0) > 0 ? (
                <>
                  <span className="font-display text-[16px] line-through text-text-disabled font-medium">
                    ₹{(Number(priceEstimate.total_price) + Number(priceEstimate.coupon_discount)).toLocaleString()}
                  </span>
                  <span className="font-display text-[22px] font-semibold text-primary">
                    ₹{Number(priceEstimate.total_price).toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="font-display text-[22px] font-semibold text-text-primary">
                  ₹{priceEstimate ? Number(priceEstimate.total_price).toLocaleString() : Math.max(total, pricingBreakdown.total).toLocaleString()}
                </span>
              )}
            </div>
            <div className="text-[10px] text-text-disabled">
              {form.includeTax ? "Inclusive of taxes" : "Exclusive of taxes"}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border">
            <Field label="Coupon code">
              <div className="flex gap-2">
                <input
                  className={inputCls}
                  placeholder="e.g. SUMMER20"
                  value={typedCoupon}
                  onChange={(e) => setTypedCoupon(e.target.value)}
                  disabled={isCouponApplied}
                />
                {isCouponApplied ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-error border-error hover:bg-error/10 shrink-0 h-9"
                    onClick={handleRemove}
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary-tint shrink-0 h-9"
                    onClick={handleApply}
                  >
                    Apply
                  </Button>
                )}
              </div>
            </Field>
            <Field label="Payment method">
              <select
                className={inputCls}
                value={form.paymentMethod}
                onChange={(e) => {
                  const val = e.target.value;
                  setField("paymentMethod", val);
                  if (val && val !== "Cash") {
                    const finalPayableAmount = Number(form.paidAmount) || (priceEstimate ? Number(priceEstimate.total_price) : Math.max(total, pricingBreakdown.total));
                    onSubmit(false);
                  }
                }}
              >
                <option value="">Select method</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </Field>
            <Field label="Paid amount">
              <input
                className={inputCls}
                type="number"
                placeholder="₹0"
                value={form.paidAmount}
                onChange={(e) => setField("paidAmount", e.target.value)}
              />
            </Field>
            <Field label="Payment remark">
              <input
                className={inputCls}
                placeholder="Transaction ID / Notes"
                value={form.paymentRemark}
                onChange={(e) => setField("paymentRemark", e.target.value)}
              />
            </Field>
          </div>

          <div className="space-y-2 mt-4">
            {isTodayCheckIn && (
              <Button
                variant="primary"
                className="w-full font-semibold gap-1.5"
                size="sm"
                onClick={() => onSubmit(true)}
                disabled={submitting}
              >
                <CheckCircle2 className="w-4 h-4" />
                Reserve & Check-In Now (Walk-In)
              </Button>
            )}
            <Button
              variant={isTodayCheckIn ? "outline" : "primary"}
              className="w-full font-semibold"
              size="sm"
              onClick={() => onSubmit(false)}
              disabled={submitting}
            >
              {submitting ? "Confirming..." : "Confirm reservation only"}
            </Button>
            <Button variant="ghost" className="w-full text-text-secondary text-xs" size="sm" onClick={onAddToWaitlist} disabled={submitting}>
              Add to waitlist
            </Button>
          </div>
        </div>
      </div>
    </Card>

  );
}
export default NewReservationFeature;
