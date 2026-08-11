export interface Reservation {
  id: string;
  guest: string;
  room: string;
  type: string;
  ci: string;
  co: string;
  nights: number;
  amount: number;
  status: "Confirmed" | "Checked-In" | "Checked-Out" | "Pending" | "No-Show" | "Cancelled";
  source: string;
  balance: number;
  reservationType?: ReservationType;
  frontDeskStatus?: FrontDeskStatus;
  billingMode?: BillingMode;
  folioState?: FolioState;
  checkinChecklist?: FrontDeskChecklistItem[];
  checkoutChecklist?: FrontDeskChecklistItem[];
  blockerCodes?: FrontDeskBlockerCode[];
  groupMeta?: GroupMeta;
  corporateMeta?: CorporateMeta;
  packageMeta?: PackageMeta;
  walkinMeta?: WalkinMeta;
  eventMeta?: EventMeta;
}

export type ReservationType = "individual" | "group" | "corporate" | "package" | "walkin" | "event";

export type FrontDeskStatus =
  | "pre_arrival"
  | "pending_id"
  | "pending_payment"
  | "room_assigned"
  | "checked_in"
  | "checkout_due"
  | "checkout_in_progress"
  | "checked_out"
  | "no_show"
  | "cancelled";

export type BillingMode = "guest_pay" | "direct_bill" | "split";

export type FolioState = "open" | "partially_settled" | "settled" | "transferred_to_city_ledger";

export type FrontDeskChecklistKey =
  | "find_guest"
  | "verify_id"
  | "assign_room"
  | "collect_payment"
  | "issue_key"
  | "review_folio"
  | "return_key"
  | "send_invoice"
  | "handover_hk";

export type FrontDeskBlockerCode =
  | "missing_id"
  | "pending_po"
  | "unsettled_folio"
  | "room_not_ready"
  | "pickup_mismatch"
  | "event_overage_pending";

export interface FrontDeskChecklistItem {
  key: FrontDeskChecklistKey;
  label: string;
  done: boolean;
  required: boolean;
  note?: string;
}

export interface GroupMeta {
  blockName: string;
  blockedRooms: number;
  pickedUpRooms: number;
  roomingListReady: boolean;
  settlementMode: "master" | "split";
}

export interface CorporateMeta {
  company: string;
  poRef?: string;
  costCenter?: string;
  cityLedgerCode?: string;
}

export interface PackageMeta {
  packageName: string;
  inclusions: string[];
  benefitsPosted: boolean;
  unusedEntitlementCredit?: number;
}

export interface WalkinMeta {
  idVerified: boolean;
  depositAmount: number;
  vehicleNo?: string;
}

export interface EventMeta {
  eventName: string;
  venue: string;
  organizer: string;
  contact: string;
  billingSplit: "venue_only" | "venue_catering" | "venue_catering_av";
  overageAmount?: number;
}

export interface FrontDeskWorkflowReservation extends Reservation {
  reservationType: ReservationType;
  frontDeskStatus: FrontDeskStatus;
  billingMode: BillingMode;
  folioState: FolioState;
  checkinChecklist: FrontDeskChecklistItem[];
  checkoutChecklist: FrontDeskChecklistItem[];
  blockerCodes: FrontDeskBlockerCode[];
}

export interface HousekeepingRoom {
  id?: string;
  num: string;
  type: string;
  status: "Ready" | "Cleaning" | "Dirty" | "OOO" | "Inspected";
  staff: string;
  floor: string;
}

export interface RevenueTrendEntry {
  day: string;
  revenue: number;
  occupancy: number;
}

export interface OTABreakdownEntry {
  source: string;
  bookings: number;
  revenue: number;
}

export interface RoomStatusDonutEntry {
  name: string;
  value: number;
  color: string;
}

export interface ActivityFeedEntry {
  time: string;
  text: string;
  tone: "success" | "info" | "neutral" | "warning" | "error";
}

export interface OccupancyByTypeEntry {
  type: string;
  total: number;
  occupied: number;
}

export interface RevenueKPIEntry {
  label: string;
  today: number;
  budget: number;
  sty: number;
}

