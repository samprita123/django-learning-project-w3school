import {
  Reservation,
  HousekeepingRoom,
  RevenueTrendEntry,
  OTABreakdownEntry,
  RoomStatusDonutEntry,
  ActivityFeedEntry,
  OccupancyByTypeEntry,
  RevenueKPIEntry,
  DashboardAlertEntry,
  Forecast7DEntry,
  AvailabilityMatrixEntry,
  RateCalendarEntry,
  Restriction,
  GuestProfile,
  WaitlistEntry,
  GroupBlock,
  WorkOrder,
  OpsTask,
  GuestServiceRequest,
  OtaMapping,
  OtaSyncLog,
  PricingRule,
  MealPlan,
  RatePlan,
  RatePlanPolicy,
  Package,
  PackageItem,
  OccupancyPricing,
  CorporateAccount,
  OnlineCheckIn,
  CommThread,
  LoyaltyMember,
  RegistrationCard,
  LostFoundItem,
  FeedbackEntry,
  BookingPromo,
  PackageProduct,
  AddOnProduct,
  ConciergeRequest,
  TransportTrip,
  ActivitySlot,
  PortfolioProperty,
  AIRevenueDashboardData,
  FrontDeskWorkflowReservation,
  WebsiteBuilderWorkspace,
  WebsiteBuilderApproval,
  WebsiteBuilderPublishEvent,
} from "@/types/pms";

export const ROOM_TYPES = [
  "Deluxe King",
  "Deluxe Twin",
  "Premier Suite",
  "Executive",
  "Heritage Suite",
] as const;
export const OTAS = ["Booking.com", "Expedia", "Direct", "Agoda", "Airbnb"] as const;

export const reservations: Reservation[] = [
  {
    id: "RES-2041",
    guest: "John Mathews",
    room: "204",
    type: "Deluxe King",
    ci: "15 May",
    co: "18 May",
    nights: 3,
    amount: 36000,
    status: "Confirmed",
    source: "Booking.com",
    balance: 0,
  },
  {
    id: "RES-2042",
    guest: "Priya Sharma",
    room: "312",
    type: "Premier Suite",
    ci: "15 May",
    co: "17 May",
    nights: 2,
    amount: 48000,
    status: "Checked-In",
    source: "Direct",
    balance: 0,
  },
  {
    id: "RES-2043",
    guest: "Hiroshi Tanaka",
    room: "108",
    type: "Executive",
    ci: "15 May",
    co: "20 May",
    nights: 5,
    amount: 72000,
    status: "Pending",
    source: "Expedia",
    balance: 14400,
  },
  {
    id: "RES-2044",
    guest: "Elena Rodriguez",
    room: "401",
    type: "Heritage Suite",
    ci: "16 May",
    co: "19 May",
    nights: 3,
    amount: 105000,
    status: "Confirmed",
    source: "Direct",
    balance: 0,
  },
  {
    id: "RES-2045",
    guest: "Marcus Weber",
    room: "215",
    type: "Deluxe Twin",
    ci: "14 May",
    co: "15 May",
    nights: 1,
    amount: 9800,
    status: "Checked-Out",
    source: "Agoda",
    balance: 0,
  },
  {
    id: "RES-2046",
    guest: "Aisha Khan",
    room: "302",
    type: "Premier Suite",
    ci: "15 May",
    co: "16 May",
    nights: 1,
    amount: 22000,
    status: "No-Show",
    source: "Booking.com",
    balance: 22000,
  },
  {
    id: "RES-2047",
    guest: "Ravi Iyer",
    room: "118",
    type: "Deluxe King",
    ci: "15 May",
    co: "18 May",
    nights: 3,
    amount: 33000,
    status: "Cancelled",
    source: "Airbnb",
    balance: 0,
  },
  {
    id: "RES-2048",
    guest: "Sophie Laurent",
    room: "405",
    type: "Heritage Suite",
    ci: "16 May",
    co: "21 May",
    nights: 5,
    amount: 175000,
    status: "Confirmed",
    source: "Direct",
    balance: 0,
  },
];

export const arrivalsToday: Reservation[] = reservations.filter(
  (r) => r.ci === "15 May" && (r.status === "Confirmed" || r.status === "Pending"),
);
export const departuresToday: Reservation[] = reservations.filter((r) => r.co === "15 May");

export const frontDeskWorkflowReservations: FrontDeskWorkflowReservation[] = [
  {
    ...reservations[0],
    reservationType: "individual",
    frontDeskStatus: "pending_id",
    billingMode: "guest_pay",
    folioState: "partially_settled",
    checkinChecklist: [
      { key: "find_guest", label: "Find guest", done: true, required: true },
      { key: "verify_id", label: "Verify ID", done: false, required: true },
      { key: "assign_room", label: "Assign room", done: true, required: true },
      {
        key: "collect_payment",
        label: "Collect payment",
        done: false,
        required: true,
        note: "₹4,800 due",
      },
      { key: "issue_key", label: "Issue key", done: false, required: true },
    ],
    checkoutChecklist: [
      { key: "review_folio", label: "Review folio", done: false, required: true },
      { key: "return_key", label: "Return key", done: false, required: true },
      { key: "send_invoice", label: "Send invoice", done: false, required: true },
      { key: "handover_hk", label: "Handover to HK", done: false, required: true },
    ],
    blockerCodes: ["missing_id", "unsettled_folio"],
  },
  {
    ...reservations[7],
    reservationType: "package",
    frontDeskStatus: "pre_arrival",
    billingMode: "guest_pay",
    folioState: "open",
    checkinChecklist: [
      { key: "find_guest", label: "Find guest", done: true, required: true },
      { key: "verify_id", label: "Verify ID", done: true, required: true },
      { key: "assign_room", label: "Assign room", done: false, required: true },
      { key: "collect_payment", label: "Collect payment", done: true, required: true },
      { key: "issue_key", label: "Issue key", done: false, required: true },
    ],
    checkoutChecklist: [
      { key: "review_folio", label: "Review folio", done: false, required: true },
      { key: "return_key", label: "Return key", done: false, required: true },
      { key: "send_invoice", label: "Send invoice", done: false, required: true },
      { key: "handover_hk", label: "Handover to HK", done: false, required: true },
    ],
    blockerCodes: ["room_not_ready"],
    packageMeta: {
      packageName: "Honeymoon Bliss",
      inclusions: ["Spa 60 min", "Candle-light dinner", "Airport pickup"],
      benefitsPosted: false,
      unusedEntitlementCredit: 0,
    },
  },
  {
    ...reservations[2],
    reservationType: "corporate",
    frontDeskStatus: "pending_payment",
    billingMode: "direct_bill",
    folioState: "open",
    checkinChecklist: [
      { key: "find_guest", label: "Find guest", done: true, required: true },
      { key: "verify_id", label: "Verify ID", done: false, required: true },
      { key: "assign_room", label: "Assign room", done: true, required: true },
      {
        key: "collect_payment",
        label: "Collect payment",
        done: false,
        required: true,
        note: "Awaiting PO",
      },
      { key: "issue_key", label: "Issue key", done: false, required: true },
    ],
    checkoutChecklist: [
      { key: "review_folio", label: "Review folio", done: false, required: true },
      { key: "return_key", label: "Return key", done: false, required: true },
      { key: "send_invoice", label: "Send invoice", done: false, required: true },
      { key: "handover_hk", label: "Handover to HK", done: false, required: true },
    ],
    blockerCodes: ["pending_po"],
    corporateMeta: {
      company: "Deloitte India",
      poRef: "",
      costCenter: "CONS-DEL",
      cityLedgerCode: "CL-9021",
    },
  },
  {
    ...reservations[4],
    reservationType: "walkin",
    frontDeskStatus: "checkout_due",
    billingMode: "guest_pay",
    folioState: "settled",
    checkinChecklist: [
      { key: "find_guest", label: "Find guest", done: true, required: true },
      { key: "verify_id", label: "Verify ID", done: true, required: true },
      { key: "assign_room", label: "Assign room", done: true, required: true },
      { key: "collect_payment", label: "Collect payment", done: true, required: true },
      { key: "issue_key", label: "Issue key", done: true, required: true },
    ],
    checkoutChecklist: [
      { key: "review_folio", label: "Review folio", done: true, required: true },
      { key: "return_key", label: "Return key", done: false, required: true },
      { key: "send_invoice", label: "Send invoice", done: true, required: true },
      { key: "handover_hk", label: "Handover to HK", done: false, required: true },
    ],
    blockerCodes: [],
    walkinMeta: {
      idVerified: true,
      depositAmount: 3000,
      vehicleNo: "DL 01 AB 1234",
    },
  },
  {
    ...reservations[3],
    reservationType: "event",
    frontDeskStatus: "checkout_in_progress",
    billingMode: "split",
    folioState: "partially_settled",
    checkinChecklist: [
      { key: "find_guest", label: "Find guest", done: true, required: true },
      { key: "verify_id", label: "Verify ID", done: true, required: true },
      { key: "assign_room", label: "Assign room", done: true, required: true },
      { key: "collect_payment", label: "Collect payment", done: true, required: true },
      { key: "issue_key", label: "Issue key", done: true, required: true },
    ],
    checkoutChecklist: [
      { key: "review_folio", label: "Review folio", done: true, required: true },
      { key: "return_key", label: "Return key", done: false, required: true },
      { key: "send_invoice", label: "Send invoice", done: false, required: true },
      { key: "handover_hk", label: "Handover to HK", done: false, required: true },
    ],
    blockerCodes: ["event_overage_pending"],
    eventMeta: {
      eventName: "Global Product Launch",
      venue: "Grand Ballroom",
      organizer: "Ritika Sharma",
      contact: "+91 9876543210",
      billingSplit: "venue_catering_av",
      overageAmount: 42000,
    },
  },
  {
    ...reservations[6],
    reservationType: "group",
    frontDeskStatus: "pre_arrival",
    billingMode: "split",
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
    blockerCodes: ["pickup_mismatch"],
    groupMeta: {
      blockName: "Tata Steel Annual Offsite",
      blockedRooms: 50,
      pickedUpRooms: 38,
      roomingListReady: false,
      settlementMode: "master",
    },
  },
];

