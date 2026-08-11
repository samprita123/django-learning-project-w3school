// Persistent onboarding wizard state (frontend-first, localStorage-backed).

export type OnboardingStepKey =
  | "dashboard"
  | "property"
  | "rooms"
  | "meal-plans"
  | "rate-plans"
  | "packages"
  | "users"
  | "tax"
  | "payments"
  | "channel-manager"
  | "booking-engine"
  | "website-builder"
  | "crm"
  | "reservation-settings"
  | "go-live";

export type PropertyType =
  | "hotel"
  | "resort"
  | "boutique_hotel"
  | "hotel_chain"
  | "serviced_apartment"
  | "villa"
  | "homestay";

export type RoomTypeConfig = {
  id: string;
  name: string;
  count: number;
  capacity: number;
  baseRate: number;
  amenities: string;
  description: string;
  imageUrl?: string;
};

export type RatePlanConfig = {
  id: string;
  name: string;
  category:
    | "flexible"
    | "non_refundable"
    | "corporate"
    | "government"
    | "weekend"
    | "early_bird"
    | "long_stay"
    | "member"
    | "promotional";
  discountPercent: number;
  cancellationPolicy: string;
  minStay: number;
  maxStay: number;
  active: boolean;
};

export type MealPlanConfig = {
  id: string;
  code: "EP" | "CP" | "MAP" | "AP" | "AI" | "UAI";
  name: string;
  includedMeals: string;
  priceAdjustment: number;
  availability: "All year" | "Seasonal" | "Weekend only";
  active: boolean;
};

export type PackageConfig = {
  id: string;
  name: string;
  basePrice: number;
  includes: string;
  active: boolean;
};

export type StaffInvite = { id: string; name: string; email: string; role: string };

export type IntegrationChannel = {
  key: string;
  label: string;
  connected: boolean;
  mapped: boolean;
};

export type GoLiveValidation = {
  id: string;
  label: string;
  status: "pass" | "warning" | "error";
  message: string;
};

export type OnboardingState = {
  step: number;
  completed: boolean;
  profile: {
    propertyName: string;
    propertyCode: string;
    propertyType: PropertyType;
    propertyCategory: string;
    brandName: string;
    contactEmail: string;
    contactPhone: string;
    addressLine1: string;
    addressLine2: string;
    country: string;
    state: string;
    city: string;
    timezone: string;
    currency: string;
    gstVatNumber: string;
    logoUrl?: string;
    imageUrls: string[];
  };
  roomTypes: RoomTypeConfig[];
  mealPlans: MealPlanConfig[];
  ratePlans: RatePlanConfig[];
  packages: PackageConfig[];
  users: StaffInvite[];
  tax: {
    gst: number;
    vat: number;
    cityTax: number;
    serviceCharge: number;
    luxuryTax: number;
  };
  payments: {
    cash: boolean;
    card: boolean;
    upi: boolean;
    onlinePayments: boolean;
    paymentGateway: string;
    refundRules: string;
  };
  channelManager: {
    provider: string;
    channels: IntegrationChannel[];
    inventorySyncMinutes: number;
  };
  bookingEngine: {
    enabled: boolean;
    promoCodesEnabled: boolean;
    directBookingOffer: string;
    cancellationRules: string;
  };
  websiteBuilder: {
    theme: string;
    pagesConfigured: boolean;
    galleryConfigured: boolean;
    roomsConfigured: boolean;
    offersConfigured: boolean;
    contactConfigured: boolean;
    seoConfigured: boolean;
  };
  crm: {
    segmentsConfigured: boolean;
    loyaltyConfigured: boolean;
    emailTemplatesConfigured: boolean;
    smsTemplatesConfigured: boolean;
    whatsappTemplatesConfigured: boolean;
  };
  reservationSettings: {
    checkIn: string;
    checkOut: string;
    cancellationPolicy: string;
    noShowPolicy: string;
    idRequired: string[];
  };
  progress: Record<OnboardingStepKey, boolean>;
  validation: GoLiveValidation[];
};

export type OnboardingProgressSummary = {
  total: number;
  completed: number;
  percentage: number;
  pending: OnboardingStepKey[];
  nextStep: OnboardingStepKey;
};

export const ONBOARDING_STORAGE_KEY = "retrod.onboarding.v2";