export interface DashboardAlertEntry {
  id: string;
  tone: "brand" | "warning" | "error" | "info" | "neutral";
  title: string;
  body: string;
  at: string;
}

export interface Forecast7DEntry {
  day: string;
  date: number;
  occ: number;
  adr: number;
  revenue: number;
}

export interface AvailabilityMatrixDay {
  date: number;
  sold: number;
  total: number;
}

export interface AvailabilityMatrixEntry {
  type: string;
  days: AvailabilityMatrixDay[];
}

export interface RateCalendarDay {
  date: number;
  rate: number;
  tag: "Event" | "Weekend" | "BAR";
}

export interface RateCalendarEntry {
  type: string;
  days: RateCalendarDay[];
}

export interface Restriction {
  date: number;
  type: string;
  kind: string;
}

export interface GuestProfile {
  name: string;
  country: string;
  visits: number;
  ltv: number;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze" | "Standard";
  email?: string;
  phone?: string;
  nps?: number;
  tags?: string[];
  notes?: { at: string; author: string; text: string }[];
  stays?: { id: string; room: string; ci: string; co: string; amount: number }[];
}

export interface WaitlistEntry {
  id: string;
  guest: string;
  dates: string;
  roomType: string;
  priority: "High" | "Normal";
  requestedAt: string;
}

export type GroupBlockStatus = "Prospect" | "Tentative" | "Definite" | "Cancelled" | "Actualized" | "Open" | "Closed" | "Released";
export type GroupRoutingType = "All to Master" | "Room & Tax to Master" | "Incidentals to Master" | "Individual Pays All";

export interface GroupBlockRoomMatrix {
  roomType: string;
  date: string;
  blocked: number;
  pickedUp: number;
  rate: number;
}

export interface GroupBlock {
  id: string;
  name: string;
  dates: string;
  blocked: number;
  pickedUp: number;
  cutOff: string;
  status: GroupBlockStatus;
  
  // Extended fields
  groupCode?: string;
  salesManager?: string;
  cutOffType?: "FixedDate" | "RollingDays";
  cutOffRollingDays?: number;
  
  // Billing
  masterAccountId?: string;
  routingInstruction?: GroupRoutingType;
  
  // Room Allocation Grid
  roomMatrix?: GroupBlockRoomMatrix[];
  