export const housekeepingRooms: HousekeepingRoom[] = [
  { num: "101", type: "Deluxe King", status: "Ready", staff: "Priya" },
  { num: "102", type: "Deluxe King", status: "Cleaning", staff: "Lakshmi" },
  { num: "103", type: "Deluxe Twin", status: "Dirty", staff: "—" },
  { num: "104", type: "Deluxe Twin", status: "Ready", staff: "Anjali" },
  { num: "105", type: "Executive", status: "OOO", staff: "Maintenance" },
  { num: "106", type: "Executive", status: "Inspected", staff: "Priya" },
  { num: "201", type: "Deluxe King", status: "Ready", staff: "Sunil" },
  { num: "202", type: "Deluxe King", status: "Cleaning", staff: "Lakshmi" },
  { num: "203", type: "Deluxe Twin", status: "Dirty", staff: "—" },
  { num: "204", type: "Premier Suite", status: "Ready", staff: "Anjali" },
  { num: "205", type: "Premier Suite", status: "Dirty", staff: "—" },
  { num: "206", type: "Executive", status: "Ready", staff: "Sunil" },
  { num: "301", type: "Premier Suite", status: "Inspected", staff: "Priya" },
  { num: "302", type: "Premier Suite", status: "Cleaning", staff: "Lakshmi" },
  { num: "303", type: "Heritage Suite", status: "Ready", staff: "Anjali" },
  { num: "304", type: "Heritage Suite", status: "Dirty", staff: "—" },
  { num: "401", type: "Heritage Suite", status: "Ready", staff: "Sunil" },
  { num: "402", type: "Heritage Suite", status: "Inspected", staff: "Priya" },
];

export const revenueTrend: RevenueTrendEntry[] = Array.from({ length: 30 }, (_, i) => {
  const base = 380000 + Math.sin(i / 3) * 60000 + i * 4200 + (i % 7 === 5 ? 80000 : 0);
  const occ = 62 + Math.sin(i / 4) * 12 + (i % 7 === 5 ? 15 : 0);
  return {
    day: `${i + 1}`,
    revenue: Math.round(base),
    occupancy: Math.round(Math.min(98, Math.max(40, occ))),
  };
});

export const otaBreakdown: OTABreakdownEntry[] = [
  { source: "Booking.com", bookings: 142, revenue: 1820000 },
  { source: "Direct", bookings: 96, revenue: 1450000 },
  { source: "Expedia", bookings: 58, revenue: 720000 },
  { source: "Agoda", bookings: 34, revenue: 410000 },
  { source: "Airbnb", bookings: 22, revenue: 280000 },
];

export const roomStatusDonut: RoomStatusDonutEntry[] = [
  { name: "Occupied", value: 84, color: "var(--color-info)" },
  { name: "Vacant", value: 18, color: "var(--color-success)" },
  { name: "Dirty", value: 12, color: "var(--color-warning)" },
  { name: "Out of Order", value: 6, color: "var(--color-text-secondary)" },
];

export const activityFeed: ActivityFeedEntry[] = [
  {
    time: "11:42",
    text: "Reservation #RES-2048 confirmed for Sophie Laurent · Heritage Suite",
    tone: "success",
  },
  { time: "11:18", text: "Payment of ₹48,000 received · INV-3104 · Priya Sharma", tone: "info" },
  { time: "10:55", text: "Room 215 marked Inspected by Priya", tone: "neutral" },
  { time: "10:32", text: "Check-in completed · Marcus Weber · Room 215", tone: "info" },
  { time: "09:48", text: "OTA rate updated · Booking.com · Deluxe King +₹600", tone: "warning" },
];

export const occupancyByType: OccupancyByTypeEntry[] = [
  { type: "Deluxe King", total: 36, occupied: 31 },
  { type: "Deluxe Twin", total: 28, occupied: 22 },
  { type: "Premier Suite", total: 24, occupied: 19 },
  { type: "Executive", total: 20, occupied: 8 },
  { type: "Heritage Suite", total: 12, occupied: 4 },
];

export const revenueKpis: RevenueKPIEntry[] = [
  { label: "Rooms", today: 1842000, budget: 1700000, sty: 1610000 },
  { label: "Food & Beverage", today: 624000, budget: 700000, sty: 580000 },
  { label: "Spa & Wellness", today: 198000, budget: 150000, sty: 142000 },
  { label: "Misc", today: 84000, budget: 80000, sty: 78000 },
];

export const dashboardAlerts: DashboardAlertEntry[] = [
  {
    id: "A1",
    tone: "brand",
    title: "VIP arrival in 1h 42m",
    body: "Sophie Laurent · Heritage Suite 405 · Amenity setup pending",
    at: "13:18",
  },
  {
    id: "A2",
    tone: "warning",
    title: "Overdue checkout · Room 312",
    body: "Priya Sharma · ₹4,800 balance · 38 min over checkout time",
    at: "11:38",
  },
  {
    id: "A3",
    tone: "error",
    title: "Critical work order open 5h 12m",
    body: "Room 207 · HVAC failure · Engineering: Suresh",
    at: "08:46",
  },
  {
    id: "A4",
    tone: "warning",
    title: "Linen below par",
    body: "Bath towels 22% below par · auto PR raised to vendor",
    at: "07:55",
  },
  {
    id: "A5",
    tone: "info",
    title: "OTA rate parity drift",
    body: "Agoda showing -3% vs hotel website on Deluxe King",
    at: "07:12",
  },
];

export const forecast7d: Forecast7DEntry[] = Array.from({ length: 7 }, (_, i) => {
  const labels = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  const occ = [86, 91, 72, 68, 74, 82, 88][i];
  const adr = [13200, 14400, 11800, 11400, 12100, 12900, 13600][i];
  return { day: labels[i], date: 16 + i, occ, adr, revenue: Math.round((occ / 100) * 120 * adr) };
});

export const availabilityMatrix: AvailabilityMatrixEntry[] = (() => {
  const types = ["Deluxe King", "Deluxe Twin", "Premier Suite", "Executive", "Heritage Suite"];
  return types.map((t, ti) => ({
    type: t,
    days: Array.from({ length: 14 }, (_, di) => {
      const seed = (ti * 7 + di * 3) % 11;
      const total = [36, 28, 24, 20, 12][ti];
      const sold = Math.min(total, Math.round(total * (0.55 + seed / 22)));
      return { date: 15 + di, sold, total };
    }),
  }));
})();