export const DEFAULT_ONBOARDING: OnboardingState = {
  step: 0,
  completed: false,
  profile: {
    propertyName: "",
    propertyCode: "",
    propertyType: "hotel",
    propertyCategory: "Luxury",
    brandName: "",
    contactEmail: "",
    contactPhone: "",
    addressLine1: "",
    addressLine2: "",
    country: "India",
    state: "",
    city: "",
    timezone: "Asia/Kolkata",
    currency: "INR",
    gstVatNumber: "",
    imageUrls: [],
  },
  roomTypes: [
    {
      id: "rt-1",
      name: "Standard Room",
      count: 12,
      capacity: 2,
      baseRate: 6500,
      amenities: "Queen bed, Wi-Fi, TV",
      description: "Comfort room with city-facing windows.",
    },
    {
      id: "rt-2",
      name: "Deluxe Room",
      count: 18,
      capacity: 3,
      baseRate: 9200,
      amenities: "King bed, Wi-Fi, Mini-bar",
      description: "Spacious room with upgraded amenities.",
    },
  ],
  mealPlans: [
    {
      id: "meal-ep",
      code: "EP",
      name: "European Plan",
      includedMeals: "Room Only",
      priceAdjustment: 0,
      availability: "All year",
      active: true,
    },
    {
      id: "meal-cp",
      code: "CP",
      name: "Continental Plan",
      includedMeals: "Breakfast",
      priceAdjustment: 900,
      availability: "All year",
      active: true,
    },
    {
      id: "meal-map",
      code: "MAP",
      name: "Modified American Plan",
      includedMeals: "Breakfast + Lunch or Dinner",
      priceAdjustment: 2200,
      availability: "All year",
      active: true,
    },
  ],
  ratePlans: [
    {
      id: "rate-flexible",
      name: "Flexible",
      category: "flexible",
      discountPercent: 0,
      cancellationPolicy: "Free cancellation up to 24h.",
      minStay: 1,
      maxStay: 30,
      active: true,
    },
    {
      id: "rate-corporate",
      name: "Corporate",
      category: "corporate",
      discountPercent: 12,
      cancellationPolicy: "As per corporate agreement.",
      minStay: 1,
      maxStay: 45,
      active: true,
    },
  ],
  packages: [
    {
      id: "pkg-honeymoon",
      name: "Honeymoon Package",
      basePrice: 6500,
      includes: "Room, meals, decor, spa credit",
      active: true,
    },
    {
      id: "pkg-family",
      name: "Family Package",
      basePrice: 4300,
      includes: "Room, breakfast, city activity",
      active: true,
    },
  ],
  users: [],
  tax: {
    gst: 18,
    vat: 0,
    cityTax: 0,
    serviceCharge: 0,
    luxuryTax: 0,
  },
  payments: {
    cash: true,
    card: true,
    upi: true,
    onlinePayments: true,
    paymentGateway: "Razorpay",
    refundRules: "Refund to original source within 7 business days.",
  },
  channelManager: {
    provider: "SiteMinder",
    channels: [
      { key: "booking", label: "Booking.com", connected: false, mapped: false },
      { key: "agoda", label: "Agoda", connected: false, mapped: false },
      { key: "expedia", label: "Expedia", connected: false, mapped: false },
      { key: "airbnb", label: "Airbnb", connected: false, mapped: false },
      { key: "makemytrip", label: "MakeMyTrip", connected: false, mapped: false },
      { key: "goibibo", label: "Goibibo", connected: false, mapped: false },
      { key: "tripcom", label: "Trip.com", connected: false, mapped: false },
    ],
    inventorySyncMinutes: 15,
  },
  bookingEngine: {
    enabled: true,
    promoCodesEnabled: true,
    directBookingOffer: "Save 10% on direct bookings",
    cancellationRules: "Flexible up to 24 hours prior to arrival.",
  },
  websiteBuilder: {
    theme: "Retrod Classic",
    pagesConfigured: false,
    galleryConfigured: false,
    roomsConfigured: false,
    offersConfigured: false,
    contactConfigured: false,
    seoConfigured: false,
  },
  crm: {
    segmentsConfigured: false,
    loyaltyConfigured: false,
    emailTemplatesConfigured: false,
    smsTemplatesConfigured: false,
    whatsappTemplatesConfigured: false,
  },
  reservationSettings: {
    checkIn: "14:00",
    checkOut: "12:00",
    cancellationPolicy: "Free cancellation up to 48 hours before check-in.",
    noShowPolicy: "One night charge applies.",
    idRequired: ["Passport", "Government ID"],
  },
  progress: {
    dashboard: false,
    property: false,
    rooms: false,
    "meal-plans": false,
    "rate-plans": false,
    packages: false,
    users: false,
    tax: false,
    payments: false,
    "channel-manager": false,
    "booking-engine": false,
    "website-builder": false,
    crm: false,
    "reservation-settings": false,
    "go-live": false,
  },
  validation: [],
};

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function computeOnboardingProgress(state: OnboardingState): OnboardingProgressSummary {
  const entries = Object.entries(state.progress) as Array<[OnboardingStepKey, boolean]>;
  const completed = entries.filter((entry) => entry[1]).length;
  const total = entries.length;
  const pending = entries.filter((entry) => !entry[1]).map((entry) => entry[0]);
  return {
    total,
    completed,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    pending,
    nextStep: pending[0] ?? "go-live",
  };
}