  // Contacts
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export type WorkOrderStatus = "Reported" | "In Progress" | "Waiting Parts" | "Resolved";

export interface WorkOrder {
  id: string;
  room: string;
  category: string;
  priority: "Critical" | "High" | "Normal";
  status: WorkOrderStatus;
  assignee: string;
  title: string;
  createdAt: string;
}

export interface OpsTask {
  id: string;
  title: string;
  department: string;
  assignee: string;
  due: string;
  priority: "High" | "Normal";
  status: "Open" | "In Progress" | "Done";
}

export interface GuestServiceRequest {
  id: string;
  room: string;
  guest: string;
  type: string;
  status: "New" | "Assigned" | "In Progress" | "Done";
  sla: string;
}

export interface OtaMapping {
  roomType: string;
  bookingCom: "Mapped" | "Mismatch" | "Unmapped";
  expedia: "Mapped" | "Mismatch" | "Unmapped";
  agoda: "Mapped" | "Mismatch" | "Unmapped";
  direct: "Reference";
}

export interface OtaSyncLog {
  id: string;
  channel: string;
  action: string;
  status: "Success" | "Warning" | "Error";
  at: string;
}

export interface PricingRule {
  id: string;
  name: string;
  trigger: string;
  adjustment: string;
  status: "Active" | "Paused";
  lastRun: string;
}

export interface MealPlan {
  id: string;
  code: "EP" | "CP" | "MAP" | "AP" | "AI" | "UAI";
  name: string;
  description: string;
  includedMeals: string[];
  taxPercent: number;
  priceAdjustment: number;
  status: "Active" | "Inactive";
}

export interface RatePlanPolicy {
  id: string;
  cancellationPolicy: string;
  refundPolicy: string;
  advanceBookingRule: string;
  minStayRule: string;
  maxStayRule: string;
  discountRule: string;
}

export type RatePlanCategory =
  | "bar"
  | "corporate"
  | "package"
  | "seasonal"
  | "non_refundable"
  | "member"
  | "promotional";

export type RatePlanPricingMode = "absolute" | "relative_to_bar";

export type RatePlanSyncStatus = "not_synced" | "pending" | "synced" | "error";

export interface RatePlan {
  id: string;
  externalRatePlanCode: string;
  name: string;
  description: string;
  benefits: string[];
  category: RatePlanCategory;
  policyId: string;
  cancelPolicyCode: string;
  discountPercent: number;
  pricingMode: RatePlanPricingMode;
  baseRate?: number;
  currency: string;
  status: "Active" | "Inactive" | "Draft";
  version: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  minLos: number;
  maxLos: number;
  roomTypeIds: string[];
  defaultMealPlanCode: MealPlan["code"];
  packageId?: string;
  corporateAccountIds?: string[];
  isBarAnchor: boolean;
  syncStatus: RatePlanSyncStatus;
  lastSyncedAt?: string;
  propertyId: string;
  tenantId: string;
  bookingsMtd?: number;
}

export interface RatePlanVersion {
  id: string;
  ratePlanId: string;
  version: number;
  snapshot: RatePlan;
  publishedAt: string;
  publishedBy: string;
  changeSummary: string;
}

export type RatePlanValidationSeverity = "error" | "warning";

export interface RatePlanValidationIssue {
  ruleId: string;
  message: string;
  severity: RatePlanValidationSeverity;
  tab?: "General" | "Pricing" | "Restrictions" | "Policies" | "Room & meal" | "Channels";
}

export interface RatePlanValidationResult {
  errors: RatePlanValidationIssue[];
  warnings: RatePlanValidationIssue[];
  canPublish: boolean;
}

export interface PackageItem {
  id: string;
  packageId: string;
  type: "room" | "meal" | "service" | "activity";
  name: string;
  included: boolean;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  status: "Active" | "Draft" | "Inactive";
}

export interface ReservationMealPlan {
  reservationId: string;
  mealPlanId: string;
  nightlyAdjustment: number;
}

export interface ReservationRatePlan {
  reservationId: string;
  ratePlanId: string;
  discountAmount: number;
}

export type AddOnPricingMode = "fixed" | "percentage" | "per_day" | "per_guest";

export interface ReservationAddOn {
  reservationId: string;
  addOnId: string;
  quantity: number;
  pricingMode: AddOnPricingMode;
  unitPrice: number;
  totalAmount: number;
}

export interface ReservationPackage {
  reservationId: string;
  packageId: string;
  quantity: number;
  totalAmount: number;
}

export interface OccupancyPricing {
  occupancyType: "single" | "double" | "triple" | "quad";
  multiplier: number;
}

export interface PricingBreakdownLine {
  label: string;
  amount: number;
}

export interface ReservationPricingBreakdown {
  roomRate: number;
  mealPlanCharges: number;
  packageCharges: number;
  addOnCharges: number;
  taxes: number;
  extraGuestCharges: number;
  total: number;
  lines: PricingBreakdownLine[];
}

export type RateDiscountType = "Fixed" | "Percentage";

export interface CorporateRateContract {
  rateCode: string;
  roomType: string;
  discountType: RateDiscountType;
  discountValue: number;
  isLRA: boolean;
  blackoutDates: string[];
}

export interface CorporateAccount {
  id: string;
  company: string;
  rateCode: string;
  roomNightsMtd: number;
  revenueMtd: number;
  openInvoices: number;
  contact: string;

  // Extended fields
  taxId?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  // Production
  annualRoomNightTarget?: number;
  ytdRoomNights?: number;
  ytdRevenue?: number;
  
  // Contracts
  contracts?: CorporateRateContract[];
  