export const rateCalendar: RateCalendarEntry[] = (() => {
  const types = ["Deluxe King", "Premier Suite", "Heritage Suite"];
  const base = [11000, 22000, 35000];
  return types.map((t, ti) => ({
    type: t,
    days: Array.from({ length: 14 }, (_, di) => {
      const isWknd = (di + 5) % 7 === 0 || (di + 6) % 7 === 0;
      const isEvent = di === 6 || di === 7;
      const factor = isEvent ? 1.32 : isWknd ? 1.18 : 1;
      return {
        date: 15 + di,
        rate: Math.round(base[ti] * factor),
        tag: isEvent ? "Event" : isWknd ? "Weekend" : "BAR",
      };
    }),
  }));
})();

export const restrictions: Restriction[] = [
  { date: 16, type: "Heritage Suite", kind: "Min 2N" },
  { date: 18, type: "All", kind: "CTA" },
  { date: 21, type: "Premier Suite", kind: "Stop Sell" },
  { date: 22, type: "All", kind: "CTD" },
  { date: 24, type: "Deluxe King", kind: "Min 3N" },
];

export const guests: GuestProfile[] = [
  {
    name: "Sophie Laurent",
    country: "France",
    visits: 4,
    ltv: 412000,
    tier: "Platinum",
    email: "s.laurent@email.fr",
    phone: "+33 6 12 34 56 78",
    nps: 72,
    tags: ["VIP", "Spa"],
    stays: [
      { id: "ST-901", room: "405", ci: "16 May 2026", co: "21 May 2026", amount: 175000 },
      { id: "ST-744", room: "401", ci: "12 Jan 2026", co: "15 Jan 2026", amount: 98000 },
    ],
    notes: [
      {
        at: "14 May 11:20",
        author: "FO",
        text: "Prefers rose amenity set. Late checkout approved.",
      },
    ],
  },
  {
    name: "John Mathews",
    country: "UK",
    visits: 2,
    ltv: 96000,
    tier: "Gold",
    email: "j.mathews@email.co.uk",
    nps: 58,
    stays: [{ id: "ST-902", room: "204", ci: "15 May 2026", co: "18 May 2026", amount: 36000 }],
    notes: [],
  },
  {
    name: "Hiroshi Tanaka",
    country: "Japan",
    visits: 6,
    ltv: 580000,
    tier: "Platinum",
    nps: 81,
    tags: ["Corporate"],
    stays: [{ id: "ST-903", room: "108", ci: "15 May 2026", co: "20 May 2026", amount: 72000 }],
    notes: [
      { at: "10 May 09:00", author: "Sales", text: "Negotiated corporate rate RES corp-882." },
    ],
  },
  {
    name: "Elena Rodriguez",
    country: "Spain",
    visits: 1,
    ltv: 105000,
    tier: "Silver",
    nps: 64,
    stays: [{ id: "ST-904", room: "401", ci: "16 May 2026", co: "19 May 2026", amount: 105000 }],
    notes: [],
  },
  {
    name: "Priya Sharma",
    country: "India",
    visits: 9,
    ltv: 720000,
    tier: "Platinum",
    nps: 88,
    tags: ["VIP", "F&B"],
    stays: [{ id: "ST-905", room: "312", ci: "15 May 2026", co: "17 May 2026", amount: 48000 }],
    notes: [{ at: "01 May 14:30", author: "GM", text: "Birthday stay — coordinate with pastry." }],
  },
  {
    name: "Marcus Weber",
    country: "Germany",
    visits: 3,
    ltv: 142000,
    tier: "Gold",
    nps: 70,
    stays: [{ id: "ST-906", room: "215", ci: "14 May 2026", co: "15 May 2026", amount: 9800 }],
    notes: [],
  },
];

export const waitlist: WaitlistEntry[] = [
  {
    id: "WL-101",
    guest: "Anita Desai",
    dates: "16–18 May",
    roomType: "Premier Suite",
    priority: "High",
    requestedAt: "14 May 18:22",
  },
  {
    id: "WL-102",
    guest: "Tom Bradley",
    dates: "17–19 May",
    roomType: "Deluxe King",
    priority: "Normal",
    requestedAt: "15 May 08:05",
  },
  {
    id: "WL-103",
    guest: "Yuki Sato",
    dates: "20–22 May",
    roomType: "Heritage Suite",
    priority: "High",
    requestedAt: "15 May 09:41",
  },
];

export const groupBlocks: GroupBlock[] = [
  {
    id: "BLK-44",
    name: "Tech Summit 2026",
    dates: "18–22 May",
    blocked: 24,
    pickedUp: 18,
    cutOff: "12 May",
    status: "Definite",
    groupCode: "TS2026",
    salesManager: "Alice Smith",
    cutOffType: "FixedDate",
    masterAccountId: "MA-1029",
    routingInstruction: "Room & Tax to Master",
    contactName: "John Doe",
    contactEmail: "jdoe@techsummit.org",
    roomMatrix: [
      { roomType: "Deluxe King", date: "18 May", blocked: 10, pickedUp: 8, rate: 15000 },
      { roomType: "Deluxe King", date: "19 May", blocked: 10, pickedUp: 8, rate: 15000 },
      { roomType: "Executive Suite", date: "18 May", blocked: 2, pickedUp: 1, rate: 25000 },
      { roomType: "Executive Suite", date: "19 May", blocked: 2, pickedUp: 1, rate: 25000 },
    ]
  },
  {
    id: "BLK-45",
    name: "Wedding — Mehta",
    dates: "24–26 May",
    blocked: 12,
    pickedUp: 12,
    cutOff: "10 May",
    status: "Actualized",
    groupCode: "MEHTA26",
    salesManager: "Bob Jones",
    cutOffType: "FixedDate",
    routingInstruction: "Individual Pays All",
    contactName: "Rohan Mehta",
    contactPhone: "+91 98765 43210"
  },
  {
    id: "BLK-46",
    name: "Airline Crew Block",
    dates: "15–30 May",
    blocked: 8,
    pickedUp: 3,
    cutOff: "20 May",
    status: "Tentative",
    groupCode: "AIRCREW",
    salesManager: "Charlie Davis",
    cutOffType: "RollingDays",
    cutOffRollingDays: 3,
    masterAccountId: "MA-8822",
    routingInstruction: "All to Master",
    contactName: "Crew Logistics"
  },
];

export let workOrders: WorkOrder[] = [
  {
    id: "WO-441",
    room: "207",
    category: "HVAC",
    priority: "Critical",
    status: "In Progress",
    assignee: "Suresh",
    title: "AC not cooling",
    createdAt: "15 May 06:30",
  },
  {
    id: "WO-442",
    room: "105",
    category: "Plumbing",
    priority: "High",
    status: "Reported",
    assignee: "—",
    title: "Leaking shower",
    createdAt: "15 May 10:15",
  },
  {
    id: "WO-443",
    room: "303",
    category: "Electrical",
    priority: "Normal",
    status: "Waiting Parts",
    assignee: "Ravi",
    title: "Bathroom light fixture",
    createdAt: "14 May 16:00",
  },
  {
    id: "WO-444",
    room: "118",
    category: "Furniture",
    priority: "Normal",
    status: "Resolved",
    assignee: "Suresh",
    title: "Desk chair replacement",
    createdAt: "13 May 11:00",
  },
  {
    id: "WO-445",
    room: "402",
    category: "HVAC",
    priority: "High",
    status: "Reported",
    assignee: "—",
    title: "Thermostat unresponsive",
    createdAt: "15 May 11:50",
  },
];

export let opsTasks: OpsTask[] = [
  {
    id: "TSK-88",
    title: "VIP amenity setup — 405",
    department: "FO",
    assignee: "Neha",
    due: "15 May 14:00",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "TSK-89",
    title: "Review Agoda parity drift",
    department: "Revenue",
    assignee: "Arjun",
    due: "15 May 17:00",
    priority: "Normal",
    status: "Open",
  },
  {
    id: "TSK-90",
    title: "Linen vendor follow-up",
    department: "HK",
    assignee: "Priya",
    due: "16 May 09:00",
    priority: "Normal",
    status: "Open",
  },
];