export function runGoLiveValidation(state: OnboardingState): GoLiveValidation[] {
  const checks: GoLiveValidation[] = [];

  const propertyReady =
    state.profile.propertyName.trim().length > 1 &&
    state.profile.addressLine1.trim().length > 3 &&
    state.profile.city.trim().length > 1 &&
    state.profile.contactEmail.includes("@");
  checks.push({
    id: "property",
    label: "Property information",
    status: propertyReady ? "pass" : "error",
    message: propertyReady
      ? "Property profile is complete."
      : "Complete mandatory property fields.",
  });

  const gstReady =
    state.profile.country !== "India" ||
    state.profile.gstVatNumber.trim() === "" ||
    GSTIN_REGEX.test(state.profile.gstVatNumber.trim().toUpperCase());
  checks.push({
    id: "tax-id",
    label: "GST / VAT details",
    status: gstReady ? "pass" : "error",
    message: gstReady ? "Tax registration format is valid." : "GSTIN format is invalid.",
  });

  const roomsReady = state.roomTypes.length > 0 && state.roomTypes.every((room) => room.count > 0);
  checks.push({
    id: "rooms",
    label: "Room configuration",
    status: roomsReady ? "pass" : "error",
    message: roomsReady
      ? "Rooms and inventory are configured."
      : "Add at least one room type with inventory.",
  });

  const mealPlansReady = state.mealPlans.some((plan) => plan.active);
  checks.push({
    id: "meal-plans",
    label: "Meal plans",
    status: mealPlansReady ? "pass" : "error",
    message: mealPlansReady
      ? "At least one active meal plan found."
      : "Activate at least one meal plan.",
  });

  const rateReadiness = (() => {
    const active = state.ratePlans.filter((plan) => plan.active);
    const hasBar = active.some(
      (plan) =>
        (plan.category === "flexible" && plan.discountPercent === 0) ||
        plan.name.toLowerCase().includes("bar"),
    );
    const hasRooms = state.roomTypes.length > 0 && active.length > 0;
    return { active, hasBar, hasRooms };
  })();

  checks.push({
    id: "rate-plans",
    label: "Rate plans",
    status:
      rateReadiness.active.length > 0 && rateReadiness.hasBar && rateReadiness.hasRooms
        ? "pass"
        : rateReadiness.active.length > 0
          ? "warning"
          : "error",
    message:
      rateReadiness.active.length === 0
        ? "Activate at least one rate plan."
        : !rateReadiness.hasBar
          ? "Add an active flexible/BAR plan (0% discount) before go-live."
          : !rateReadiness.hasRooms
            ? "Configure room types so rate plans can link to inventory on publish."
            : "Rate plans ready — will publish to Rate Plans module on go-live.",
  });

  const taxConfigured =
    state.tax.gst >= 0 && state.tax.serviceCharge >= 0 && state.tax.cityTax >= 0;
  checks.push({
    id: "tax-config",
    label: "Tax configuration",
    status: taxConfigured ? "pass" : "warning",
    message: taxConfigured
      ? `Taxes configured (GST ${state.tax.gst}%, service ${state.tax.serviceCharge}%) — will publish to Taxes & Fees on go-live.`
      : "Review GST, service charge, and city tax in Meal Plans, Rates & Tax step.",
  });

  checks.push({
    id: "availability-grid",
    label: "Availability grid",
    status: roomsReady ? "pass" : "warning",
    message: roomsReady
      ? "Room inventory will seed a 30-day availability calendar on go-live."
      : "Configure room types before availability can be published.",
  });

  const usersReady = state.users.length > 0;
  checks.push({
    id: "users",
    label: "User setup",
    status: usersReady ? "pass" : "warning",
    message: usersReady
      ? "Staff invites are configured."
      : "No user invites found; recommend adding key roles.",
  });

  const paymentsReady = state.payments.cash || state.payments.card || state.payments.upi;
  checks.push({
    id: "payments",
    label: "Payment configuration",
    status: paymentsReady ? "pass" : "error",
    message: paymentsReady
      ? "At least one payment mode is enabled."
      : "Enable at least one payment mode.",
  });

  const channelsConnected = state.channelManager.channels.filter((ch) => ch.connected).length;
  checks.push({
    id: "channel-manager",
    label: "Channel manager",
    status: channelsConnected > 0 ? "pass" : "warning",
    message:
      channelsConnected > 0
        ? "At least one OTA channel is connected."
        : "No OTA channels connected; direct-only launch possible.",
  });

  const websiteReady =
    state.websiteBuilder.pagesConfigured &&
    state.websiteBuilder.roomsConfigured &&
    state.websiteBuilder.contactConfigured;
  checks.push({
    id: "website",
    label: "Website builder",
    status: websiteReady ? "pass" : "warning",
    message: websiteReady
      ? "Core website pages are configured."
      : "Configure pages/rooms/contact for better direct conversion.",
  });

  return checks;
}