  // Direct Billing (AR)
  creditLimit?: number;
  currentBalance?: number;
  arAging?: {
    current: number;
    thirtyDays: number;
    sixtyDays: number;
    ninetyPlusDays: number;
  };
}

export interface OnlineCheckIn {
  resId: string;
  guest: string;
  roomType: string;
  eta: string;
  status: "Pending review" | "Approved" | "Needs info";
  idVerified: boolean;
  paymentStatus: "Paid" | "Deposit due" | "Pending";
}

export interface CommThread {
  id: string;
  name: string;
  last: string;
  time: string;
  unread: number;
  channel: "Email" | "WhatsApp" | "SMS";
  resId: string;
  stayStatus: string;
}

export type InsightCategory = "All" | "Pricing" | "Operations" | "Guest" | "Risk";

export interface LoyaltyMember {
  id: string;
  name: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  points: number;
  lifetimePoints: number;
  lastActivity: string;
}

export interface RegistrationCard {
  id: string;
  resId: string;
  guest: string;
  signedAt?: string;
  status: "Signed" | "Pending" | "Exception";
  template: string;
}

export interface LostFoundItem {
  id: string;
  description: string;
  itemDetail?: string;
  roomDetail?: string;
  imageUrl?: string;
  location: string;
  foundAt: string;
  status: "Open" | "Matched" | "Released" | "Disposed";
  guestMatch?: string;
}

export interface FeedbackEntry {
  id: string;
  guest: string;
  channel: string;
  score: number;
  category: string;
  status: "Open" | "In Progress" | "Resolved";
  severity: "Low" | "Medium" | "High";
}

export interface BookingPromo {
  id: string;
  code: string;
  discount: string;
  validity: string;
  bookings: number;
  status: "Active" | "Expired";
}

export interface PackageProduct {
  id: string;
  name: string;
  price: number;
  inclusions: string;
  bookingsMtd: number;
  status: "Active" | "Draft";
}

export interface AddOnProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  department: string;
  attachRate: string;
}

export interface ConciergeRequest {
  id: string;
  guest: string;
  room: string;
  type: string;
  status: "New" | "Confirmed" | "Completed" | "Cancelled";
  datetime: string;
}

export interface TransportTrip {
  id: string;
  guest: string;
  pickup: string;
  flight?: string;
  driver: string;
  status: "Scheduled" | "En route" | "Completed" | "Delayed";
}

export interface ActivitySlot {
  id: string;
  name: string;
  date: string;
  capacity: number;
  booked: number;
  price: number;
}

export interface PortfolioProperty {
  id: string;
  name: string;
  city: string;
  occupancy: number;
  revenue: number;
  revpar: number;
  alerts: number;
  stars: number;
}

export type AIDemandBand = "Low" | "Medium" | "High" | "Peak";

export interface AIDemandFunnelPoint {
  totalRooms: number;
  soldByTime: number;
  rooms: number;
  occupancyPct: number;
  price: number;
  stageType: "Actual" | "Forecast";
  sellProbability: number;
  demandBand: AIDemandBand;
  ts: string;
}

export interface AIDemandSnapshot {
  demandScore: number;
  occupancyPct: number;
  availableRooms: number;
  currentAdr: number;
  recommendedAdr: number;
  revenueLiftPct: number;
}

export interface PriceForecastPoint {
  time: string;
  predictedPrice: number;
}

export interface OccupancyPricePoint {
  time: string;
  occupancyPct: number;
  price: number;
}

export interface RevenueForecast {
  today: number;
  next7Days: number;
  opportunityScore: number;
}

export interface CompetitorRateCard {
  hotel: string;
  distanceKm: number;
  rate: number;
  deltaPct: number;
  position: "Lower" | "Parity" | "Higher";
}

export interface AIInsight {
  id: string;
  severity: "Info" | "Warning" | "Critical";
  message: string;
  action: string;
  confidence: number;
}

export interface PricingOverrideSettings {
  autoPricing: boolean;
  minPrice: number;
  maxPrice: number;
  surgeCapPct: number;
}

export interface AIRevenueDashboardData {
  demandFunnel: AIDemandFunnelPoint[];
  demandSnapshot: AIDemandSnapshot;
  priceForecast: PriceForecastPoint[];
  occupancyVsPrice: OccupancyPricePoint[];
  revenueForecast: RevenueForecast;
  competitors: CompetitorRateCard[];
  insights: AIInsight[];
  overrides: PricingOverrideSettings;
  asOf: string;
}