export const guestServiceRequests: GuestServiceRequest[] = [
  {
    id: "GR-201",
    room: "312",
    guest: "Priya Sharma",
    type: "Extra towels",
    status: "In Progress",
    sla: "12 min left",
  },
  {
    id: "GR-202",
    room: "204",
    guest: "John Mathews",
    type: "Late checkout",
    status: "Assigned",
    sla: "45 min left",
  },
  {
    id: "GR-203",
    room: "108",
    guest: "Hiroshi Tanaka",
    type: "Airport transfer",
    status: "New",
    sla: "2h SLA",
  },
];

export const otaMappings: OtaMapping[] = [
  {
    roomType: "Deluxe King",
    bookingCom: "Mapped",
    expedia: "Mapped",
    agoda: "Mismatch",
    direct: "Reference",
  },
  {
    roomType: "Deluxe Twin",
    bookingCom: "Mapped",
    expedia: "Mapped",
    agoda: "Mapped",
    direct: "Reference",
  },
  {
    roomType: "Premier Suite",
    bookingCom: "Mapped",
    expedia: "Mismatch",
    agoda: "Mapped",
    direct: "Reference",
  },
  {
    roomType: "Executive",
    bookingCom: "Mapped",
    expedia: "Mapped",
    agoda: "Mapped",
    direct: "Reference",
  },
  {
    roomType: "Heritage Suite",
    bookingCom: "Unmapped",
    expedia: "Mapped",
    agoda: "Mapped",
    direct: "Reference",
  },
];

export const otaSyncLogs: OtaSyncLog[] = [
  {
    id: "SYNC-901",
    channel: "Booking.com",
    action: "Rates push · 14 days",
    status: "Success",
    at: "15 May 11:42",
  },
  {
    id: "SYNC-902",
    channel: "Agoda",
    action: "Availability pull",
    status: "Warning",
    at: "15 May 11:38",
  },
  {
    id: "SYNC-903",
    channel: "Expedia",
    action: "Restrictions sync",
    status: "Success",
    at: "15 May 11:15",
  },
  { id: "SYNC-904", channel: "Airbnb", action: "Full sync", status: "Error", at: "15 May 10:55" },
];

export const pricingRules: PricingRule[] = [
  {
    id: "RULE-1",
    name: "Weekend occupancy uplift",
    trigger: "Occ > 85% · Fri–Sun",
    adjustment: "+12% max",
    status: "Active",
    lastRun: "15 May 06:00",
  },
  {
    id: "RULE-2",
    name: "Last-room premium",
    trigger: "Avail < 5%",
    adjustment: "+18% cap",
    status: "Active",
    lastRun: "15 May 06:00",
  },
  {
    id: "RULE-3",
    name: "Low demand discount",
    trigger: "Occ < 55%",
    adjustment: "-8% floor",
    status: "Paused",
    lastRun: "12 May 06:00",
  },
];

export const mealPlans: MealPlan[] = [
  {
    id: "meal-ep",
    code: "EP",
    name: "European Plan",
    description: "Room only",
    includedMeals: [],
    taxPercent: 12,
    priceAdjustment: 0,
    status: "Active",
  },
  {
    id: "meal-cp",
    code: "CP",
    name: "Continental Plan",
    description: "Room + Breakfast",
    includedMeals: ["Breakfast"],
    taxPercent: 12,
    priceAdjustment: 1200,
    status: "Active",
  },
  {
    id: "meal-map",
    code: "MAP",
    name: "Modified American Plan",
    description: "Room + Breakfast + Lunch or Dinner",
    includedMeals: ["Breakfast", "Lunch or Dinner"],
    taxPercent: 12,
    priceAdjustment: 2400,
    status: "Active",
  },
  {
    id: "meal-ap",
    code: "AP",
    name: "American Plan",
    description: "Room + Breakfast + Lunch + Dinner",
    includedMeals: ["Breakfast", "Lunch", "Dinner"],
    taxPercent: 12,
    priceAdjustment: 3600,
    status: "Active",
  },
  {
    id: "meal-ai",
    code: "AI",
    name: "All Inclusive",
    description: "Meals and selected beverages",
    includedMeals: ["Breakfast", "Lunch", "Dinner", "Selected beverages"],
    taxPercent: 18,
    priceAdjustment: 5600,
    status: "Active",
  },
  {
    id: "meal-uai",
    code: "UAI",
    name: "Ultra All Inclusive",
    description: "All meals, premium beverages, selected activities",
    includedMeals: ["Breakfast", "Lunch", "Dinner", "Premium beverages", "Snacks"],
    taxPercent: 18,
    priceAdjustment: 7600,
    status: "Inactive",
  },
];

export const ratePlanPolicies: RatePlanPolicy[] = [
  {
    id: "policy-flex",
    cancellationPolicy: "Free cancellation up to 24h before check-in.",
    refundPolicy: "100% refund within policy window.",
    advanceBookingRule: "Book up to 365 days in advance.",
    minStayRule: "1 night",
    maxStayRule: "30 nights",
    discountRule: "No base discount",
  },
  {
    id: "policy-nr",
    cancellationPolicy: "Non-cancellable",
    refundPolicy: "No refund",
    advanceBookingRule: "Book up to 365 days in advance.",
    minStayRule: "1 night",
    maxStayRule: "21 nights",
    discountRule: "12% below flexible",
  },
  {
    id: "policy-corp",
    cancellationPolicy: "Free cancellation up to 6 PM same day.",
    refundPolicy: "As per corporate agreement.",
    advanceBookingRule: "As contracted.",
    minStayRule: "1 night",
    maxStayRule: "45 nights",
    discountRule: "Contracted negotiated discount",
  },
];