export function withDerivedOnboarding(state: OnboardingState): OnboardingState {
  const validation = runGoLiveValidation(state);
  const progress: Record<OnboardingStepKey, boolean> = {
    dashboard: true,
    property: validation.find((check) => check.id === "property")?.status === "pass",
    rooms: validation.find((check) => check.id === "rooms")?.status === "pass",
    "meal-plans": validation.find((check) => check.id === "meal-plans")?.status === "pass",
    "rate-plans": validation.find((check) => check.id === "rate-plans")?.status === "pass",
    packages: state.packages.some((pkg) => pkg.active),
    users: state.users.length > 0,
    tax: validation.find((check) => check.id === "tax-id")?.status === "pass",
    payments: validation.find((check) => check.id === "payments")?.status === "pass",
    "channel-manager": state.channelManager.channels.some((channel) => channel.connected),
    "booking-engine": state.bookingEngine.enabled,
    "website-builder":
      state.websiteBuilder.pagesConfigured &&
      state.websiteBuilder.roomsConfigured &&
      state.websiteBuilder.contactConfigured,
    crm:
      state.crm.segmentsConfigured &&
      (state.crm.emailTemplatesConfigured ||
        state.crm.smsTemplatesConfigured ||
        state.crm.whatsappTemplatesConfigured),
    "reservation-settings":
      state.reservationSettings.checkIn.length > 0 &&
      state.reservationSettings.checkOut.length > 0 &&
      state.reservationSettings.cancellationPolicy.length > 5,
    "go-live": validation.every((check) => check.status !== "error"),
  };
  return {
    ...state,
    progress,
    validation,
  };
}

export function loadOnboarding(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_ONBOARDING;
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return DEFAULT_ONBOARDING;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    return withDerivedOnboarding({
      ...DEFAULT_ONBOARDING,
      ...parsed,
      profile: { ...DEFAULT_ONBOARDING.profile, ...(parsed.profile ?? {}) },
      payments: { ...DEFAULT_ONBOARDING.payments, ...(parsed.payments ?? {}) },
      tax: { ...DEFAULT_ONBOARDING.tax, ...(parsed.tax ?? {}) },
      bookingEngine: { ...DEFAULT_ONBOARDING.bookingEngine, ...(parsed.bookingEngine ?? {}) },
      websiteBuilder: { ...DEFAULT_ONBOARDING.websiteBuilder, ...(parsed.websiteBuilder ?? {}) },
      crm: { ...DEFAULT_ONBOARDING.crm, ...(parsed.crm ?? {}) },
      reservationSettings: {
        ...DEFAULT_ONBOARDING.reservationSettings,
        ...(parsed.reservationSettings ?? {}),
      },
      channelManager: {
        ...DEFAULT_ONBOARDING.channelManager,
        ...(parsed.channelManager ?? {}),
        channels: parsed.channelManager?.channels ?? DEFAULT_ONBOARDING.channelManager.channels,
      },
      roomTypes: parsed.roomTypes ?? DEFAULT_ONBOARDING.roomTypes,
      mealPlans: parsed.mealPlans ?? DEFAULT_ONBOARDING.mealPlans,
      ratePlans: parsed.ratePlans ?? DEFAULT_ONBOARDING.ratePlans,
      packages: parsed.packages ?? DEFAULT_ONBOARDING.packages,
      users: parsed.users ?? DEFAULT_ONBOARDING.users,
    });
  } catch {
    return DEFAULT_ONBOARDING;
  }
}

export function saveOnboarding(state: OnboardingState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(withDerivedOnboarding(state)));
}

export function clearOnboarding() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}