export type WebsiteBuilderDevice = "desktop" | "tablet" | "mobile";

export type WebsiteBuilderSectionType =
  | "hero"
  | "rooms"
  | "offers"
  | "gallery"
  | "faq"
  | "text"
  | "booking";

export interface WebsiteBuilderSection {
  id: string;
  name: string;
  type: WebsiteBuilderSectionType;
  visible: boolean;
  scheduledAt?: string;
}

export interface WebsiteBuilderPage {
  id: string;
  name: string;
  slug: string;
  status: "Draft" | "Ready" | "Published";
  scheduledPublishAt?: string;
  sections: WebsiteBuilderSection[];
  seoScore: number;
}

export interface WebsiteBuilderThemeOption {
  id: string;
  name: string;
  category: "Core" | "Luxury" | "Minimal" | "Business";
}

export interface WebsiteBuilderRoomSync {
  roomType: string;
  pmsUpdatedAt: string;
  webStatus: "Synced" | "Pending publish" | "Override active";
  overrideActive: boolean;
}

export interface WebsiteBuilderVersion {
  id: string;
  createdAt: string;
  createdBy: string;
  note: string;
  pageId?: string;
  snapshotPages?: WebsiteBuilderPage[];
}

export interface WebsiteBuilderApproval {
  id: string;
  pageName: string;
  requestedBy: string;
  requestedAt: string;
  status: "Pending" | "Approved" | "Rejected";
  approver?: string;
  decidedAt?: string;
}

export interface WebsiteBuilderPublishEvent {
  id: string;
  publishedAt: string;
  publishedBy: string;
  pageCount: number;
  note: string;
}

export interface WebsiteBuilderWorkspace {
  id: string;
  propertyId: string;
  siteName: string;
  selectedPageId: string;
  selectedThemeId: string;
  previewDevice: WebsiteBuilderDevice;
  autosaveEnabled: boolean;
  pages: WebsiteBuilderPage[];
  themeOptions: WebsiteBuilderThemeOption[];
  roomSync: WebsiteBuilderRoomSync[];
  versions: WebsiteBuilderVersion[];
  lastAction: string;
  lastSavedAt: string;
  lastPublishedAt?: string;
}

export type TaxComponentType =
  | "gst"
  | "city_tax"
  | "service_charge"
  | "tourism_tax"
  | "vat"
  | "luxury_tax";

export type TaxCalculationBase = "room_tariff" | "folio_subtotal" | "per_night" | "per_guest_night";

export interface TaxComponent {
  id: string;
  code: string;
  name: string;
  type: TaxComponentType;
  ratePercent: number;
  flatAmount?: number;
  calculationBase: TaxCalculationBase;
  inclusive: boolean;
  status: "Active" | "Inactive";
  effectiveFrom?: string;
  effectiveTo?: string;
  gstSlabMin?: number;
  gstSlabMax?: number;
  jurisdiction?: "intra_state" | "inter_state";
  description?: string;
}

export interface TaxGroup {
  id: string;
  code: string;
  name: string;
  componentIds: string[];
  status: "Active" | "Inactive";
  description?: string;
}

export type TaxAssignmentTarget =
  | "rate_plan"
  | "package"
  | "add_on"
  | "meal_plan"
  | "folio_default";

export interface TaxAssignment {
  id: string;
  targetType: TaxAssignmentTarget;
  targetId: string;
  targetLabel: string;
  taxGroupId: string;
}

export interface FolioTaxLine {
  componentCode: string;
  componentName: string;
  type: TaxComponentType;
  ratePercent: number;
  amount: number;
}

export interface FolioTaxBreakdown {
  subtotal: number;
  lines: FolioTaxLine[];
  totalTax: number;
  grandTotal: number;
}

export type AvailabilityStatus = "open" | "closed";

export type AvailabilityRestriction = "stop_sell" | "cta" | "ctd";

export interface AvailabilityCell {
  id: string;
  date: string;
  roomTypeId: string;
  status: AvailabilityStatus;
  restrictions: AvailabilityRestriction[];
  total: number;
  sold: number;
  allocated: number;
  updatedAt: string;
  updatedBy: string;
}

export type Guest = GuestProfile;