export const ratePlans: RatePlan[] = [
  {
    id: "rate-bar-flex",
    externalRatePlanCode: "BAR-FLEX",
    name: "BAR Flexible",
    description: "Best available flexible rate with free cancellation.",
    benefits: ["Free cancellation", "Pay at hotel"],
    category: "bar",
    policyId: "policy-flex",
    cancelPolicyCode: "FLEX-24H",
    discountPercent: 0,
    pricingMode: "absolute",
    baseRate: 8500,
    currency: "INR",
    status: "Active",
    version: 3,
    minLos: 1,
    maxLos: 30,
    roomTypeIds: ["rt-deluxe-king", "rt-deluxe-twin", "rt-premier-suite"],
    defaultMealPlanCode: "EP",
    isBarAnchor: true,
    syncStatus: "synced",
    lastSyncedAt: "2026-06-10T14:22:00Z",
    propertyId: "PROP-1",
    tenantId: "TEN-1",
    bookingsMtd: 142,
  },
  {
    id: "rate-corp-neg",
    externalRatePlanCode: "CORP-NEG",
    name: "Corporate Neg",
    description: "Negotiated corporate rate for contracted accounts.",
    benefits: ["Invoice support", "Corporate amenities", "Same-day cancel until 6 PM"],
    category: "corporate",
    policyId: "policy-corp",
    cancelPolicyCode: "CORP-SAME-DAY",
    discountPercent: 15,
    pricingMode: "relative_to_bar",
    currency: "INR",
    status: "Active",
    version: 2,
    minLos: 1,
    maxLos: 45,
    roomTypeIds: ["rt-deluxe-king", "rt-deluxe-twin", "rt-executive"],
    defaultMealPlanCode: "CP",
    corporateAccountIds: ["corp-tcs", "corp-infosys"],
    isBarAnchor: false,
    syncStatus: "synced",
    lastSyncedAt: "2026-06-10T11:05:00Z",
    propertyId: "PROP-1",
    tenantId: "TEN-1",
    bookingsMtd: 38,
  },
  {
    id: "rate-nrf",
    externalRatePlanCode: "NRF-STD",
    name: "Non-refundable",
    description: "Prepaid non-refundable rate with deepest discount.",
    benefits: ["Lowest ADR", "Prepaid confirmation"],
    category: "non_refundable",
    policyId: "policy-nr",
    cancelPolicyCode: "NRF-STRICT",
    discountPercent: 12,
    pricingMode: "relative_to_bar",
    currency: "INR",
    status: "Active",
    version: 2,
    minLos: 1,
    maxLos: 21,
    roomTypeIds: ["rt-deluxe-king", "rt-deluxe-twin"],
    defaultMealPlanCode: "EP",
    isBarAnchor: false,
    syncStatus: "synced",
    lastSyncedAt: "2026-06-09T18:40:00Z",
    propertyId: "PROP-1",
    tenantId: "TEN-1",
    bookingsMtd: 56,
  },
  {
    id: "rate-seasonal-summer",
    externalRatePlanCode: "SUMMER-26",
    name: "Summer Seasonal Promo",
    description: "Seasonal promotional rate for Jun–Aug leisure demand.",
    benefits: ["Pool access", "Welcome drink"],
    category: "seasonal",
    policyId: "policy-flex",
    cancelPolicyCode: "FLEX-48H",
    discountPercent: 10,
    pricingMode: "relative_to_bar",
    currency: "INR",
    status: "Active",
    version: 1,
    effectiveFrom: "2026-06-01",
    effectiveTo: "2026-08-31",
    minLos: 2,
    maxLos: 14,
    roomTypeIds: ["rt-deluxe-king", "rt-premier-suite", "rt-heritage-suite"],
    defaultMealPlanCode: "MAP",
    isBarAnchor: false,
    syncStatus: "pending",
    propertyId: "PROP-1",
    tenantId: "TEN-1",
    bookingsMtd: 21,
  },
  {
    id: "rate-pkg-honeymoon",
    externalRatePlanCode: "PKG-HONEY",
    name: "Honeymoon Package Rate",
    description: "Bundled honeymoon offer linked to package catalog.",
    benefits: ["Suite upgrade", "Romance setup", "Breakfast included"],
    category: "package",
    policyId: "policy-flex",
    cancelPolicyCode: "PKG-7D",
    discountPercent: 0,
    pricingMode: "absolute",
    baseRate: 12500,
    currency: "INR",
    status: "Active",
    version: 1,
    minLos: 2,
    maxLos: 7,
    roomTypeIds: ["rt-premier-suite", "rt-heritage-suite"],
    defaultMealPlanCode: "MAP",
    packageId: "pkg-honeymoon",
    isBarAnchor: false,
    syncStatus: "not_synced",
    propertyId: "PROP-1",
    tenantId: "TEN-1",
    bookingsMtd: 9,
  },
  {
    id: "rate-weekend",
    externalRatePlanCode: "WEEKEND",
    name: "Weekend Rate",
    description: "Fri–Sun promotional pricing for direct and OTA channels.",
    benefits: ["Late checkout subject to availability"],
    category: "promotional",
    policyId: "policy-flex",
    cancelPolicyCode: "FLEX-24H",
    discountPercent: 8,
    pricingMode: "relative_to_bar",
    currency: "INR",
    status: "Draft",
    version: 1,
    minLos: 1,
    maxLos: 3,
    roomTypeIds: ["rt-deluxe-king"],
    defaultMealPlanCode: "EP",
    isBarAnchor: false,
    syncStatus: "not_synced",
    propertyId: "PROP-1",
    tenantId: "TEN-1",
    bookingsMtd: 0,
  },
];

export const taxComponents: import("@/types/pms").TaxComponent[] = [
  {
    id: "tax-cgst9",
    code: "CGST9",
    name: "CGST 9%",
    type: "gst",
    ratePercent: 9,
    calculationBase: "room_tariff",
    inclusive: false,
    status: "Active",
    jurisdiction: "intra_state",
    gstSlabMin: 7501,
    description: "Central GST on room tariff above ₹7,500/night.",
  },
  {
    id: "tax-sgst9",
    code: "SGST9",
    name: "SGST 9%",
    type: "gst",
    ratePercent: 9,
    calculationBase: "room_tariff",
    inclusive: false,
    status: "Active",
    jurisdiction: "intra_state",
    gstSlabMin: 7501,
    description: "State GST on room tariff above ₹7,500/night.",
  },
  {
    id: "tax-gst12",
    code: "GST12",
    name: "GST 12% (combined slab)",
    type: "gst",
    ratePercent: 12,
    calculationBase: "room_tariff",
    inclusive: false,
    status: "Active",
    gstSlabMin: 1001,
    gstSlabMax: 7500,
    description: "Combined GST slab for mid-rate room tariffs.",
  },
  {
    id: "tax-gst18",
    code: "GST18",
    name: "GST 18% (combined slab)",
    type: "gst",
    ratePercent: 18,
    calculationBase: "folio_subtotal",
    inclusive: false,
    status: "Active",
    gstSlabMin: 7501,
    description: "Default F&B and high room tariff GST profile.",
  },
  {
    id: "tax-city",
    code: "CITY-TAX",
    name: "City Tax",
    type: "city_tax",
    ratePercent: 0,
    flatAmount: 200,
    calculationBase: "per_night",
    inclusive: false,
    status: "Active",
    description: "Municipal levy per room night (configurable flat).",
  },
  {
    id: "tax-sc10",
    code: "SC10",
    name: "Service Charge 10%",
    type: "service_charge",
    ratePercent: 10,
    calculationBase: "folio_subtotal",
    inclusive: false,
    status: "Active",
    description: "Property service charge on eligible folio lines.",
  },
  {
    id: "tax-tourism",
    code: "TOUR2",
    name: "Tourism Tax 2%",
    type: "tourism_tax",
    ratePercent: 2,
    calculationBase: "room_tariff",
    inclusive: false,
    status: "Active",
    description: "State tourism development levy on room revenue.",
  },
];

export const taxGroups: import("@/types/pms").TaxGroup[] = [
  {
    id: "tg-room-lux",
    code: "ROOM-LUX",
    name: "Luxury Room Tariff",
    componentIds: ["tax-cgst9", "tax-sgst9", "tax-tourism"],
    status: "Active",
    description: "CGST + SGST + tourism tax for tariffs above ₹7,500.",
  },
  {
    id: "tg-room-mid",
    code: "ROOM-MID",
    name: "Mid-rate Room Tariff",
    componentIds: ["tax-gst12"],
    status: "Active",
    description: "12% GST slab for mid-rate rooms.",
  },
  {
    id: "tg-folio-std",
    code: "FOLIO-STD",
    name: "Standard Folio",
    componentIds: ["tax-gst18", "tax-sc10", "tax-city"],
    status: "Active",
    description: "Default folio posting — GST 18%, service charge, city tax.",
  },
];

export const taxAssignments: import("@/types/pms").TaxAssignment[] = [
  {
    id: "ta-folio",
    targetType: "folio_default",
    targetId: "default",
    targetLabel: "Default folio posting",
    taxGroupId: "tg-folio-std",
  },
  {
    id: "ta-bar",
    targetType: "rate_plan",
    targetId: "rate-bar-flex",
    targetLabel: "BAR Flexible",
    taxGroupId: "tg-room-lux",
  },
  {
    id: "ta-corp",
    targetType: "rate_plan",
    targetId: "rate-corp-neg",
    targetLabel: "Corporate Neg",
    taxGroupId: "tg-room-lux",
  },
];

function buildAvailabilitySeed(): import("@/types/pms").AvailabilityCell[] {
  const roomTypes = [
    { id: "rt-deluxe-king", total: 36 },
    { id: "rt-deluxe-twin", total: 28 },
    { id: "rt-premier-suite", total: 24 },
    { id: "rt-executive", total: 18 },
    { id: "rt-heritage-suite", total: 12 },
  ];
  const cells: import("@/types/pms").AvailabilityCell[] = [];
  for (let d = 0; d < 14; d++) {
    const date = `2026-06-${String(15 + d).padStart(2, "0")}`;
    for (const rt of roomTypes) {
      const sold = Math.min(rt.total, Math.floor(rt.total * (0.4 + (d % 5) * 0.08)));
      let status: import("@/types/pms").AvailabilityStatus = "open";
      const restrictions: import("@/types/pms").AvailabilityRestriction[] = [];
      if (d === 6 && rt.id === "rt-premier-suite") {
        status = "closed";
        restrictions.push("stop_sell");
      } else if (d === 3) {
        restrictions.push("cta");
      } else if (d === 8 && rt.id === "rt-deluxe-king") {
        restrictions.push("ctd");
      } else if (d === 10) {
        restrictions.push("stop_sell");
      }
      cells.push({
        id: `av-${rt.id}-${date}`,
        date,
        roomTypeId: rt.id,
        status,
        restrictions,
        total: rt.total,
        sold,
        allocated: rt.total,
        updatedAt: "2026-06-10T09:00:00Z",
        updatedBy: "Revenue Manager",
      });
    }
  }
  return cells;
}

export const availabilityCells = buildAvailabilitySeed();

export const hotelPackages: Package[] = [
  {
    id: "pkg-honeymoon",
    name: "Honeymoon Package",
    description: "Suite stay with romance inclusions.",
    basePrice: 6500,
    status: "Active",
  },
  {
    id: "pkg-family",
    name: "Family Package",
    description: "Family-friendly meals and activities.",
    basePrice: 4200,
    status: "Active",
  },
  {
    id: "pkg-business",
    name: "Business Package",
    description: "Airport transfer + meeting support.",
    basePrice: 3800,
    status: "Active",
  },
  {
    id: "pkg-weekend",
    name: "Weekend Getaway",
    description: "Weekend leisure bundle.",
    basePrice: 4500,
    status: "Draft",
  },
  {
    id: "pkg-festival",
    name: "Festival Package",
    description: "Seasonal celebratory offerings.",
    basePrice: 5200,
    status: "Active",
  },
  {
    id: "pkg-wellness",
    name: "Wellness Package",
    description: "Spa and wellness-focused stay.",
    basePrice: 6000,
    status: "Active",
  },
];

export const packageItems: PackageItem[] = [
  {
    id: "pkg-item-1",
    packageId: "pkg-honeymoon",
    type: "room",
    name: "Suite upgrade",
    included: true,
  },
  {
    id: "pkg-item-2",
    packageId: "pkg-honeymoon",
    type: "service",
    name: "Room decoration",
    included: true,
  },
  {
    id: "pkg-item-3",
    packageId: "pkg-honeymoon",
    type: "meal",
    name: "Candle light dinner",
    included: true,
  },
  {
    id: "pkg-item-4",
    packageId: "pkg-family",
    type: "meal",
    name: "Kids meal plan",
    included: true,
  },
  {
    id: "pkg-item-5",
    packageId: "pkg-family",
    type: "activity",
    name: "City tour",
    included: false,
  },
  {
    id: "pkg-item-6",
    packageId: "pkg-business",
    type: "service",
    name: "Airport pickup",
    included: true,
  },
];

export const occupancyPricingRules: OccupancyPricing[] = [
  { occupancyType: "single", multiplier: 1 },
  { occupancyType: "double", multiplier: 1.12 },
  { occupancyType: "triple", multiplier: 1.28 },
  { occupancyType: "quad", multiplier: 1.42 },
];

export const corporateAccounts: CorporateAccount[] = [
  {
    id: "CORP-101",
    company: "Infosys Ltd",
    rateCode: "INF-CORP-24",
    roomNightsMtd: 48,
    revenueMtd: 624000,
    openInvoices: 1,
    contact: "R. Menon",
    taxId: "GST-29AAAAI1234A1Z5",
    address: "Electronic City, Bangalore",
    contactEmail: "rmenon@infosys.com",
    contactPhone: "+91 98765 00001",
    annualRoomNightTarget: 500,
    ytdRoomNights: 210,
    ytdRevenue: 2850000,
    creditLimit: 1000000,
    currentBalance: 450000,
    arAging: { current: 300000, thirtyDays: 150000, sixtyDays: 0, ninetyPlusDays: 0 },
    contracts: [
      { rateCode: "INF-CORP-24", roomType: "Deluxe King", discountType: "Fixed", discountValue: 8500, isLRA: true, blackoutDates: ["2026-12-31"] }
    ]
  },
  {
    id: "CORP-102",
    company: "Tata Consultancy",
    rateCode: "TCS-NEG-25",
    roomNightsMtd: 32,
    revenueMtd: 416000,
    openInvoices: 0,
    contact: "A. Pillai",
    taxId: "GST-27AAAAT1234A1Z5",
    address: "Bandra Kurla Complex, Mumbai",
    contactEmail: "apillai@tcs.com",
    contactPhone: "+91 98765 00002",
    annualRoomNightTarget: 300,
    ytdRoomNights: 120,
    ytdRevenue: 1550000,
    creditLimit: 500000,
    currentBalance: 0,
    arAging: { current: 0, thirtyDays: 0, sixtyDays: 0, ninetyPlusDays: 0 },
    contracts: [
      { rateCode: "TCS-NEG-25", roomType: "Any", discountType: "Percentage", discountValue: 15, isLRA: false, blackoutDates: [] }
    ]
  },
  {
    id: "CORP-103",
    company: "Deloitte India",
    rateCode: "DLT-STD",
    roomNightsMtd: 18,
    revenueMtd: 234000,
    openInvoices: 2,
    contact: "S. Khanna",
    taxId: "GST-07AAAAD1234A1Z5",
    address: "Cyber City, Gurugram",
    contactEmail: "skhanna@deloitte.com",
    contactPhone: "+91 98765 00003",
    annualRoomNightTarget: 150,
    ytdRoomNights: 80,
    ytdRevenue: 1050000,
    creditLimit: 300000,
    currentBalance: 310000,
    arAging: { current: 100000, thirtyDays: 100000, sixtyDays: 110000, ninetyPlusDays: 0 },
    contracts: [
      { rateCode: "DLT-STD", roomType: "Executive Suite", discountType: "Fixed", discountValue: 12000, isLRA: true, blackoutDates: ["2026-10-01", "2026-10-02"] }
    ]
  },
];

export const onlineCheckIns: OnlineCheckIn[] = [
  {
    resId: "RES-2044",
    guest: "Elena Rodriguez",
    roomType: "Heritage Suite",
    eta: "16 May 15:00",
    status: "Pending review",
    idVerified: true,
    paymentStatus: "Paid",
  },
  {
    resId: "RES-2048",
    guest: "Sophie Laurent",
    roomType: "Heritage Suite",
    eta: "16 May 14:30",
    status: "Approved",
    idVerified: true,
    paymentStatus: "Paid",
  },
  {
    resId: "RES-2043",
    guest: "Hiroshi Tanaka",
    roomType: "Executive",
    eta: "15 May 18:00",
    status: "Needs info",
    idVerified: false,
    paymentStatus: "Deposit due",
  },
];

export const commThreads: CommThread[] = [
  {
    id: "TH-1",
    name: "Sophie Laurent",
    last: "Looking forward to my arrival on the 16th.",
    time: "10:42",
    unread: 0,
    channel: "Email",
    resId: "RES-2048",
    stayStatus: "Arriving",
  },
  {
    id: "TH-2",
    name: "John Mathews",
    last: "Could I get a late checkout please?",
    time: "09:18",
    unread: 1,
    channel: "WhatsApp",
    resId: "RES-2041",
    stayStatus: "Checked-In",
  },
  {
    id: "TH-3",
    name: "Hiroshi Tanaka",
    last: "Confirming spa booking for tomorrow.",
    time: "Yesterday",
    unread: 0,
    channel: "Email",
    resId: "RES-2043",
    stayStatus: "Pending",
  },
  {
    id: "TH-4",
    name: "Elena Rodriguez",
    last: "Will arrive around 21:00.",
    time: "Yesterday",
    unread: 2,
    channel: "SMS",
    resId: "RES-2044",
    stayStatus: "Arriving",
  },
];

export const loyaltyMembers: LoyaltyMember[] = [
  {
    id: "LM-001",
    name: "Sophie Laurent",
    tier: "Platinum",
    points: 12400,
    lifetimePoints: 48200,
    lastActivity: "14 May",
  },
  {
    id: "LM-002",
    name: "Priya Sharma",
    tier: "Platinum",
    points: 18600,
    lifetimePoints: 62400,
    lastActivity: "15 May",
  },
  {
    id: "LM-003",
    name: "John Mathews",
    tier: "Gold",
    points: 3200,
    lifetimePoints: 9800,
    lastActivity: "10 May",
  },
  {
    id: "LM-004",
    name: "Marcus Weber",
    tier: "Gold",
    points: 4100,
    lifetimePoints: 11200,
    lastActivity: "14 May",
  },
];

export const registrationCards: RegistrationCard[] = [
  {
    id: "REG-801",
    resId: "RES-2042",
    guest: "Priya Sharma",
    signedAt: "15 May 11:20",
    status: "Signed",
    template: "Standard v3",
  },
  {
    id: "REG-802",
    resId: "RES-2044",
    guest: "Elena Rodriguez",
    status: "Pending",
    template: "Standard v3",
  },
  {
    id: "REG-803",
    resId: "RES-2041",
    guest: "John Mathews",
    signedAt: "15 May 09:05",
    status: "Signed",
    template: "Standard v3",
  },
  {
    id: "REG-804",
    resId: "RES-2046",
    guest: "Aisha Khan",
    status: "Exception",
    template: "Standard v3",
  },
];

export let lostFoundItems: LostFoundItem[] = [
  {
    id: "LF-301",
    description: "Gold bracelet",
    itemDetail: "18k gold chain with a small heart pendant. Engraved 'S.L.' on the clasp.",
    roomDetail: "Found on the nightstand next to the bed in Spa locker 12.",
    imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
    location: "Spa locker",
    foundAt: "14 May",
    status: "Matched",
    guestMatch: "Sophie Laurent",
  },
  {
    id: "LF-302",
    description: "iPhone charger",
    itemDetail: "Original Apple 20W USB-C Power Adapter and 1m cable. Slightly scuffed.",
    roomDetail: "Found plugged into the wall outlet near the desk in Room 204.",
    imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop",
    location: "Room 204",
    foundAt: "15 May",
    status: "Open",
  },
  {
    id: "LF-303",
    description: "Passport cover",
    itemDetail: "Black leather passport cover, contains no passport but has a boarding pass stub.",
    roomDetail: "Found resting on a chair in the main Lobby seating area.",
    imageUrl: "https://images.unsplash.com/photo-1553531087-b25a0b9a68ab?q=80&w=600&auto=format&fit=crop",
    location: "Lobby",
    foundAt: "13 May",
    status: "Released",
  },
];

export const feedbackEntries: FeedbackEntry[] = [
  {
    id: "FB-501",
    guest: "Marcus Weber",
    channel: "In-stay survey",
    score: 9,
    category: "Housekeeping",
    status: "Resolved",
    severity: "Low",
  },
  {
    id: "FB-502",
    guest: "John Mathews",
    channel: "WhatsApp",
    score: 6,
    category: "F&B",
    status: "In Progress",
    severity: "Medium",
  },
  {
    id: "FB-503",
    guest: "Anonymous",
    channel: "Google",
    score: 4,
    category: "Front desk",
    status: "Open",
    severity: "High",
  },
];

export const bookingPromos: BookingPromo[] = [
  {
    id: "PROMO-1",
    code: "DIRECT15",
    discount: "15% off BAR",
    validity: "May 2026",
    bookings: 42,
    status: "Active",
  },
  {
    id: "PROMO-2",
    code: "WEEKENDSPA",
    discount: "Spa credit ₹2,000",
    validity: "May–Jun 2026",
    bookings: 18,
    status: "Active",
  },
  {
    id: "PROMO-3",
    code: "SUMMER24",
    discount: "10% early bird",
    validity: "Apr 2026",
    bookings: 96,
    status: "Expired",
  },
];

export const packageProducts: PackageProduct[] = [
  {
    id: "PKG-1",
    name: "Honeymoon Escape",
    price: 85000,
    inclusions: "Suite · Dinner · Spa",
    bookingsMtd: 12,
    status: "Active",
  },
  {
    id: "PKG-2",
    name: "Wellness Retreat",
    price: 42000,
    inclusions: "Deluxe · Yoga · Breakfast",
    bookingsMtd: 8,
    status: "Active",
  },
  {
    id: "PKG-3",
    name: "Family Fun",
    price: 38000,
    inclusions: "Twin · Kids club · Lunch",
    bookingsMtd: 5,
    status: "Draft",
  },
];

export const addOnProducts: AddOnProduct[] = [
  {
    id: "AO-1",
    name: "Breakfast buffet",
    category: "F&B",
    price: 1800,
    department: "Restaurant",
    attachRate: "34%",
  },
  {
    id: "AO-2",
    name: "Airport transfer",
    category: "Transport",
    price: 3500,
    department: "Concierge",
    attachRate: "22%",
  },
  {
    id: "AO-3",
    name: "Late checkout",
    category: "Room",
    price: 6000,
    department: "Front Office",
    attachRate: "18%",
  },
  {
    id: "AO-4",
    name: "Spa 60 min",
    category: "Spa",
    price: 4500,
    department: "Spa",
    attachRate: "28%",
  },
];

export const conciergeRequests: ConciergeRequest[] = [
  {
    id: "CON-1",
    guest: "Sophie Laurent",
    room: "405",
    type: "Restaurant · Indian Accent",
    status: "Confirmed",
    datetime: "16 May 20:00",
  },
  {
    id: "CON-2",
    guest: "Hiroshi Tanaka",
    room: "108",
    type: "Theatre tickets",
    status: "New",
    datetime: "17 May 19:30",
  },
  {
    id: "CON-3",
    guest: "John Mathews",
    room: "204",
    type: "Flower arrangement",
    status: "Completed",
    datetime: "15 May 14:00",
  },
];

export const transportTrips: TransportTrip[] = [
  {
    id: "TR-1",
    guest: "Elena Rodriguez",
    pickup: "16 May 14:00",
    flight: "AI 131",
    driver: "Rajesh",
    status: "Scheduled",
  },
  {
    id: "TR-2",
    guest: "Sophie Laurent",
    pickup: "16 May 13:30",
    flight: "AF 218",
    driver: "Vikram",
    status: "Scheduled",
  },
  {
    id: "TR-3",
    guest: "Marcus Weber",
    pickup: "15 May 10:00",
    driver: "Rajesh",
    status: "Completed",
  },
];

export const activitySlots: ActivitySlot[] = [
  {
    id: "ACT-1",
    name: "Old Delhi heritage walk",
    date: "16 May 09:00",
    capacity: 12,
    booked: 8,
    price: 4500,
  },
  { id: "ACT-2", name: "Cooking class", date: "17 May 11:00", capacity: 8, booked: 8, price: 6200 },
  { id: "ACT-3", name: "Sunset yoga", date: "16 May 18:00", capacity: 15, booked: 6, price: 2800 },
];

export const portfolioProperties: PortfolioProperty[] = [
  {
    id: "PROP-1",
    name: "The Grand Palace",
    city: "New Delhi",
    occupancy: 78,
    revenue: 14200000,
    revpar: 9267,
    alerts: 2,
    stars: 5,
  },
  {
    id: "PROP-2",
    name: "Retrod Marina",
    city: "Goa",
    occupancy: 82,
    revenue: 9800000,
    revpar: 8420,
    alerts: 0,
    stars: 5,
  },
  {
    id: "PROP-3",
    name: "Himalayan Retreat",
    city: "Shimla",
    occupancy: 64,
    revenue: 4200000,
    revpar: 5180,
    alerts: 1,
    stars: 4,
  },
  {
    id: "PROP-4",
    name: "City Lights",
    city: "Mumbai",
    occupancy: 71,
    revenue: 8600000,
    revpar: 7840,
    alerts: 3,
    stars: 4,
  },
];

export const aiRevenueDashboard: AIRevenueDashboardData = {
  demandFunnel: [
    {
      totalRooms: 100,
      soldByTime: 32,
      rooms: 68,
      occupancyPct: 32,
      price: 10500,
      stageType: "Actual",
      sellProbability: 98,
      demandBand: "Low",
      ts: "10:00",
    },
    {
      totalRooms: 100,
      soldByTime: 48,
      rooms: 52,
      occupancyPct: 48,
      price: 11800,
      stageType: "Forecast",
      sellProbability: 90,
      demandBand: "Medium",
      ts: "14:00",
    },
    {
      totalRooms: 100,
      soldByTime: 71,
      rooms: 29,
      occupancyPct: 71,
      price: 14200,
      stageType: "Forecast",
      sellProbability: 72,
      demandBand: "High",
      ts: "18:00",
    },
    {
      totalRooms: 100,
      soldByTime: 88,
      rooms: 12,
      occupancyPct: 88,
      price: 18500,
      stageType: "Forecast",
      sellProbability: 42,
      demandBand: "Peak",
      ts: "22:00",
    },
  ],
  demandSnapshot: {
    demandScore: 84,
    occupancyPct: 87,
    availableRooms: 16,
    currentAdr: 12400,
    recommendedAdr: 14600,
    revenueLiftPct: 17.7,
  },
  priceForecast: [
    { time: "09:00", predictedPrice: 11200 },
    { time: "11:00", predictedPrice: 11800 },
    { time: "13:00", predictedPrice: 12600 },
    { time: "15:00", predictedPrice: 13800 },
    { time: "17:00", predictedPrice: 14900 },
    { time: "19:00", predictedPrice: 15800 },
    { time: "21:00", predictedPrice: 14600 },
  ],
  occupancyVsPrice: [
    { time: "09:00", occupancyPct: 62, price: 11200 },
    { time: "11:00", occupancyPct: 68, price: 11800 },
    { time: "13:00", occupancyPct: 74, price: 12600 },
    { time: "15:00", occupancyPct: 81, price: 13800 },
    { time: "17:00", occupancyPct: 88, price: 14900 },
    { time: "19:00", occupancyPct: 91, price: 15800 },
    { time: "21:00", occupancyPct: 89, price: 14600 },
  ],
  revenueForecast: {
    today: 1984000,
    next7Days: 14260000,
    opportunityScore: 78,
  },
  competitors: [
    { hotel: "Imperial Crown", distanceKm: 0.8, rate: 15200, deltaPct: 4.1, position: "Higher" },
    { hotel: "The Monarch Inn", distanceKm: 1.4, rate: 13800, deltaPct: -5.5, position: "Lower" },
    { hotel: "Regal Meridian", distanceKm: 2.1, rate: 14600, deltaPct: 0, position: "Parity" },
    { hotel: "Azure Grand", distanceKm: 2.9, rate: 15900, deltaPct: 8.9, position: "Higher" },
  ],
  insights: [
    {
      id: "AIRI-1",
      severity: "Info",
      message: "Demand expected to increase by 25% after 5 PM.",
      action: "Raise deluxe rates by 8%",
      confidence: 87,
    },
    {
      id: "AIRI-2",
      severity: "Warning",
      message: "Local event causing pricing surge in downtown competitor set.",
      action: "Increase weekday parity buffer",
      confidence: 82,
    },
    {
      id: "AIRI-3",
      severity: "Critical",
      message: "Premium suite inventory projected to sell out before 7 PM.",
      action: "Apply surge cap override review",
      confidence: 91,
    },
  ],
  overrides: {
    autoPricing: true,
    minPrice: 9000,
    maxPrice: 24000,
    surgeCapPct: 28,
  },
  asOf: "Today 12:00",
};

export const websiteBuilderWorkspace: WebsiteBuilderWorkspace = {
  id: "WB-WS-1",
  propertyId: "PROP-1",
  siteName: "The Grand Palace",
  selectedPageId: "wb-page-home",
  selectedThemeId: "wb-theme-classic",
  previewDevice: "desktop",
  autosaveEnabled: true,
  pages: [
    {
      id: "wb-page-home",
      name: "Home",
      slug: "/",
      status: "Published",
      seoScore: 91,
      sections: [
        { id: "wb-s1", name: "Hero Banner", type: "hero", visible: true },
        { id: "wb-s2", name: "Room Showcase", type: "rooms", visible: true },
        { id: "wb-s3", name: "Seasonal Offers", type: "offers", visible: true },
        { id: "wb-s4", name: "Photo Gallery", type: "gallery", visible: true },
        { id: "wb-s5", name: "FAQ", type: "faq", visible: true },
        { id: "wb-s6", name: "Booking Widget", type: "booking", visible: true },
      ],
    },
    {
      id: "wb-page-rooms",
      name: "Rooms",
      slug: "/rooms",
      status: "Ready",
      seoScore: 87,
      sections: [
        { id: "wb-r1", name: "Rooms Hero", type: "hero", visible: true },
        { id: "wb-r2", name: "Room Categories", type: "rooms", visible: true },
        { id: "wb-r3", name: "Amenities", type: "text", visible: true },
        { id: "wb-r4", name: "Booking Widget", type: "booking", visible: true },
      ],
    },
    {
      id: "wb-page-offers",
      name: "Offers",
      slug: "/offers",
      status: "Draft",
      seoScore: 74,
      sections: [
        { id: "wb-o1", name: "Offer Hero", type: "hero", visible: true },
        { id: "wb-o2", name: "Offer Cards", type: "offers", visible: true },
        { id: "wb-o3", name: "Terms", type: "text", visible: true },
      ],
    },
    {
      id: "wb-page-contact",
      name: "Contact Us",
      slug: "/contact",
      status: "Published",
      seoScore: 89,
      sections: [
        { id: "wb-c1", name: "Contact Hero", type: "hero", visible: true },
        { id: "wb-c2", name: "Map and Form", type: "text", visible: true },
        { id: "wb-c3", name: "FAQ", type: "faq", visible: true },
      ],
    },
  ],
  themeOptions: [
    { id: "wb-theme-classic", name: "Retrod Classic", category: "Core" },
    { id: "wb-theme-horizon", name: "Luxury Horizon", category: "Luxury" },
    { id: "wb-theme-minimal", name: "Boutique Minimal", category: "Minimal" },
    { id: "wb-theme-serenity", name: "Resort Serenity", category: "Luxury" },
    { id: "wb-theme-urban", name: "Urban Business", category: "Business" },
  ],
  roomSync: [
    {
      roomType: "Deluxe King",
      pmsUpdatedAt: "2026-05-31 22:18",
      webStatus: "Synced",
      overrideActive: false,
    },
    {
      roomType: "Premier Suite",
      pmsUpdatedAt: "2026-05-31 22:11",
      webStatus: "Override active",
      overrideActive: true,
    },
    {
      roomType: "Heritage Suite",
      pmsUpdatedAt: "2026-05-31 21:56",
      webStatus: "Pending publish",
      overrideActive: false,
    },
  ],
  versions: [
    {
      id: "wb-ver-32",
      createdAt: "2026-05-31 22:20",
      createdBy: "General Manager",
      note: "Updated hero copy and room highlights",
    },
    {
      id: "wb-ver-31",
      createdAt: "2026-05-31 18:40",
      createdBy: "Marketing Lead",
      note: "Summer campaign sections",
    },
    {
      id: "wb-ver-30",
      createdAt: "2026-05-30 20:05",
      createdBy: "Revenue Manager",
      note: "Offer cards updated from PMS promotions",
    },
  ],
  lastAction: "Loaded workspace",
  lastSavedAt: "2026-05-31 22:20",
  lastPublishedAt: "2026-05-31 20:45",
};

export const websiteBuilderApprovals: WebsiteBuilderApproval[] = [
  {
    id: "wb-appr-1",
    pageName: "Offers",
    requestedBy: "Marketing Lead",
    requestedAt: "2026-05-31 22:05",
    status: "Pending",
  },
  {
    id: "wb-appr-2",
    pageName: "Rooms",
    requestedBy: "Content Editor",
    requestedAt: "2026-05-31 17:35",
    status: "Approved",
    approver: "General Manager",
    decidedAt: "2026-05-31 17:52",
  },
];

export const websiteBuilderPublishHistory: WebsiteBuilderPublishEvent[] = [
  {
    id: "wb-pub-19",
    publishedAt: "2026-05-31 20:45",
    publishedBy: "General Manager",
    pageCount: 3,
    note: "Published home and contact updates",
  },
  {
    id: "wb-pub-18",
    publishedAt: "2026-05-30 21:30",
    publishedBy: "General Manager",
    pageCount: 2,
    note: "Offer landing page refresh",
  },
  {
    id: "wb-pub-17",
    publishedAt: "2026-05-29 19:15",
    publishedBy: "Owner",
    pageCount: 4,
    note: "Monthly campaign rollout",
  },
];
