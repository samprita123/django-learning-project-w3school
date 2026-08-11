import { useState, useEffect, useMemo } from "react";
import {
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  Globe,
  Image as ImageIcon,
  IndianRupee,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  ShieldAlert,
  Tag,
  Trash2,
  Search,
  Check,
  ArrowLeft,
  Calendar,
  Eye,
  Edit3,
  Layers,
  BedDouble,
  Utensils,
  CheckSquare,
  Square,
  Sparkles,
  ClipboardList,
  UserCheck,
  Clock,
  AlertCircle,
  Upload,
  Settings,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  HelpCircle,
  Table as TableIcon,
  Palette,
  ExternalLink,
} from "lucide-react";
import {
  PageHeader,
  KpiCard,
  Button,
  Card,
  StatusBadge,
} from "@/components/ui/Primitives";
import { toast } from "sonner";
import { propertyApi, type SuperadminProperty } from "@/services/api/property";

// Helper: Handle Browser Local Image File Upload (convert to base64 Data URL)
const handleBrowserFileUpload = (
  file: File,
  onSuccess: (dataUrl: string) => void
) => {
  if (!file.type.startsWith("image/")) {
    toast.error("Please select a valid image file (JPG, PNG, WEBP, etc.)");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    toast.error("Image file size should be less than 10MB");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    if (result) {
      onSuccess(result);
      toast.success(`Image "${file.name}" loaded successfully!`);
    }
  };
  reader.onerror = () => {
    toast.error("Failed to read image file");
  };
  reader.readAsDataURL(file);
};

// ─── WYSIWYG Rich Text Toolbar Component ──────────────────────────────────────
interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  minHeight?: string;
}

function RichTextEditor({ value, onChange, minHeight = "180px" }: RichTextEditorProps) {
  const [fontFamily, setFontFamily] = useState("Helvetica Neue");

  const insertTag = (startTag: string, endTag: string = "") => {
    onChange(`${value}${startTag}${endTag}`);
  };

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-surface-2/60 px-3 py-2 text-[12px]">
        {/* Style / Font Dropdown */}
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="rounded border border-border bg-surface px-2 py-1 text-[11px] font-medium text-text-primary focus:outline-none focus:border-primary"
        >
          <option value="Helvetica Neue">Helvetica Neue</option>
          <option value="Arial">Arial</option>
          <option value="Roboto">Roboto</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Basic Formatting Buttons */}
        <button
          type="button"
          onClick={() => insertTag("<b>", "</b>")}
          className="rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertTag("<i>", "</i>")}
          className="rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertTag("<u>", "</u>")}
          className="rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition"
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertTag("<strike>", "</strike>")}
          className="rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition"
          title="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Text Color Picker */}
        <label className="flex items-center gap-1 cursor-pointer rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition" title="Font Color">
          <Palette className="h-3.5 w-3.5 text-amber-500" />
          <input
            type="color"
            onChange={(e) => insertTag(`<span style="color: ${e.target.value}">`, "</span>")}
            className="sr-only"
          />
        </label>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => insertTag("<ul>\n  <li>", "</li>\n</ul>")}
          className="rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition"
          title="Unordered List"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertTag("<ol>\n  <li>", "</li>\n</ol>")}
          className="rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition"
          title="Ordered List"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Link, Table, Code, HR */}
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter Link URL:");
            if (url) insertTag(`<a href="${url}" target="_blank">`, "</a>");
          }}
          className="rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition"
          title="Insert Link"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<table border="1">\n  <tr><th>Header 1</th><th>Header 2</th></tr>\n  <tr><td>Item 1</td><td>Item 2</td></tr>\n</table>')}
          className="rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition"
          title="Insert Table"
        >
          <TableIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertTag("<hr />\n")}
          className="rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition text-[11px] font-bold"
          title="Horizontal Rule"
        >
          ―
        </button>
        <button
          type="button"
          onClick={() => insertTag("<code>", "</code>")}
          className="rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition"
          title="Code Snippet"
        >
          <Code className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => toast.info("Rich text HTML editor active. You can type or paste formatted text directly.")}
          className="rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition"
          title="Help"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Editor Content Area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ minHeight, fontFamily }}
        className="w-full bg-surface p-3 text-[13px] text-text-primary focus:outline-none resize-y leading-relaxed font-sans"
        placeholder="Enter rich detailed text content..."
      />
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type MealPlanCode = "EP" | "CP" | "MAP" | "AP";

export interface CustomRoomType {
  id: string;
  name: string;
  slug: string;
  totalRooms?: number;
  bedType: string;
  baseIncludedAdults?: number;
  baseIncludedChildren?: number;
  maxAdults: number;
  maxChildren: number;
  maxExtraGuest?: number;
  areaSqFt?: number;
  basePrice: number;
  description: string;
  thumbnailUrl: string;
  providedMealPlans: MealPlanCode[];
  amenities?: string[];
}

export interface MealPlanRate {
  planCode: MealPlanCode;
  title: string;
  description: string;
  singlePrice: number;
  doublePrice?: number;
  extraAdultPrice: number;
  extraChildPrice: number;
  taxPct: number;
  isPopular: boolean;
}

export interface PromoEntry {
  id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  validFrom: string;
  validTo: string;
  minNights: number;
  isActive: boolean;
}

export interface PaymentGateway {
  id: string;
  provider: string;
  keyId: string;
  keySecret: string;
  sandbox: boolean;
  enabled: boolean;
  payAtHotel: boolean;
  depositPct: number;
}

export interface AddonPackage {
  id: string;
  name: string;
  category: string;
  chargeType: "Per Stay" | "Per Night" | "Per Guest";
  price: number;
  taxPct: number;
  isActive: boolean;
}

export interface HotelImageEntry {
  id: string;
  imageUrl: string;
}

const MASTER_ROOM_AMENITIES = [
  "Free High-Speed Wi-Fi",
  "Air Conditioning (AC)",
  "Ensuite Bathtub & Shower",
  "Flat-Screen TV",
  "Mini Bar & Coffee Maker",
  "Private Balcony / Sea View",
  "Room Safe",
  "24/7 Room Service",
];

// ─── Default Master Meal Plans ────────────────────────────────────────────────

const MEAL_PLAN_CONFIG: Record<MealPlanCode, { name: string; title: string; desc: string; defaultMultiplier: number }> = {
  EP: { name: "EP (European Plan)", title: "EP (Room Only)", desc: "Room stay with essential amenities. Meals charged extra.", defaultMultiplier: 1.0 },
  CP: { name: "CP (Continental Plan)", title: "CP (Room + Breakfast)", desc: "Includes complimentary daily breakfast buffet.", defaultMultiplier: 1.15 },
  MAP: { name: "MAP (Modified American)", title: "MAP (Breakfast + Lunch / Dinner)", desc: "Includes daily breakfast plus choice of lunch or dinner.", defaultMultiplier: 1.35 },
  AP: { name: "AP (American Plan)", title: "AP (American Plan - 3 Meals)", desc: "Includes full breakfast, lunch, and dinner daily.", defaultMultiplier: 1.55 },
};

// ─── Defaults & Seed Data ──────────────────────────────────────────────────────

const DEFAULT_HOTEL_IMAGES: HotelImageEntry[] = [
  { id: "img-1", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", displayOrder: 1 },
  { id: "img-2", imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", displayOrder: 2 },
  { id: "img-3", imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80", displayOrder: 3 },
  { id: "img-4", imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80", displayOrder: 4 },
  { id: "img-5", imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80", displayOrder: 5 },
  { id: "img-6", imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80", displayOrder: 6 },
  { id: "img-7", imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", displayOrder: 7 },
  { id: "img-8", imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80", displayOrder: 8 },
  { id: "img-9", imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80", displayOrder: 9 },
  { id: "img-10", imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80", displayOrder: 10 },
];

const SEED_PROPERTIES: SuperadminProperty[] = [
  {
    id: "prop-arpita-beach",
    tenant: "tenant-arpita",
    tenant_name: "Arpita Hospitality",
    hotel_id: "40812",
    name: "Arpita Beach Resort",
    property_type: "RESORT",
    address_line_1: "Chandipur Beach Road, Near Sea Coast",
    city: "Chandipur",
    state: "Odisha",
    country: "India",
    postal_code: "756025",
    contact_phone: "+91 94370 80844",
    contact_email: "stay@arpitabeachresort.in",
    website: "https://arpitabeachresort.in",
    star_rating: "4",
    is_active: true,
    subscription_end_date: "2027-12-31",
    currency: "INR",
    timezone: "Asia/Kolkata",
    check_in_time: "12:00 PM",
    check_out_time: "10:00 AM",
    cancellation_policy: "Free cancellation up to 72 hours prior to arrival. Cancellations made within 72 hours will incur 1 night room charge.",
    house_rules: "Valid Govt photo ID required at check-in.",
    booking_engine_settings: {
      slug: "arpita-beach-resort",
      custom_domain: "booking.arpitabeachresort.in",
      page_title: "Welcome To a premier four star facility hotel Arpita Beach Resort",
      theme_color: "#ffc107",
      rate_plan: "CP PLAN",
      account_payment_mode: "Internet Banking",
      discount_pct: 35.00,
      currency_code: "INR India Rupees",
      use_online_gateway: true,
      payment_gateway_provider: "Razorpay",
      merchant_name: "Arpita Beach Resort",
      gateway_key: "rzp_live_SqQx1sFofPopes",
      gateway_salt: "ix4BxAgBHPVtsIOVDfDIQ074",
      allow_emi: false,
      allow_pay_at_hotel: false,
      accept_part_payment: true,
      part_payment_pct: 20.00,
      notify_guest: true,
      notify_admin: true,
      email_mandatory: true,
      address1_mandatory: true,
      city_mandatory: true,
      mark_unpaid_tentative: true,
      auto_sync_cm: true,
      allow_cancellation: true,
      cancellation_pct: 100.00,
      cancellation_days: 7,
      refund_via_gateway: true,
      google_map_url: "https://share.google/aMnx0G1FsH7XHcvp",
      facebook_url: "https://www.facebook.com/arpita.beachresort/",
      instagram_url: "https://www.instagram.com/arpitabeachresort/",
      twitter_url: "https://x.com/Abresort80844",
      linkedin_url: "https://www.linkedin.com/Hotel_Review-g1152223-d5040384-Reviews-Arpita_Beach_Resort-Chandipur_Balasore_Dist",
    },
  },
  {
    id: "prop-grand-palace",
    tenant: "tenant-1",
    tenant_name: "Retrod Group",
    hotel_id: "10021",
    name: "Retrod Hotel",
    property_type: "HOTEL",
    address_line_1: "Plot No. 102, Retrod Tech Avenue",
    city: "Bhubaneswar",
    state: "Odisha",
    country: "India",
    postal_code: "751001",
    contact_phone: "9999999999",
    contact_email: "support@retrod.in",
    website: "https://retrod.in",
    star_rating: "5",
    is_active: true,
    subscription_end_date: "2026-12-31",
    currency: "INR",
    timezone: "Asia/Kolkata",
    check_in_time: "14:00",
    check_out_time: "11:00",
    cancellation_policy: "Free cancellation up to 72 hours prior to arrival.",
    house_rules: "No smoking inside rooms.",
    booking_engine_settings: {
      slug: "retrod-hotel",
      page_title: "Retrod Hotel - Luxury Stay",
      theme_color: "#ffc107",
    },
  },
];

const DEFAULT_ROOM_TYPES: CustomRoomType[] = [
  {
    id: "rt-1",
    name: "CLASSIC DELUXE",
    slug: "classic-deluxe",
    totalRooms: 9,
    bedType: "Double Bed",
    baseIncludedAdults: 2,
    baseIncludedChildren: 1,
    maxAdults: 3,
    maxChildren: 2,
    maxExtraGuest: 1,
    areaSqFt: 144,
    basePrice: 3500,
    description: "Elegant Classic Deluxe room featuring a plush double bed, tea/coffee maker, complimentary high-speed Wi-Fi, and ensuite luxury bath amenities.",
    thumbnailUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=500&q=80",
    providedMealPlans: ["EP", "CP", "MAP", "AP"],
  },
  {
    id: "rt-2",
    name: "EXECUTIVE",
    slug: "executive",
    totalRooms: 9,
    bedType: "Double Bed",
    baseIncludedAdults: 2,
    baseIncludedChildren: 1,
    maxAdults: 3,
    maxChildren: 2,
    maxExtraGuest: 1,
    areaSqFt: 180,
    basePrice: 4800,
    description: "Premium Executive accommodation offering extra workspace, modern coastal decor, smart TV, minibar, and complimentary daily breakfast.",
    thumbnailUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=500&q=80",
    providedMealPlans: ["EP", "CP", "MAP", "AP"],
  },
  {
    id: "rt-3",
    name: "PREMIUM",
    slug: "premium",
    totalRooms: 10,
    bedType: "Double Bed",
    baseIncludedAdults: 2,
    baseIncludedChildren: 1,
    maxAdults: 4,
    maxChildren: 2,
    maxExtraGuest: 1,
    areaSqFt: 180,
    basePrice: 5900,
    description: "Spacious Premium category with scenic resort views, king double bedding, private balcony, and priority room service.",
    thumbnailUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=500&q=80",
    providedMealPlans: ["EP", "CP", "MAP", "AP"],
  },
  {
    id: "rt-4",
    name: "PRESIDENTIAL SUITE",
    slug: "presidential-suite",
    totalRooms: 2,
    bedType: "Double Bed",
    baseIncludedAdults: 2,
    baseIncludedChildren: 1,
    maxAdults: 4,
    maxChildren: 2,
    maxExtraGuest: 2,
    areaSqFt: 380,
    basePrice: 12500,
    description: "Ultra-luxurious Presidential Suite featuring a private master lounge, plush double bedding, oceanfront panoramic windows, and personal butler assistance.",
    thumbnailUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=500&q=80",
    providedMealPlans: ["EP", "CP", "MAP", "AP"],
  },
  {
    id: "rt-5",
    name: "SUPERIOR EXECUTIVE",
    slug: "superior-executive",
    totalRooms: 12,
    bedType: "Double Bed",
    baseIncludedAdults: 2,
    baseIncludedChildren: 1,
    maxAdults: 3,
    maxChildren: 2,
    maxExtraGuest: 1,
    areaSqFt: 200,
    basePrice: 6500,
    description: "Top tier Superior Executive room with plush bedding, dedicated lounge corner, high-speed Wi-Fi, and luxury bath amenities.",
    thumbnailUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80",
    providedMealPlans: ["EP", "CP", "MAP", "AP"],
  },
];

const DEFAULT_ADDONS: AddonPackage[] = [
  { id: "add-1", name: "Beachside Candlelight Dinner", category: "Dining", chargeType: "Per Stay", price: 2500, taxPct: 18, isActive: true },
  { id: "add-2", name: "Airport / Railway Transfer (One Way)", category: "Transfer", chargeType: "Per Stay", price: 1800, taxPct: 12, isActive: true },
  { id: "add-3", name: "Extra Rollaway Bed & Linens", category: "Bedding", chargeType: "Per Night", price: 700, taxPct: 12, isActive: true },
  { id: "add-4", name: "Ayurvedic Spa & Wellness Voucher", category: "Wellness", chargeType: "Per Guest", price: 1500, taxPct: 18, isActive: true },
  { id: "add-5", name: "Buffet Lunch / Dinner Upgrade", category: "Dining", chargeType: "Per Guest", price: 850, taxPct: 5, isActive: true },
];

const DEFAULT_PROMOS: PromoEntry[] = [
  { id: "p1", code: "DIRECT15", discountType: "percentage", discountValue: 15, validFrom: "2026-05-01", validTo: "2026-12-31", minNights: 2, isActive: true },
  { id: "p2", code: "WEEKENDSPA", discountType: "flat", discountValue: 2000, validFrom: "2026-05-01", validTo: "2026-06-30", minNights: 1, isActive: true },
];

const DEFAULT_GATEWAYS: PaymentGateway[] = [
  { id: "gw1", provider: "Razorpay", keyId: "rzp_live_SqQx1sFofPopes", keySecret: "ix4BxAgBHPVtsIOVDfDIQ074", sandbox: false, enabled: true, payAtHotel: false, depositPct: 20 },
  { id: "gw2", provider: "Stripe", keyId: "pk_live_51Mghp981249", keySecret: "••••••••••••••••", sandbox: false, enabled: false, payAtHotel: true, depositPct: 100 },
];

const SEED_BOOKINGS = [
  {
    booking_reference: "RETROD-ARP-10842",
    hotel_name: "Arpita Beach Resort",
    hotel_slug: "arpita-beach-resort",
    guest: {
      full_name: "Subhashree Mohanty",
      email: "subhashree.m@gmail.com",
      phone: "+91 94370 11223",
      purpose_of_travel: "Vacation",
      company_name: ""
    },
    room_name: "PRESIDENTIAL SUITE",
    rate_plan_title: "CP (Room + Breakfast)",
    check_in: "2026-08-12",
    check_out: "2026-08-15",
    total_nights: 3,
    num_adults: 2,
    num_children: 1,
    grand_total: 42000,
    payment_status: "PAID",
    booking_status: "CONFIRMED",
    created_at: "2026-08-09T08:15:00Z"
  },
];

const TABS = [
  { id: "setup", label: "Setup", icon: Settings },
  { id: "details", label: "Hotel Details", icon: Building2 },
  { id: "hotel-images", label: "Hotel Images", icon: ImageIcon },
  { id: "room-images", label: "Room Images", icon: BedDouble },
  { id: "addons", label: "Addons", icon: Sparkles },
  { id: "policies", label: "Policies", icon: ShieldAlert },
  { id: "rates", label: "Rates", icon: IndianRupee },
  { id: "bulk-rates", label: "Bulk Rates", icon: Calendar },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── Helper: Generate Rates Matrix ──────────────────────────────────────────

function generateRatesMatrixForRoomTypes(roomTypes: CustomRoomType[], existingMatrix?: Record<string, MealPlanRate[]>): Record<string, MealPlanRate[]> {
  const matrix: Record<string, MealPlanRate[]> = {};

  roomTypes.forEach((rt) => {
    const existingRates = existingMatrix ? existingMatrix[rt.id] || [] : [];
    const ratesForRoom: MealPlanRate[] = [];

    rt.providedMealPlans.forEach((planCode) => {
      const existing = existingRates.find((r) => r.planCode === planCode);
      if (existing) {
        ratesForRoom.push({
          ...existing,
          extraAdultPrice: existing.extraAdultPrice ?? 700,
          extraChildPrice: existing.extraChildPrice ?? 500,
        });
      } else {
        const config = MEAL_PLAN_CONFIG[planCode];
        const sPrice = Math.round(rt.basePrice * config.defaultMultiplier);
        const dPrice = Math.round(sPrice * 1.2);
        ratesForRoom.push({
          planCode,
          title: config.title,
          description: config.desc,
          singlePrice: sPrice,
          doublePrice: dPrice,
          extraAdultPrice: 700,
          extraChildPrice: 500,
          taxPct: 12,
          isPopular: planCode === "CP",
        });
      }
    });

    matrix[rt.id] = ratesForRoom;
  });

  return matrix;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BookingEngineFeature() {
  const [viewMode, setViewMode] = useState<"list" | "edit">("edit");
  const [tab, setTab] = useState<TabId>("setup");

  // Properties state
  const [properties, setProperties] = useState<SuperadminProperty[]>(SEED_PROPERTIES);
  const [selectedHotelId, setSelectedHotelId] = useState<string>("prop-arpita-beach");
  const [propertySearch, setPropertySearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Selected Hotel memo
  const selectedHotel = useMemo(() => {
    return properties.find((p) => p.id === selectedHotelId) || properties[0] || SEED_PROPERTIES[0];
  }, [properties, selectedHotelId]);

  // ─── TAB 1: SETUP FORM STATE ────────────────────────────────────────────────
  const [pageTitle, setPageTitle] = useState("Welcome To a premier four star facility hotel Arpita Beach Resort");
  const [themeColor, setThemeColor] = useState("#ffc107");
  const [website, setWebsite] = useState("https://arpitabeachresort.in");
  const [starCategory, setStarCategory] = useState("4");
  const [ratePlan, setRatePlan] = useState("CP PLAN");
  const [accountPaymentMode, setAccountPaymentMode] = useState("Internet Banking");
  const [discountPercentage, setDiscountPercentage] = useState("35.00");
  const [currencyCode, setCurrencyCode] = useState("INR India Rupees");

  // Online Payment Setup State
  const [useOnlinePaymentGateway, setUseOnlinePaymentGateway] = useState(true);
  const [paymentGatewayProvider, setPaymentGatewayProvider] = useState("Razorpay");
  const [merchantName, setMerchantName] = useState("Arpita Beach Resort");
  const [gatewayKey, setGatewayKey] = useState("rzp_live_SqQx1sFofPopes");
  const [gatewaySalt, setGatewaySalt] = useState("ix4BxAgBHPVtsIOVDfDIQ074");
  const [allowEMI, setAllowEMI] = useState(false);
  const [allowPayAtHotel, setAllowPayAtHotel] = useState(false);
  const [acceptPartPayment, setAcceptPartPayment] = useState(true);
  const [partPaymentPercentage, setPartPaymentPercentage] = useState("20.00");
  const [paymentGatewayLogo, setPaymentGatewayLogo] = useState(
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop"
  );

  // Notifications State
  const [notifyGuest, setNotifyGuest] = useState(true);
  const [notifyAdmin, setNotifyAdmin] = useState(true);

  // Mandatory Guest Fields State
  const [emailMandatory, setEmailMandatory] = useState(true);
  const [address1Mandatory, setAddress1Mandatory] = useState(true);
  const [cityMandatory, setCityMandatory] = useState(true);

  // Bookings & Cancellation State
  const [markUnpaidTentative, setMarkUnpaidTentative] = useState(true);
  const [autoSyncCM, setAutoSyncCM] = useState(true);
  const [allowBookingCancellation, setAllowBookingCancellation] = useState(true);
  const [cancellationPercentage, setCancellationPercentage] = useState("100.00");
  const [cancellationDays, setCancellationDays] = useState("7");
  const [refundViaPaymentGateway, setRefundViaPaymentGateway] = useState(true);

  // ─── TAB 2: HOTEL DETAILS FORM STATE ───────────────────────────────────────
  const [hotelName, setHotelName] = useState("Arpita Beach Resort");
  const [slug, setSlug] = useState("arpita-beach-resort");
  const [aboutDescription, setAboutDescription] = useState(
    `Arpita Beach Resort is a premier four-star facility hotel designed for families, leisure travelers, and corporate guests seeking a premium coastal getaway. Located steps from the beach, our resort features high-end amenities including a pristine swimming pool, a fully equipped fitness center, and a multi-cuisine fine dining restaurant. We are dedicated to delivering exceptional hospitality, seamless room service, and dedicated luggage assistance to ensure a relaxing and luxurious stay for all our guests.\n\n` +
    `Trust Banner: You are booking directly with Arpita Beach Resort. Your reservation is secure and managed under our official 4-star hospitality standards.\n\n` +
    `Family Assurance: We look forward to welcoming you and your family to a relaxing beachside experience.`
  );
  const [whatMakesSpecial, setWhatMakesSpecial] = useState(
    "Indulge in the allure of this hidden gem, a luxury sanctuary with old-world charm, authentic fine dining, and a serene escape sans distractions."
  );
  const [backstory, setBackstory] = useState(
    "Originally constructed in the early 20th century as a secluded retreat, the estate preserves timeless antique wooden pillars, high ceilings, and manicured gardens that seamlessly merge heritage grandeur with modern tech & comfort."
  );
  const [websiteLogo, setWebsiteLogo] = useState(
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop"
  );
  const [websiteBanner, setWebsiteBanner] = useState(
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&auto=format&fit=crop"
  );
  const [checkInTime, setCheckInTime] = useState("12:00 PM");
  const [checkOutTime, setCheckOutTime] = useState("10:00 AM");
  const [googleMap, setGoogleMap] = useState("https://share.google/aMnx0G1FsH7XHcvp");
  const [facebook, setFacebook] = useState("https://www.facebook.com/arpita.beachresort/");
  const [instagram, setInstagram] = useState("https://www.instagram.com/arpitabeachresort/");
  const [twitter, setTwitter] = useState("https://x.com/Abresort80844");
  const [linkedIn, setLinkedIn] = useState("https://www.linkedin.com/Hotel_Review-g1152223-d5040384-Reviews-Arpita_Beach_Resort-Chandipur_Balasore_Dist");

  // ─── TAB 3: HOTEL IMAGES STATE ─────────────────────────────────────────────
  const [hotelImages, setHotelImages] = useState<HotelImageEntry[]>(DEFAULT_HOTEL_IMAGES);
  const [newImageOrder, setNewImageOrder] = useState<number>(hotelImages.length + 1);

  // ─── TAB 4: ROOM CATEGORY SETUP STATE ──────────────────────────────────────
  const [roomTypes, setRoomTypes] = useState<CustomRoomType[]>(DEFAULT_ROOM_TYPES);
  const [roomFilterName, setRoomFilterName] = useState("");
  const [roomFilterMaxGuest, setRoomFilterMaxGuest] = useState("");
  const [roomFilterSize, setRoomFilterSize] = useState("");
  const [roomFilterBedding, setRoomFilterBedding] = useState("All Bedding Type");
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  // Modal / Drawer Edit Room Category State
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [editRoomData, setEditRoomData] = useState<CustomRoomType | null>(null);

  // ─── TAB 5: ADDONS STATE ────────────────────────────────────────────────────
  const [addonsList, setAddonsList] = useState<AddonPackage[]>(DEFAULT_ADDONS);
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonCategory, setNewAddonCategory] = useState("Dining");
  const [newAddonChargeType, setNewAddonChargeType] = useState<"Per Stay" | "Per Night" | "Per Guest">("Per Stay");
  const [newAddonPrice, setNewAddonPrice] = useState("1500");
  const [newAddonTax, setNewAddonTax] = useState("18");

  // ─── TAB 6: POLICIES STATE ──────────────────────────────────────────────────
  const [termsAndConditions, setTermsAndConditions] = useState(
    `Standardized Hotel Policies\n\n` +
    `Check-In & Check-Out:\n` +
    `• Check-in Time: 12:00 PM (noon)\n` +
    `• Check-out Time: 10:00 AM\n` +
    `• Early check-in or late check-out is subject to room availability and may incur additional charges.\n\n` +
    `Resort Services & Amenities:\n` +
    `• Luggage Assistance: Complimentary porter and luggage assistance is available upon arrival and departure.\n` +
    `• In-Room Dining / Room Service: Available daily from 7:00 AM to 11:00 PM.\n` +
    `• Facility Access: Swimming pool and fitness center are open daily for registered guests.`
  );

  const [privacyPolicy, setPrivacyPolicy] = useState(
    `Standard Cancellation & Modification Policy\n\n` +
    `1. Standard Cancellation Terms:\n` +
    `• Free Cancellation: Cancel up to 72 hours (3 days) prior to your scheduled check-in time (12:00 PM) to receive a full 100% refund.\n` +
    `• Late Cancellation: Cancellations made within 72 hours of the scheduled check-in time will incur a penalty charge equal to the first night's room rate plus taxes.\n` +
    `• Same-Day Cancellation & No-Show: If you cancel on the day of check-in, or fail to arrive at the resort (No-Show), the entire booking amount (100% of the total stay) will be forfeited.\n\n` +
    `2. Booking Modifications:\n` +
    `• Modifications to stay dates or room types are permitted up to 72 hours prior to arrival, subject to room availability.`
  );

  // ─── TAB 7: RATES MATRIX STATE & DATE GRID ─────────────────────────────────
  const [ratesMatrix, setRatesMatrix] = useState<Record<string, MealPlanRate[]>>({});
  const [ratesMatrixDateFrom, setRatesMatrixDateFrom] = useState<string>("2026-08-10");
  const [ratesSelectedRoomFilter, setRatesSelectedRoomFilter] = useState<string>("ALL");

  // Grid dates helper: returns 7 consecutive dates from ratesMatrixDateFrom
  const matrixDates = useMemo(() => {
    const dates: { dateStr: string; dayName: string; dayNum: number; monthName: string; formattedHeader: string }[] = [];
    const base = new Date(ratesMatrixDateFrom || "2026-08-10");
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      dates.push({
        dateStr,
        dayName: days[d.getDay()],
        dayNum: d.getDate(),
        monthName: months[d.getMonth()],
        formattedHeader: `${d.getDate()} ${months[d.getMonth()]} ${days[d.getDay()]}`,
      });
    }
    return dates;
  }, [ratesMatrixDateFrom]);

  // Per-date rates & stop-sell overrides store
  const [dailyRates, setDailyRates] = useState<
    Record<
      string,
      { singlePrice?: number; doublePrice?: number; extraAdultPrice?: number; extraChildPrice?: number }
    >
  >({});
  const [roomStopSell, setRoomStopSell] = useState<Record<string, boolean>>({});

  const handleShiftDateMatrix = (direction: -1 | 1) => {
    const curr = new Date(ratesMatrixDateFrom || "2026-08-10");
    curr.setDate(curr.getDate() + direction * 7);
    setRatesMatrixDateFrom(curr.toISOString().split("T")[0]);
  };

  // ─── TAB 8: BULK RATES STATE ────────────────────────────────────────────────
  const [bulkRoomType, setBulkRoomType] = useState<string>("ALL");
  const [bulkMode, setBulkMode] = useState<"RATES" | "STOP-SELL">("RATES");
  const [bulkStartDate, setBulkStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [bulkEndDate, setBulkEndDate] = useState("2026-12-31");
  const [bulkSingleRate, setBulkSingleRate] = useState("4500");
  const [bulkDoubleRate, setBulkDoubleRate] = useState("5400");
  const [bulkExtraAdultRate, setBulkExtraAdultRate] = useState("700");
  const [bulkExtraChildRate, setBulkExtraChildRate] = useState("500");
  const [bulkStopSell, setBulkStopSell] = useState(false);
  const [bulkMinNights, setBulkMinNights] = useState("1");
  const [cmSyncDateFrom, setCmSyncDateFrom] = useState<string>("2026-08-10");
  const [cmSyncDateTo, setCmSyncDateTo] = useState<string>("2026-08-10");

  // Sync selected hotel data when selectedHotelId changes
  useEffect(() => {
    if (!selectedHotel) return;
    const settings = selectedHotel.booking_engine_settings || {};
    const autoSlug = settings.slug || selectedHotel.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    setHotelName(selectedHotel.name || "Arpita Beach Resort");
    setSlug(autoSlug);
    if (settings.page_title) setPageTitle(settings.page_title);
    if (settings.theme_color) setThemeColor(settings.theme_color);
    if (selectedHotel.website) setWebsite(selectedHotel.website);
    if (selectedHotel.star_rating) setStarCategory(selectedHotel.star_rating);
    if (settings.rate_plan) setRatePlan(settings.rate_plan);
    if (settings.account_payment_mode) setAccountPaymentMode(settings.account_payment_mode);
    if (settings.discount_pct) setDiscountPercentage(String(settings.discount_pct));
    if (settings.currency_code) setCurrencyCode(settings.currency_code);
    if (settings.merchant_name) setMerchantName(settings.merchant_name);
    if (settings.gateway_key) setGatewayKey(settings.gateway_key);
    if (settings.gateway_salt) setGatewaySalt(settings.gateway_salt);
    if (selectedHotel.check_in_time) setCheckInTime(selectedHotel.check_in_time);
    if (selectedHotel.check_out_time) setCheckOutTime(selectedHotel.check_out_time);
    if (settings.google_map_url) setGoogleMap(settings.google_map_url);
    if (settings.facebook_url) setFacebook(settings.facebook_url);
    if (settings.instagram_url) setInstagram(settings.instagram_url);
    if (settings.twitter_url) setTwitter(settings.twitter_url);
    if (settings.linkedin_url) setLinkedIn(settings.linkedin_url);

    setRatesMatrix(generateRatesMatrixForRoomTypes(roomTypes, settings.rates_matrix));
  }, [selectedHotelId, properties]);

  // Keep rates matrix synchronized whenever roomTypes change
  useEffect(() => {
    setRatesMatrix((prev) => generateRatesMatrixForRoomTypes(roomTypes, prev));
  }, [roomTypes]);

  // Modal / Add Hotel State
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [isCreatingHotel, setIsCreatingHotel] = useState(false);
  const [isActiveStatus, setIsActiveStatus] = useState(true);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState("2027-12-31");
  const [addHotelName, setAddHotelName] = useState("");
  const [addTenantName, setAddTenantName] = useState("");
  const [addCity, setAddCity] = useState("Balasore");
  const [addState, setAddState] = useState("Odisha");
  const [addAddress, setAddAddress] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addSlug, setAddSlug] = useState("");

  // Extra state declarations for full features & compatibility
  const [address, setAddress] = useState("Chandipur Sea Beach Road");
  const [city, setCity] = useState("Balasore");
  const [hotelState, setHotelState] = useState("Odisha");
  const [pincode, setPincode] = useState("756025");
  const [phone, setPhone] = useState("+91 94370 80844");
  const [email, setEmail] = useState("stay@arpitabeachresort.in");
  const [whatsapp, setWhatsapp] = useState("+91 94370 80844");
  const [mapsUrl, setMapsUrl] = useState("https://share.google/aMnx0G1FsH7XHcvp");
  const [checkIn, setCheckIn] = useState("12:00 PM");
  const [checkOut, setCheckOut] = useState("10:00 AM");
  const [cancelText, setCancelText] = useState("Free cancellation up to 72 hours prior to check-in time.");
  const [houseRules, setHouseRules] = useState("Valid Govt ID required at check-in. Pets not allowed.");
  const [customDomain, setCustomDomain] = useState("booking.arpitabeachresort.in");
  const [logoUrl, setLogoUrl] = useState("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop");

  // Room Type Form Modal state
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newBedType, setNewBedType] = useState("King Bed");
  const [newBaseIncludedAdults, setNewBaseIncludedAdults] = useState("2");
  const [newBaseIncludedChildren, setNewBaseIncludedChildren] = useState("1");
  const [newMaxAdults, setNewMaxAdults] = useState("3");
  const [newMaxChildren, setNewMaxChildren] = useState("2");
  const [newBasePrice, setNewBasePrice] = useState("4500");
  const [newThumbnailUrl, setNewThumbnailUrl] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [newSelectedMealPlans, setNewSelectedMealPlans] = useState<MealPlanCode[]>(["EP", "CP", "MAP", "AP"]);
  const [newRoomAmenities, setNewRoomAmenities] = useState<string[]>(["Free High-Speed Wi-Fi", "Air Conditioning (AC)", "Ensuite Bathtub & Shower"]);

  // Payment Gateways state
  const [gateways, setGateways] = useState<PaymentGateway[]>([
    {
      id: "gw-1",
      provider: "Razorpay",
      keyId: "rzp_live_SqQx1sFofPopes",
      keySecret: "ix4BxAgBHPVtsIOVDfDIQ074",
      sandbox: false,
      enabled: true,
      payAtHotel: true,
      depositPct: 20,
    },
  ]);
  const [showAddGatewayModal, setShowAddGatewayModal] = useState(false);
  const [newGwProvider, setNewGwProvider] = useState("Razorpay");
  const [newGwKeyId, setNewGwKeyId] = useState("");
  const [newGwSecret, setNewGwSecret] = useState("");
  const [newGwSandbox, setNewGwSandbox] = useState(false);
  const [newGwEnabled, setNewGwEnabled] = useState(true);
  const [newGwPayAtHotel, setNewGwPayAtHotel] = useState(true);
  const [newGwDepositPct, setNewGwDepositPct] = useState("20");

  // Hero Slides & Promos & Amenities
  const [heroSlides, setHeroSlides] = useState<string[]>([
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&auto=format&fit=crop",
  ]);
  const [newSlideUrl, setNewSlideUrl] = useState("");
  const [promos, setPromos] = useState<PromoEntry[]>([
    {
      id: "p1",
      code: "WELCOME35",
      discountType: "percentage",
      discountValue: 35,
      validFrom: "2026-01-01",
      validTo: "2026-12-31",
      minNights: 1,
      isActive: true,
    },
  ]);
  const [newCode, setNewCode] = useState("");
  const [newDiscType, setNewDiscType] = useState<"percentage" | "fixed">("percentage");
  const [newDiscValue, setNewDiscValue] = useState("10");
  const [newValidFrom, setNewValidFrom] = useState("");
  const [newValidTo, setNewValidTo] = useState("");
  const [newMinNights, setNewMinNights] = useState("1");
  const [childPolicy, setChildPolicy] = useState("Children below 6 stay free without extra bed. Extra bed charge applies for children 6+ years.");
  const [amenitiesList, setAmenitiesList] = useState<{ name: string; category: string; enabled: boolean }[]>([
    { name: "Free High-Speed Wi-Fi", category: "General", enabled: true },
    { name: "Swimming Pool", category: "Outdoors", enabled: true },
    { name: "Fitness Center", category: "Wellness", enabled: true },
    { name: "Multi-Cuisine Restaurant", category: "Dining", enabled: true },
    { name: "Complimentary Luggage Assistance", category: "Services", enabled: true },
  ]);
  const [newCustomAmenityName, setNewCustomAmenityName] = useState("");

  // SuperAdmin Dashboard list view states
  const [activeAdminTab, setActiveAdminTab] = useState<"hotels" | "activity_log">("hotels");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [addPropertyType, setAddPropertyType] = useState("Resort");
  const [addCountry, setAddCountry] = useState("India");
  const [addSubscriptionEnd, setAddSubscriptionEnd] = useState("2027-12-31");
  const [addProvisionDefaults, setAddProvisionDefaults] = useState(true);

  const filteredProperties = useMemo(() => {
    if (!propertySearch.trim()) return properties;
    return properties.filter(
      (p) =>
        p.name.toLowerCase().includes(propertySearch.toLowerCase()) ||
        (p.city || "").toLowerCase().includes(propertySearch.toLowerCase())
    );
  }, [properties, propertySearch]);

  const openEditHotelMode = (id: string) => {
    setSelectedHotelId(id);
    setViewMode("edit");
  };

  const handleCreateProperty = async () => {
    if (!addHotelName.trim()) {
      toast.error("Please enter a property name");
      return;
    }
    setIsCreatingHotel(true);

    const generatedSlug = addSlug.trim() || addHotelName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const defaultRoomTypes = DEFAULT_ROOM_TYPES;
    const defaultMatrix = generateRatesMatrixForRoomTypes(defaultRoomTypes);

    const newPayload = {
      name: addHotelName.trim(),
      slug: generatedSlug,
      property_type: "Resort",
      city: addCity.trim() || "Balasore",
      state: addState.trim() || "Odisha",
      country: "India",
      address: addAddress.trim(),
      phone: addPhone.trim(),
      email: addEmail.trim(),
      star_rating: "4",
      is_active: true,
      booking_engine_settings: {
        page_title: `Welcome to ${addHotelName.trim()}`,
        theme_color: "#ffc107",
        rate_plan: "CP PLAN",
        account_payment_mode: "Internet Banking",
        discount_pct: 35,
        currency_code: "INR India Rupees",
        merchant_name: addHotelName.trim(),
        gateway_key: "rzp_live_SqQx1sFofPopes",
        gateway_salt: "ix4BxAgBHPVtsIOVDfDIQ074",
        room_types: defaultRoomTypes,
        rates_matrix: defaultMatrix,
      },
    };

    try {
      let createdProp: SuperadminProperty;
      try {
        createdProp = await propertyApi.createSuperadminProperty(newPayload);
      } catch (err: any) {
        console.warn("Could not save via superadmin endpoint, creating locally:", err);
        createdProp = {
          id: `prop-new-${Date.now()}`,
          hotel_id: String(Math.floor(10000 + Math.random() * 90000)),
          tenant_name: addTenantName.trim() || "Retrod Booking Partner",
          ...newPayload,
        };
      }

      // Sync live to Booking Engine backend (port 8001)
      const compiledEngineRoomTypes = defaultRoomTypes.map((rt) => {
        const roomRates = defaultMatrix[rt.id] || [];
        return {
          name: rt.name,
          slug: rt.slug,
          bed_type: rt.bedType,
          max_adults: rt.maxAdults,
          max_children: rt.maxChildren,
          base_price: rt.basePrice,
          description: rt.description,
          thumbnail_url: rt.thumbnailUrl,
          is_active: true,
          rate_plans: roomRates.map((plan) => ({
            title: plan.title,
            description: plan.description,
            single_occupancy_price: plan.singlePrice,
            single_occupancy_tax: Math.round(plan.singlePrice * (plan.taxPct / 100)),
            double_occupancy_price: plan.doublePrice,
            double_occupancy_tax: Math.round(plan.doublePrice * (plan.taxPct / 100)),
            is_popular: plan.isPopular,
          })),
        };
      });

      const enginePayload = {
        name: addHotelName.trim(),
        slug: generatedSlug,
        tagline: "Experience Luxury & Comfort Redefined",
        description: `${addHotelName} – providing luxury accommodations and fine dining hospitality.`,
        address: addAddress.trim() || `${addHotelName} Main Road`,
        city: addCity.trim(),
        state: addState.trim() || "Goa",
        pincode: "400001",
        phone: addPhone.trim(),
        email: addEmail.trim() || `stay@${generatedSlug}.com`,
        whatsapp: addPhone.trim(),
        check_in_time: "14:00",
        check_out_time: "11:00",
        map_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3742.617635678737!2d85.8338251!3d20.2644",
        hero_banner_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        images: [
          { image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", category: "hero", caption: "Main Resort View" },
        ],
        room_types: compiledEngineRoomTypes,
      };

      fetch(`http://localhost:8001/api/v1/hotels/${generatedSlug}/update_settings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enginePayload),
      }).catch((e) => console.log("New hotel booking engine sync notice:", e));

      setProperties((prev) => [createdProp, ...prev]);
      setShowAddHotelModal(false);

      // Reset Modal Form
      setAddHotelName("");
      setAddTenantName("");
      setAddCity("");
      setAddState("");
      setAddAddress("");
      setAddPhone("");
      setAddEmail("");
      setAddSlug("");

      toast.success(`⚡ New Hotel "${createdProp.name}" created & provisioned in Booking Engine!`);

      // Automatically open edit view for the new hotel
      if (createdProp.id) {
        openEditHotelMode(createdProp.id);
      }
    } catch (err: any) {
      toast.error("Failed to add hotel: " + err.message);
    } finally {
      setIsCreatingHotel(false);
    }
  };

  const handleCreateNewHotel = handleCreateProperty;

  // Toggle Property Active Status directly from table or form
  const handleTogglePropertyActive = async (hotelId: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updatedStatus = !currentStatus;

    setProperties((prev) =>
      prev.map((p) => (p.id === hotelId ? { ...p, is_active: updatedStatus } : p))
    );

    if (hotelId === selectedHotelId) {
      setIsActiveStatus(updatedStatus);
    }

    if (!hotelId.startsWith("prop-")) {
      try {
        await propertyApi.updateSuperadminProperty(hotelId, { is_active: updatedStatus });
        toast.success(`Property status updated to ${updatedStatus ? "Active" : "Inactive"}`);
      } catch (err: any) {
        toast.error("Failed to update status: " + err.message);
      }
    } else {
      toast.success(`Property status updated to ${updatedStatus ? "Active" : "Inactive"}`);
    }
  };

  // Update Subscription End Date inline
  const handleUpdateSubscriptionDate = async (hotelId: string, newDate: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === hotelId ? { ...p, subscription_end_date: newDate } : p))
    );

    if (hotelId === selectedHotelId) {
      setSubscriptionEndDate(newDate);
    }

    if (!hotelId.startsWith("prop-")) {
      try {
        await propertyApi.updateSuperadminProperty(hotelId, { subscription_end_date: newDate });
        toast.success(`Subscription expiry date updated to ${newDate}`);
      } catch (err: any) {
        toast.error("Failed to update subscription date: " + err.message);
      }
    }
  };

  // Add New Room Type
  const handleAddRoomType = () => {
    if (!newRoomName.trim()) {
      toast.error("Please enter a Room Type Name");
      return;
    }
    if (newSelectedMealPlans.length === 0) {
      toast.error("Please select at least 1 meal plan for this room type");
      return;
    }

    const roomSlug = newRoomName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newRoom: CustomRoomType = {
      id: `rt-${Date.now()}`,
      name: newRoomName.trim(),
      slug: roomSlug,
      bedType: newBedType,
      baseIncludedAdults: Number(newBaseIncludedAdults) || 2,
      baseIncludedChildren: Number(newBaseIncludedChildren) || 1,
      maxAdults: Number(newMaxAdults) || 3,
      maxChildren: Number(newMaxChildren) || 2,
      basePrice: Number(newBasePrice) || 4000,
      thumbnailUrl: newThumbnailUrl.trim() || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=500&q=80",
      description: newRoomDesc.trim() || `Comfortable ${newRoomName} equipped with modern hotel amenities.`,
      providedMealPlans: newSelectedMealPlans,
      amenities: newRoomAmenities,
    };

    setRoomTypes((prev) => [...prev, newRoom]);
    setShowAddRoomModal(false);

    // Reset Form
    setNewRoomName("");
    setNewRoomDesc("");
    setNewBasePrice("4500");
    setNewSelectedMealPlans(["EP", "CP", "MAP", "AP"]);
    setNewRoomAmenities(["Free High-Speed Wi-Fi", "Air Conditioning (AC)", "Ensuite Bathtub & Shower"]);
    toast.success(`Room Type "${newRoom.name}" added successfully! Remember to Save Hotel Details.`);
  };

  // Toggle Room Amenity for a specific room type
  const handleToggleRoomAmenity = (roomId: string, amenityName: string) => {
    setRoomTypes((prev) =>
      prev.map((rt) => {
        if (rt.id !== roomId) return rt;
        const currentAmenities = rt.amenities || [];
        const exists = currentAmenities.includes(amenityName);
        const updated = exists
          ? currentAmenities.filter((a) => a !== amenityName)
          : [...currentAmenities, amenityName];
        return { ...rt, amenities: updated };
      })
    );
  };

  // Add custom amenity to a specific room type
  const handleAddCustomRoomAmenity = (roomId: string, customName: string) => {
    if (!customName.trim()) return;
    setRoomTypes((prev) =>
      prev.map((rt) => {
        if (rt.id !== roomId) return rt;
        const currentAmenities = rt.amenities || [];
        if (currentAmenities.includes(customName.trim())) return rt;
        return { ...rt, amenities: [...currentAmenities, customName.trim()] };
      })
    );
  };

  // Add New Payment Gateway
  const handleAddGateway = () => {
    if (!newGwProvider) {
      toast.error("Please select a Payment Gateway provider");
      return;
    }
    const newGw: PaymentGateway = {
      id: `gw-${Date.now()}`,
      provider: newGwProvider,
      keyId: newGwKeyId.trim() || `KEY_${Date.now()}`,
      keySecret: newGwSecret.trim(),
      sandbox: newGwSandbox,
      enabled: newGwEnabled,
      payAtHotel: newGwPayAtHotel || newGwProvider.toLowerCase().includes("pay at hotel"),
      depositPct: Number(newGwDepositPct) || 0,
    };

    setGateways((prev) => [...prev, newGw]);
    setShowAddGatewayModal(false);
    setNewGwKeyId("");
    setNewGwSecret("");
    toast.success(`Added ${newGwProvider} payment gateway! Remember to Save Gateways.`);
  };

  // Toggle Meal Plan for a Room Type
  const handleToggleMealPlanForRoom = (roomId: string, planCode: MealPlanCode) => {
    setRoomTypes((prev) =>
      prev.map((rt) => {
        if (rt.id !== roomId) return rt;
        const exists = rt.providedMealPlans.includes(planCode);
        const updatedPlans = exists
          ? rt.providedMealPlans.filter((p) => p !== planCode)
          : [...rt.providedMealPlans, planCode];
        return { ...rt, providedMealPlans: updatedPlans };
      })
    );
  };

  // Delete Room Type
  const handleDeleteRoomType = (roomId: string, roomName: string) => {
    if (roomTypes.length <= 1) {
      toast.error("At least one Room Type is required per hotel");
      return;
    }
    setRoomTypes((prev) => prev.filter((r) => r.id !== roomId));
    toast.success(`Room Type "${roomName}" removed.`);
  };

  // Update Rate in Matrix
  const handleUpdateMatrixRate = (
    roomTypeId: string,
    planCode: MealPlanCode,
    field: keyof MealPlanRate,
    value: any
  ) => {
    setRatesMatrix((prev) => {
      const roomRates = prev[roomTypeId] || [];
      const updatedRoomRates = roomRates.map((r) => {
        if (r.planCode !== planCode) return r;
        return { ...r, [field]: value };
      });
      return { ...prev, [roomTypeId]: updatedRoomRates };
    });
  };

  // Save selected hotel details to backend API & state
  const handleSaveHotel = async (tabName?: string) => {
    if (!selectedHotel || !selectedHotel.id) return;
    setIsSaving(true);

    const updatePayload: Partial<SuperadminProperty> = {
      name: hotelName,
      address_line_1: address,
      city: city,
      state: hotelState,
      postal_code: pincode,
      contact_phone: phone,
      contact_email: email,
      website: website,
      google_map_url: mapsUrl,
      check_in_time: checkIn,
      check_out_time: checkOut,
      cancellation_policy: cancelText,
      house_rules: houseRules,
      is_active: isActiveStatus,
      subscription_end_date: subscriptionEndDate,
      booking_engine_settings: {
        ...(selectedHotel.booking_engine_settings || {}),
        slug,
        custom_domain: customDomain,
        instagram,
        facebook,
        whatsapp,
        hero_slides: heroSlides,
        custom_room_types: roomTypes,
        rates_matrix: ratesMatrix,
        promos,
        child_policy: childPolicy,
        gateways,
        amenities: amenitiesList,
        logo_url: logoUrl,
      },
    };

    try {
      let updated: SuperadminProperty;
      if (selectedHotel.id.startsWith("prop-")) {
        updated = { ...selectedHotel, ...updatePayload };
      } else {
        updated = await propertyApi.updateSuperadminProperty(selectedHotel.id, updatePayload);
      }

      // Format payload for Retrod Booking Engine backend (port 8001)
      const engineSlug = slug || hotelName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const compiledEngineRoomTypes = roomTypes.map((rt) => {
        const roomRates = ratesMatrix[rt.id] || [];
        return {
          name: rt.name,
          slug: rt.slug,
          bed_type: rt.bedType,
          max_adults: rt.maxAdults,
          max_children: rt.maxChildren,
          base_price: rt.basePrice,
          description: rt.description,
          thumbnail_url: rt.thumbnailUrl,
          amenities: rt.amenities || [],
          is_active: true,
          rate_plans: roomRates.map((plan) => ({
            title: plan.title,
            description: plan.description,
            single_occupancy_price: plan.singlePrice,
            single_occupancy_tax: Math.round(plan.singlePrice * (plan.taxPct / 100)),
            double_occupancy_price: plan.doublePrice,
            double_occupancy_tax: Math.round(plan.doublePrice * (plan.taxPct / 100)),
            extra_adult_price: plan.extraAdultPrice ?? 700,
            extra_child_price: plan.extraChildPrice ?? 500,
            is_popular: plan.isPopular,
          })),
        };
      });

      const enabledAmenities = amenitiesList.filter((a) => a.enabled !== false);

      const enginePayload = {
        name: hotelName,
        slug: engineSlug,
        page_title: pageTitle,
        theme_color: themeColor,
        tagline: tagline || "Experience Luxury & Comfort Redefined",
        description: aboutDescription || selectedHotel.description || `${hotelName} – offering luxury accommodations, guest facilities, and fine dining.`,
        about_description: aboutDescription,
        what_makes_special: whatMakesSpecial,
        backstory: backstory,
        address: address,
        city: city,
        state: hotelState,
        pincode: pincode,
        phone: phone,
        email: email,
        whatsapp: whatsapp,
        check_in_time: checkIn,
        check_out_time: checkOut,
        map_embed_url: mapsUrl,
        facebook_url: facebook,
        instagram_url: instagram,
        twitter_url: twitter,
        linkedin_url: linkedIn,
        hero_banner_url: heroSlides[0] || websiteBanner || "",
        images: hotelImages.length > 0
          ? hotelImages.map((i) => ({ image_url: i.imageUrl, category: "gallery", caption: `Photo ${i.displayOrder}` }))
          : heroSlides.map((url, i) => ({ image_url: url, category: "hero", caption: `Banner ${i + 1}` })),
        logo_url: logoUrl || websiteLogo,
        cancellation_policy: cancelText || privacyPolicy,
        house_rules: houseRules || termsAndConditions,
        terms_and_conditions: termsAndConditions,
        privacy_policy: privacyPolicy,
        room_types: compiledEngineRoomTypes,
        amenities: enabledAmenities,
        promos: promos,
        addons: addonsList,
        payment_gateways: gateways,
        gateways: gateways,
        booking_engine_settings: {
          page_title: pageTitle,
          theme_color: themeColor,
          what_makes_special: whatMakesSpecial,
          backstory: backstory,
          rate_plan: selectRatePlan,
          account_payment_mode: accountPaymentMode,
          discount_pct: discountPct,
          currency_code: currencyCode,
          use_online_gateway: useOnlinePaymentGateway,
          payment_gateway_provider: paymentGatewayProvider,
          merchant_name: merchantName,
          gateway_key: gatewayKey,
          gateway_salt: gatewaySalt,
          allow_emi: allowEMI,
          allow_pay_at_hotel: allowPayAtHotel,
          accept_part_payment: acceptPartPayment,
          part_payment_pct: partPaymentPercentage,
          notify_guest: notifyGuest,
          notify_admin: notifyAdmin,
          email_mandatory: emailMandatory,
          address1_mandatory: address1Mandatory,
          city_mandatory: cityMandatory,
          mark_unpaid_tentative: markUnpaidTentative,
          auto_sync_cm: autoSyncCM,
          allow_cancellation: allowBookingCancellation,
          cancellation_pct: cancellationPercentage,
          cancellation_days: cancellationDays,
          refund_via_gateway: refundViaPaymentGateway,
          google_map_url: mapsUrl,
          facebook_url: facebook,
          instagram_url: instagram,
          twitter_url: twitter,
          linkedin_url: linkedIn,
        },
      };

      fetch(`http://localhost:8001/api/v1/hotels/${engineSlug}/update_settings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enginePayload),
      }).catch((err) => console.log("Booking engine backend sync notice:", err));

      setProperties((prev) =>
        prev.map((p) => (p.id === selectedHotel.id ? { ...p, ...updated } : p))
      );
      toast.success(
        `⚡ Booking Engine setup & rates saved live for "${hotelName}"!${
          tabName ? ` (${tabName})` : ""
        }`
      );
    } catch (err: any) {
      console.error("Failed to save property to backend:", err);
      setProperties((prev) =>
        prev.map((p) => (p.id === selectedHotel.id ? { ...p, ...updatePayload } : p))
      );
      toast.success(`Booking Engine settings saved locally for "${hotelName}"!`);
    } finally {
      setIsSaving(false);
    }
  };

  const addPromo = () => {
    if (!newCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }
    const p: PromoEntry = {
      id: `p${Date.now()}`,
      code: newCode.toUpperCase().replace(/\s+/g, ""),
      discountType: newDiscType,
      discountValue: Number(newDiscValue) || 10,
      validFrom: newValidFrom || new Date().toISOString().split("T")[0],
      validTo: newValidTo || "2026-12-31",
      minNights: Number(newMinNights) || 1,
      isActive: true,
    };
    setPromos((prev) => [p, ...prev]);
    setNewCode("");
    setNewDiscValue("10");
    setNewValidFrom("");
    setNewValidTo("");
    setNewMinNights("1");
    toast.success(`Promo code ${p.code} created! Click Save to push live.`);
  };

  const addSlide = () => {
    if (!newSlideUrl.trim()) return;
    setHeroSlides((prev) => [...prev, newSlideUrl.trim()]);
    setNewSlideUrl("");
    toast.success("Slideshow image added! Click Save to persist.");
  };

  const inputCls =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20";
  const labelCls = "block text-[12px] font-medium text-text-secondary mb-1";

  // ─── RENDER: LIST VIEW (TABLE OF ALL HOTELS) ────────────────────────────────

  if (viewMode === "list") {
    const activeHotelsCount = properties.filter((p) => p.is_active).length;
    const expiringSoonCount = properties.filter((p) => {
      if (!p.subscription_end_date) return false;
      const days = Math.ceil((new Date(p.subscription_end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return days <= 45;
    }).length;

    const filteredBookings = bookingsList.filter((b) => {
      const matchesSearch =
        !bookingSearch ||
        (b.booking_reference || "").toLowerCase().includes(bookingSearch.toLowerCase()) ||
        (b.hotel_name || "").toLowerCase().includes(bookingSearch.toLowerCase()) ||
        (b.guest?.full_name || "").toLowerCase().includes(bookingSearch.toLowerCase()) ||
        (b.guest?.email || "").toLowerCase().includes(bookingSearch.toLowerCase()) ||
        (b.guest?.phone || "").toLowerCase().includes(bookingSearch.toLowerCase());

      const matchesStatus =
        bookingStatusFilter === "ALL" ||
        (bookingStatusFilter === "PAID" && (b.payment_status === "PAID" || b.payment_status === "CONFIRMED")) ||
        (bookingStatusFilter === "PENDING" && (b.payment_status === "Payment Pending" || b.payment_status === "PENDING")) ||
        (bookingStatusFilter === "FAILED" && (b.payment_status === "FAILED" || b.payment_status === "CANCELLED"));

      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            title="Booking Engine — SuperAdmin Dashboard"
            description="View client hotels, live booking engines, guest entries, and real-time activity logs."
            badgeText="SuperAdmin Control"
            badgeTone="brand"
          />
          <Button onClick={() => setShowAddHotelModal(true)} className="gap-2 shadow-md">
            <Plus className="h-4 w-4" /> Add New Hotel
          </Button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Total Hotels Taken PMS" value={String(properties.length)} subtitle="Registered properties" accent="brand" />
          <KpiCard label="Active Booking Engines" value={String(activeHotelsCount)} subtitle={`${properties.length - activeHotelsCount} suspended/inactive`} accent="success" />
          <KpiCard label="Direct Engine Revenue" value="₹14.8L" subtitle="Last 30 days direct" accent="info" />
          <KpiCard label="Total Guest Entries" value={String(bookingsList.length)} subtitle="Direct engine logs" accent="warning" />
        </div>

        {/* Main Section Navigation Tabs */}
        <div className="flex border border-border bg-surface rounded-xl overflow-hidden shadow-xs p-1 gap-1">
          <button
            onClick={() => setActiveAdminTab("hotels")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-bold rounded-lg transition ${
              activeAdminTab === "hotels"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-2/60"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Client Hotels List ({filteredProperties.length})
          </button>

          <button
            onClick={() => setActiveAdminTab("activity_log")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-bold rounded-lg transition ${
              activeAdminTab === "activity_log"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-2/60"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Booking Activity Log & Guest Entries ({filteredBookings.length})
          </button>
        </div>

        {activeAdminTab === "hotels" ? (
          <>
            {/* Controls Bar: Search & Quick Actions */}
            <Card className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search by Hotel Name, Tenant, City, or Hotel ID..."
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={() => setShowAddHotelModal(true)} size="sm" className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Add New Hotel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setLoadingProperties(true);
                      try {
                        const data = await propertyApi.getSuperadminProperties();
                        if (data && data.length > 0) setProperties(data);
                      } catch (e: any) {
                        toast.error("Loaded latest state");
                      } finally {
                        setLoadingProperties(false);
                      }
                    }}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingProperties ? "animate-spin" : ""}`} /> Refresh List
                  </Button>
                </div>
              </div>
            </Card>

            {/* Hotels Tabular List */}
            <Card className="overflow-hidden p-0">
              <div className="border-b border-border bg-surface-2/60 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h2 className="text-[14px] font-semibold text-text-primary">
                    All Client Hotels ({filteredProperties.length})
                  </h2>
                </div>
                <span className="text-[12px] text-text-tertiary">
                  Click "Edit & Manage Engine" on any hotel to view & update setup
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-surface-2/40 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                    <tr>
                      <th className="px-5 py-3">Hotel & Tenant</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Booking Engine URL</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3">Subscription End Date</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredProperties.map((prop) => {
                      const settings = prop.booking_engine_settings || {};
                      const hotelSlug = settings.slug || prop.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

                      // Calculate days to subscription expiry
                      const subDate = prop.subscription_end_date || "2026-12-31";
                      const daysLeft = Math.ceil((new Date(subDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                      const isExpiringSoon = daysLeft <= 45 && daysLeft >= 0;
                      const isExpired = daysLeft < 0;

                      return (
                        <tr
                          key={prop.id}
                          className="hover:bg-surface-hover/50 transition cursor-pointer"
                          onClick={() => openEditHotelMode(prop.id!)}
                        >
                          {/* Hotel Name & ID */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-[14px]">
                                {prop.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-text-primary flex items-center gap-2">
                                  {prop.name}
                                  {prop.hotel_id && (
                                    <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] font-mono text-text-secondary">
                                      ID: {prop.hotel_id}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-text-tertiary">
                                  {prop.tenant_name || "Retrod PMS Client"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-text-primary">{prop.city}, {prop.state}</div>
                            <div className="text-[11px] text-text-tertiary truncate max-w-[180px]">
                              {prop.address_line_1}
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-3.5">
                            <div className="text-text-primary font-mono text-[12px]">{prop.contact_phone || "N/A"}</div>
                            <div className="text-[11px] text-text-tertiary truncate max-w-[180px]">{prop.contact_email}</div>
                          </td>

                          {/* Booking Engine URL */}
                          <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`http://localhost:3000/?slug=${hotelSlug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-[12px] text-info hover:underline flex items-center gap-1"
                                title="Open live guest booking engine for this hotel"
                              >
                                <Globe className="h-3 w-3" />
                                localhost:3000/?slug={hotelSlug}
                              </a>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`http://localhost:3000/?slug=${hotelSlug}`);
                                  toast.success("Booking engine link copied!");
                                }}
                                className="text-text-tertiary hover:text-primary p-1"
                                title="Copy Booking Engine Link"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Active Status */}
                          <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleTogglePropertyActive(prop.id!, prop.is_active, e)}
                              className="inline-block"
                              title="Click to toggle status"
                            >
                              <StatusBadge tone={prop.is_active ? "success" : "neutral"}>
                                {prop.is_active ? "Active" : "Inactive"}
                              </StatusBadge>
                            </button>
                          </td>

                          {/* Subscription End Date */}
                          <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <input
                                type="date"
                                value={subDate}
                                onChange={(e) => handleUpdateSubscriptionDate(prop.id!, e.target.value)}
                                className="rounded border border-border bg-surface px-2 py-1 text-[12px] font-mono text-text-primary focus:outline-none focus:border-primary"
                              />
                              {isExpired ? (
                                <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-500">Expired</span>
                              ) : isExpiringSoon ? (
                                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">{daysLeft}d left</span>
                              ) : (
                                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500">Active</span>
                              )}
                            </div>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              onClick={() => openEditHotelMode(prop.id!)}
                              className="gap-1 text-[12px]"
                            >
                              <Edit3 className="h-3.5 w-3.5" /> Edit & Manage Engine
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : (
          /* ACTIVITY LOG & DIRECT BOOKINGS SECTION */
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <Card className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 flex-1 max-w-lg">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="text"
                      placeholder="Search by Guest Name, Email, Phone, Booking Ref, or Hotel..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-[13px] font-medium text-text-primary focus:border-primary focus:outline-none"
                  >
                    <option value="ALL">All Payment Statuses</option>
                    <option value="PAID">PAID / Confirmed</option>
                    <option value="PENDING">Payment Pending</option>
                    <option value="FAILED">Failed / Cancelled</option>
                  </select>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadBookingActivityLogs}
                  className="gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingBookings ? "animate-spin" : ""}`} /> Refresh Activity Log
                </Button>
              </div>
            </Card>

            {/* Activity Log Table */}
            <Card className="overflow-hidden p-0">
              <div className="border-b border-border bg-surface-2/60 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <h2 className="text-[14px] font-bold text-text-primary">
                    Realtime Direct Booking & Guest Submissions ({filteredBookings.length})
                  </h2>
                </div>
                <span className="text-[12px] text-text-tertiary">
                  Captures completed bookings & pending guest checkout submissions
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-surface-2/40 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                    <tr>
                      <th className="px-5 py-3">Booking Ref & Time</th>
                      <th className="px-4 py-3">Hotel Property</th>
                      <th className="px-5 py-3">Guest Details</th>
                      <th className="px-4 py-3">Room & Stay Dates</th>
                      <th className="px-4 py-3 font-right">Amount</th>
                      <th className="px-4 py-3 text-center">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-text-tertiary">
                          No booking records or guest activity found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b, idx) => {
                        const guest = b.guest || {};
                        const isPaid = b.payment_status === "PAID" || b.payment_status === "CONFIRMED";
                        const isPending = b.payment_status === "Payment Pending" || b.payment_status === "PENDING";
                        const hotelSlug = b.hotel_slug || b.hotel?.slug || "hotel";
                        const hotelName = b.hotel_name || b.hotel?.name || "Retrod Partner Hotel";
                        const roomName = b.room_name || b.room_type?.name || "Deluxe Suite";
                        const rateTitle = b.rate_plan_title || b.rate_plan?.title || "CP Plan";

                        return (
                          <tr key={b.booking_reference || idx} className="hover:bg-surface-hover/40 transition">
                            {/* Ref & Date */}
                            <td className="px-5 py-3.5">
                              <div className="font-mono font-bold text-primary text-[13px]">
                                {b.booking_reference || `RETROD-REF-${idx + 1}`}
                              </div>
                              <div className="text-[11px] text-text-tertiary flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" />
                                {b.created_at ? new Date(b.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Today 10:45 AM'}
                              </div>
                            </td>

                            {/* Hotel Property */}
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-text-primary">{hotelName}</div>
                              <a
                                href={`http://localhost:3000/?slug=${hotelSlug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-mono text-info hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Globe className="h-3 w-3" /> ?slug={hotelSlug}
                              </a>
                            </td>

                            {/* Guest Details */}
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-text-primary flex items-center gap-1.5">
                                <UserCheck className="h-3.5 w-3.5 text-primary" />
                                {guest.full_name || b.full_name || 'Guest User'}
                              </div>
                              <div className="text-[11px] text-text-secondary font-mono">{guest.email || b.email || 'N/A'}</div>
                              <div className="text-[11px] text-text-tertiary font-mono">{guest.phone || b.phone || 'N/A'}</div>
                              {(guest.purpose_of_travel || guest.company_name) && (
                                <div className="text-[10px] text-text-tertiary italic mt-0.5">
                                  {guest.purpose_of_travel} {guest.company_name ? `(${guest.company_name})` : ''}
                                </div>
                              )}
                            </td>

                            {/* Room & Stay Dates */}
                            <td className="px-4 py-3.5">
                              <div className="font-medium text-text-primary">{roomName}</div>
                              <div className="text-[11px] text-text-secondary">{rateTitle}</div>
                              <div className="text-[11px] font-mono text-text-tertiary mt-0.5">
                                {b.check_in} ➔ {b.check_out} ({b.total_nights || 1}N)
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="px-4 py-3.5 font-semibold text-text-primary font-mono text-[14px]">
                              ₹{Number(b.grand_total || 0).toLocaleString('en-IN')}
                            </td>

                            {/* Payment Status Badge */}
                            <td className="px-4 py-3.5 text-center">
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-500 border border-emerald-500/20">
                                  <CheckCircle2 className="h-3 w-3" /> PAID / Confirmed
                                </span>
                              ) : isPending ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-500 border border-amber-500/20">
                                  <Clock className="h-3 w-3" /> Payment Pending
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-bold text-rose-500 border border-rose-500/20">
                                  <AlertCircle className="h-3 w-3" /> FAILED
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* MODAL: ADD NEW HOTEL */}
        {showAddHotelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-[17px] font-bold text-text-primary flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> Register New Hotel (Booking Engine Purchased)
                  </h3>
                  <p className="text-[12px] text-text-secondary mt-0.5">
                    Add a new client hotel to Retrod PMS & Booking Engine to auto-provision their schema & setup.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddHotelModal(false)}
                  className="text-text-tertiary hover:text-text-primary text-[18px]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Hotel Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Sea Breeze Resort & Spa"
                      value={addHotelName}
                      onChange={(e) => {
                        setAddHotelName(e.target.value);
                        if (!addSlug) {
                          setAddSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                        }
                      }}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tenant / Group Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sea Breeze Group"
                      value={addTenantName}
                      onChange={(e) => setAddTenantName(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Property Type</label>
                    <select
                      value={addPropertyType}
                      onChange={(e) => setAddPropertyType(e.target.value)}
                      className={inputCls}
                    >
                      <option value="HOTEL">Hotel</option>
                      <option value="RESORT">Resort</option>
                      <option value="VILLA">Villa</option>
                      <option value="VACATION_RENTAL">Vacation Rental</option>
                      <option value="APARTMENT">Apartment</option>
                      <option value="HOSTEL">Hostel</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Booking Engine Slug *</label>
                    <input
                      type="text"
                      placeholder="sea-breeze-resort"
                      value={addSlug}
                      onChange={(e) => setAddSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Calangute"
                      value={addCity}
                      onChange={(e) => setAddCity(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>State</label>
                    <input
                      type="text"
                      placeholder="e.g. Goa"
                      value={addState}
                      onChange={(e) => setAddState(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Country</label>
                    <input
                      type="text"
                      value={addCountry}
                      onChange={(e) => setAddCountry(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Street Address</label>
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={addAddress}
                    onChange={(e) => setAddAddress(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Contact Phone *</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Email</label>
                    <input
                      type="email"
                      placeholder="stay@seabreeze.com"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Subscription End Date *</label>
                    <input
                      type="date"
                      value={addSubscriptionEnd}
                      onChange={(e) => setAddSubscriptionEnd(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 pb-2 text-[12px] text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addProvisionDefaults}
                        onChange={(e) => setAddProvisionDefaults(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary"
                      />
                      <span>Auto-provision Standard Room Types & Meal Plans</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button variant="outline" onClick={() => setShowAddHotelModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNewHotel} disabled={isCreatingHotel}>
                  {isCreatingHotel ? "Provisioning..." : "⚡ Register & Provision Hotel"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── RENDER: EDIT HOTEL DETAILS VIEW ────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-1.5 text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to All Hotels List
          </Button>

          <div>
            <h1 className="text-[20px] font-bold text-text-primary flex items-center gap-2">
              {hotelName || selectedHotel.name}
              {selectedHotel.hotel_id && (
                <span className="rounded bg-surface-3 px-2 py-0.5 text-[11px] font-mono text-text-secondary">
                  ID: {selectedHotel.hotel_id}
                </span>
              )}
            </h1>
            <p className="text-[12px] text-text-secondary">
              {city}, {hotelState} · Tenant: {selectedHotel.tenant_name || "Retrod PMS Client"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(`http://localhost:3000/?slug=${slug}`);
              toast.success("Booking Engine URL copied to clipboard!");
            }}
            className="gap-1.5 text-[12px]"
          >
            <Copy className="h-4 w-4" /> Copy Booking Engine Url
          </Button>

          <Button
            size="sm"
            onClick={() => window.open(`http://localhost:3000/?slug=${slug}`, "_blank")}
            className="gap-1.5 text-[12px] bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <ExternalLink className="h-4 w-4" /> Preview
          </Button>

          <Button onClick={() => handleSaveHotel()} disabled={isSaving}>
            <Save className="h-4 w-4" /> Save Hotel Setup
          </Button>
        </div>
      </div>

      {/* Live Engine URL Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-2 text-[13px]">
          <Globe className="h-4 w-4 text-primary shrink-0" />
          <span className="text-text-secondary">Engine Link:</span>
          <a
            href={`http://localhost:3000/?slug=${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono font-semibold text-primary hover:underline"
          >
            http://localhost:3000/?slug={slug || "hotel"}
          </a>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(`http://localhost:3000/?slug=${slug}`);
            toast.success("Engine link copied to clipboard!");
          }}
          className="flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
        >
          <Copy className="h-3 w-3" /> Copy URL
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-1 rounded-xl border border-border bg-surface-2/40 p-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition ${
                  isActive
                    ? "bg-surface text-primary shadow-xs font-semibold"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-text-tertiary"}`} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: SETUP */}
      {tab === "setup" && (
        <div className="space-y-6">
          {/* Section 1: Property Setup & Rate Config */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" /> Setup Property Overview &amp; Primary Configuration
              </h3>
              <Button onClick={() => handleSaveHotel("Basic Setup")} disabled={isSaving}>
                <Save className="h-4 w-4" /> Save Setup
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Page Title *</label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Theme Color Accent *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="h-9 w-12 rounded border border-border bg-surface cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Website URL *</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Star Category *</label>
                <select
                  value={starCategory}
                  onChange={(e) => setStarCategory(e.target.value)}
                  className={inputCls}
                >
                  <option value="1">1 Star Facility</option>
                  <option value="2">2 Star Facility</option>
                  <option value="3">3 Star Facility</option>
                  <option value="4">4 Star Premier Facility</option>
                  <option value="5">5 Star Luxury Resort</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Primary Default Rate Plan *</label>
                <select
                  value={ratePlan}
                  onChange={(e) => setRatePlan(e.target.value)}
                  className={inputCls}
                >
                  <option value="CP PLAN">CP PLAN (Continental Plan - Breakfast)</option>
                  <option value="EP PLAN">EP PLAN (European Plan - Room Only)</option>
                  <option value="MAP PLAN">MAP PLAN (Modified American - Breakfast + Lunch/Dinner)</option>
                  <option value="AP PLAN">AP PLAN (American Plan - All Meals)</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Account Payment Mode *</label>
                <select
                  value={accountPaymentMode}
                  onChange={(e) => setAccountPaymentMode(e.target.value)}
                  className={inputCls}
                >
                  <option value="Internet Banking">Internet Banking / Direct NEFT / RTGS</option>
                  <option value="Razorpay Online Gateway">Razorpay Live Gateway</option>
                  <option value="UPI / QR Code">UPI Direct QR Code</option>
                  <option value="Cash at Hotel">Pay at Hotel (Cash / Card)</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Direct Engine Discount Percentage (%)</label>
                <input
                  type="text"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Currency Code *</label>
                <select
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  className={inputCls}
                >
                  <option value="INR India Rupees">INR (India Rupees ₹)</option>
                  <option value="USD US Dollar">USD (US Dollar $)</option>
                  <option value="EUR Euro">EUR (Euro €)</option>
                  <option value="GBP British Pound">GBP (British Pound £)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Section 2: Online Payment Setup */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Online Payment Gateway Setup &amp; Rules
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useOnlinePaymentGateway}
                  onChange={(e) => setUseOnlinePaymentGateway(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                <span className="text-[13px] font-bold text-text-primary">Enable Online Payment Gateway</span>
              </label>
            </div>

            {useOnlinePaymentGateway && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Payment Gateway Provider</label>
                    <select
                      value={paymentGatewayProvider}
                      onChange={(e) => setPaymentGatewayProvider(e.target.value)}
                      className={inputCls}
                    >
                      <option value="Razorpay">Razorpay (Cards, UPI, Netbanking, Wallets)</option>
                      <option value="PayU">PayU Money India</option>
                      <option value="PhonePe">PhonePe Payment Gateway</option>
                      <option value="Paytm">Paytm Merchant Gateway</option>
                      <option value="Stripe">Stripe International</option>
                      <option value="CCAvenue">CCAvenue</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Merchant Account Name</label>
                    <input
                      type="text"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Gateway Key ID</label>
                    <input
                      type="text"
                      value={gatewayKey}
                      onChange={(e) => setGatewayKey(e.target.value)}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Gateway Salt / Secret Key</label>
                    <input
                      type="password"
                      value={gatewaySalt}
                      onChange={(e) => setGatewaySalt(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
                  <label className="flex items-center gap-2 p-3 rounded-lg border border-border bg-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowEMI}
                      onChange={(e) => setAllowEMI(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary"
                    />
                    <span className="text-[12px] font-medium text-text-primary">Allow Credit Card EMI</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-lg border border-border bg-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowPayAtHotel}
                      onChange={(e) => setAllowPayAtHotel(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary"
                    />
                    <span className="text-[12px] font-medium text-text-primary">Allow Pay At Hotel Option</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-lg border border-border bg-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptPartPayment}
                      onChange={(e) => setAcceptPartPayment(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary"
                    />
                    <span className="text-[12px] font-medium text-text-primary">Accept Advance Part Payment</span>
                  </label>
                </div>

                {acceptPartPayment && (
                  <div className="w-full sm:w-1/2">
                    <label className={labelCls}>Required Advance Deposit Percentage (%)</label>
                    <input
                      type="text"
                      value={partPaymentPercentage}
                      onChange={(e) => setPartPaymentPercentage(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Section 3: Guest Mandates & Behavior */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="p-5 space-y-3">
              <h4 className="text-[14px] font-bold text-text-primary border-b border-border pb-2 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" /> Mandatory Guest Information Fields
              </h4>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface cursor-pointer">
                  <span className="text-[12px] font-medium text-text-primary">Require Guest Email Address</span>
                  <input
                    type="checkbox"
                    checked={emailMandatory}
                    onChange={(e) => setEmailMandatory(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary"
                  />
                </label>
                <label className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface cursor-pointer">
                  <span className="text-[12px] font-medium text-text-primary">Require Street Address Line 1</span>
                  <input
                    type="checkbox"
                    checked={address1Mandatory}
                    onChange={(e) => setAddress1Mandatory(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary"
                  />
                </label>
                <label className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface cursor-pointer">
                  <span className="text-[12px] font-medium text-text-primary">Require Guest City &amp; Pincode</span>
                  <input
                    type="checkbox"
                    checked={cityMandatory}
                    onChange={(e) => setCityMandatory(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary"
                  />
                </label>
              </div>
            </Card>

            <Card className="p-5 space-y-3">
              <h4 className="text-[14px] font-bold text-text-primary border-b border-border pb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Direct Booking &amp; Cancellation Behavior
              </h4>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface cursor-pointer">
                  <span className="text-[12px] font-medium text-text-primary">Mark Unpaid Bookings as Tentative</span>
                  <input
                    type="checkbox"
                    checked={markUnpaidTentative}
                    onChange={(e) => setMarkUnpaidTentative(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary"
                  />
                </label>
                <label className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface cursor-pointer">
                  <span className="text-[12px] font-medium text-text-primary">Auto-Sync Reservations with Channel Manager</span>
                  <input
                    type="checkbox"
                    checked={autoSyncCM}
                    onChange={(e) => setAutoSyncCM(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary"
                  />
                </label>
                <label className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface cursor-pointer">
                  <span className="text-[12px] font-medium text-text-primary">Allow Self-Service Guest Cancellation</span>
                  <input
                    type="checkbox"
                    checked={allowBookingCancellation}
                    onChange={(e) => setAllowBookingCancellation(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary"
                  />
                </label>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: HOTEL DETAILS */}
      {tab === "details" && (
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Hotel Details, Branding &amp; Description
              </h3>
              <Button onClick={() => handleSaveHotel("Hotel Details")} disabled={isSaving}>
                <Save className="h-4 w-4" /> Save Details
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Hotel Name *</label>
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>URL Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className={labelCls}>About Hotel Detailed Description (Plain English Text)</label>
                <textarea
                  rows={5}
                  value={aboutDescription}
                  onChange={(e) => setAboutDescription(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  placeholder="Describe your hotel facilities, services, and guest experience in plain English..."
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className={labelCls}>What Makes This Place Special (Highlight Quote Banner)</label>
                <textarea
                  rows={3}
                  value={whatMakesSpecial}
                  onChange={(e) => setWhatMakesSpecial(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  placeholder="Indulge in the allure of this hidden gem, a luxury sanctuary..."
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className={labelCls}>Property Backstory &amp; Heritage Origin</label>
                <textarea
                  rows={3}
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  placeholder="Originally constructed in the early 20th century as a secluded retreat..."
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>Website Logo Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={websiteLogo}
                    onChange={(e) => setWebsiteLogo(e.target.value)}
                    className={inputCls}
                  />
                  <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-dashed border-primary/50 bg-primary/10 hover:bg-primary/20 px-3 py-2 text-[12px] font-semibold text-primary transition shrink-0">
                    <Upload className="h-4 w-4" /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleBrowserFileUpload(file, setWebsiteLogo);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>Website Hero Banner Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={websiteBanner}
                    onChange={(e) => setWebsiteBanner(e.target.value)}
                    className={inputCls}
                  />
                  <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-dashed border-primary/50 bg-primary/10 hover:bg-primary/20 px-3 py-2 text-[12px] font-semibold text-primary transition shrink-0">
                    <Upload className="h-4 w-4" /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleBrowserFileUpload(file, setWebsiteBanner);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Standard Check-In Time</label>
                <input
                  type="text"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Standard Check-Out Time</label>
                <input
                  type="text"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Google Map Location Link</label>
                <input
                  type="text"
                  value={googleMap}
                  onChange={(e) => setGoogleMap(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <h4 className="text-[14px] font-bold text-text-primary mb-3">Social Media Handles</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label className={labelCls}>Facebook Page URL</label>
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Instagram Profile URL</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Twitter / X Link</label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>LinkedIn Business Page</label>
                  <input
                    type="text"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: HOTEL IMAGES */}
      {tab === "hotel-images" && (
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" /> Hotel Photo Gallery ({hotelImages.length})
                </h3>
                <p className="text-[12px] text-text-secondary">
                  Manage high-resolution photo gallery images displayed on your booking engine storefront.
                </p>
              </div>
              <Button onClick={() => handleSaveHotel("Hotel Images")} disabled={isSaving}>
                <Save className="h-4 w-4" /> Save Hotel Images
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {hotelImages.map((img) => (
                <div key={img.id} className="relative group rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
                  <div className="h-40 w-full overflow-hidden bg-surface-3">
                    <img src={img.imageUrl} alt="Hotel Gallery" className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-text-secondary">Order #{img.displayOrder}</span>
                    <button
                      onClick={() => setHotelImages((prev) => prev.filter((i) => i.id !== img.id))}
                      className="rounded p-1 text-text-tertiary hover:bg-rose-500/10 hover:text-rose-500 transition"
                      title="Remove Image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3">
              <h4 className="text-[13px] font-bold text-text-primary flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Add Image to Gallery
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Paste Image URL (https://...)..."
                  className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value;
                      if (val.trim()) {
                        setHotelImages((prev) => [
                          ...prev,
                          { id: `img-${Date.now()}`, imageUrl: val.trim(), displayOrder: prev.length + 1 },
                        ]);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
                <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary/50 bg-primary/10 hover:bg-primary/20 px-4 py-2 text-[13px] font-semibold text-primary transition shrink-0">
                  <Upload className="h-4 w-4" /> Upload Local File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleBrowserFileUpload(file, (dataUrl) => {
                          setHotelImages((prev) => [
                            ...prev,
                            { id: `img-${Date.now()}`, imageUrl: dataUrl, displayOrder: prev.length + 1 },
                          ]);
                        });
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: ROOM IMAGES & CATEGORIES */}
      {tab === "room-images" && (
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 pb-3 border-b border-border">
              <div>
                <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                  <BedDouble className="h-5 w-5 text-primary" /> Room Categories &amp; Photos ({roomTypes.length})
                </h3>
                <p className="text-[12px] text-text-secondary">
                  Configure room categories, thumbnail images, capacity limits, base pricing, meal plans, and room amenities.
                </p>
              </div>
              <Button onClick={() => setShowAddRoomModal(true)} size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Add New Room Type
              </Button>
            </div>

            {/* List of Configured Room Types */}
            <div className="grid grid-cols-1 gap-4">
              {roomTypes.map((rt, idx) => (
                <div
                  key={rt.id}
                  className="flex flex-col md:flex-row gap-4 rounded-xl border border-border bg-surface p-4 hover:border-primary/40 transition shadow-xs"
                >
                  <div className="w-full md:w-56 shrink-0 space-y-2">
                    <div className="relative h-36 w-full overflow-hidden rounded-lg bg-surface-3">
                      <img
                        src={rt.thumbnailUrl}
                        alt={rt.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&auto=format&fit=crop";
                        }}
                      />
                      <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
                        Room #{idx + 1}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-text-tertiary block">
                        Picture Image URL or Upload
                      </label>
                      <input
                        type="text"
                        value={rt.thumbnailUrl}
                        onChange={(e) => {
                          const newUrl = e.target.value;
                          setRoomTypes((prev) =>
                            prev.map((r) => (r.id === rt.id ? { ...r, thumbnailUrl: newUrl } : r))
                          );
                        }}
                        className="w-full rounded border border-border bg-surface-2 px-2 py-1 text-[11px] font-mono text-text-primary focus:outline-none focus:border-primary"
                        placeholder="Image URL..."
                      />
                      <label className="flex cursor-pointer items-center justify-center gap-1 rounded border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 py-1 text-[11px] font-medium text-primary transition">
                        <Upload className="h-3 w-3" /> Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleBrowserFileUpload(file, (dataUrl) => {
                                setRoomTypes((prev) =>
                                  prev.map((r) => (r.id === rt.id ? { ...r, thumbnailUrl: dataUrl } : r))
                                );
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-[15px] font-bold text-text-primary flex items-center gap-2">
                          {rt.name}
                          <span className="rounded bg-surface-3 px-2 py-0.5 text-[11px] font-mono text-text-secondary">
                            slug: {rt.slug}
                          </span>
                        </h4>
                        <p className="text-[12px] text-text-secondary mt-0.5">
                          {rt.bedType} · Capacity: {rt.maxAdults} Adults, {rt.maxChildren} Children
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-emerald-600">
                          ₹{rt.basePrice.toLocaleString()}/night
                        </span>
                        <button
                          onClick={() => handleDeleteRoomType(rt.id, rt.name)}
                          className="rounded p-1 text-text-tertiary hover:bg-rose-500/10 hover:text-rose-500 transition"
                          title="Delete Room Type"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[12px] text-text-secondary bg-surface-2/40 p-2.5 rounded-lg border border-border/50">
                      {rt.description}
                    </p>

                    {/* Room Specific Amenities */}
                    <div className="space-y-1.5 pt-2 border-t border-border/50">
                      <label className="text-[12px] font-semibold text-text-primary block flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Room Specific Amenities &amp; Highlights:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {MASTER_ROOM_AMENITIES.map((amName) => {
                          const roomAmList = rt.amenities || [];
                          const isSelected = roomAmList.includes(amName);
                          return (
                            <button
                              key={amName}
                              type="button"
                              onClick={() => handleToggleRoomAmenity(rt.id, amName)}
                              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                                isSelected
                                  ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                                  : "bg-surface-2 border border-border text-text-tertiary hover:text-text-secondary"
                              }`}
                            >
                              {isSelected ? "✓ " : "+ "} {amName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-border flex justify-end">
              <Button onClick={() => handleSaveHotel("Room Types")} disabled={isSaving}>
                <Save className="h-4 w-4" /> Save Room Categories
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: ADDONS */}
      {tab === "addons" && (
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Addon Services &amp; Upsell Packages ({addonsList.length})
                </h3>
                <p className="text-[12px] text-text-secondary">
                  Offer guests optional add-on packages during checkout (e.g. Airport Transfers, Candlelight Dinners, Spa Credits).
                </p>
              </div>
              <Button onClick={() => handleSaveHotel("Addons")} disabled={isSaving}>
                <Save className="h-4 w-4" /> Save Addons Setup
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {addonsList.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-text-primary">{addon.name}</span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
                        {addon.category}
                      </span>
                    </div>
                    <p className="text-[12px] text-text-secondary mt-1">
                      ₹{addon.price.toLocaleString()} ({addon.chargeType}) · Tax: {addon.taxPct}%
                    </p>
                  </div>
                  <button
                    onClick={() => setAddonsList((prev) => prev.filter((a) => a.id !== addon.id))}
                    className="text-text-tertiary hover:text-rose-500 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3">
              <h4 className="text-[13px] font-bold text-text-primary flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Create New Addon Service Package
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <input
                  type="text"
                  placeholder="Addon Name"
                  value={newAddonName}
                  onChange={(e) => setNewAddonName(e.target.value)}
                  className={inputCls}
                />
                <select
                  value={newAddonCategory}
                  onChange={(e) => setNewAddonCategory(e.target.value)}
                  className={inputCls}
                >
                  <option value="Dining">Dining &amp; Meals</option>
                  <option value="Transfer">Transfer &amp; Travel</option>
                  <option value="Bedding">Bedding &amp; Room</option>
                  <option value="Wellness">Wellness &amp; Spa</option>
                </select>
                <select
                  value={newAddonChargeType}
                  onChange={(e) => setNewAddonChargeType(e.target.value as any)}
                  className={inputCls}
                >
                  <option value="Per Stay">Per Stay</option>
                  <option value="Per Night">Per Night</option>
                  <option value="Per Guest">Per Guest</option>
                </select>
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newAddonPrice}
                  onChange={(e) => setNewAddonPrice(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (!newAddonName.trim()) {
                      toast.error("Please enter addon name");
                      return;
                    }
                    const newAddon: AddonPackage = {
                      id: `add-${Date.now()}`,
                      name: newAddonName.trim(),
                      category: newAddonCategory,
                      chargeType: newAddonChargeType,
                      price: Number(newAddonPrice) || 1000,
                      taxPct: Number(newAddonTax) || 18,
                      isActive: true,
                    };
                    setAddonsList((prev) => [...prev, newAddon]);
                    setNewAddonName("");
                    setNewAddonPrice("1500");
                    toast.success(`Addon "${newAddon.name}" added successfully!`);
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4" /> Add Package
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: POLICIES */}
      {tab === "policies" && (
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" /> Standardized Hotel Policies &amp; Rules
              </h3>
              <Button onClick={() => handleSaveHotel("Policies")} disabled={isSaving}>
                <Save className="h-4 w-4" /> Save Policies
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Cancellation &amp; Refund Policy (WYSIWYG Rich Text Editor)</label>
                <RichTextEditor value={privacyPolicy} onChange={setPrivacyPolicy} minHeight="200px" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 7: RATES MATRIX */}
      {tab === "rates" && (
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4 pb-3 border-b border-border">
              <div>
                <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-primary" /> Rates &amp; Meal Plans Pricing Matrix
                </h3>
                <p className="text-[12px] text-text-secondary">
                  Assign and edit rates for each meal plan provided under each room type.
                </p>
              </div>
              <Button onClick={() => handleSaveHotel("Rates Matrix")} disabled={isSaving}>
                <Save className="h-4 w-4" /> Save &amp; Sync Rates Live
              </Button>
            </div>

            <div className="space-y-6">
              {roomTypes.map((rt) => {
                const roomRates = ratesMatrix[rt.id] || [];
                return (
                  <div key={rt.id} className="rounded-xl border border-border bg-surface overflow-hidden">
                    <div className="bg-surface-2/60 px-4 py-3 border-b border-border flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rt.thumbnailUrl}
                          alt={rt.name}
                          className="h-9 w-12 rounded object-cover border border-border"
                        />
                        <div>
                          <h4 className="text-[14px] font-bold text-text-primary">{rt.name}</h4>
                          <span className="text-[11px] text-text-secondary">
                            {rt.bedType} · Base Price: ₹{rt.basePrice.toLocaleString()} · Base Included: {rt.baseIncludedAdults || 2} Adults + {rt.baseIncludedChildren || 1} Child · Max Limit: {rt.maxAdults} Adults + {rt.maxChildren} Children
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 border border-emerald-500/30">
                        {rt.providedMealPlans.length} Meal Plans Active
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[12px]">
                        <thead className="border-b border-border bg-surface-2/30 text-[11px] font-semibold uppercase text-text-secondary">
                          <tr>
                            <th className="px-4 py-2.5">Meal Plan Title</th>
                            <th className="px-3 py-2.5">Room Rate (₹)</th>
                            <th className="px-3 py-2.5">Extra Adult (₹)</th>
                            <th className="px-3 py-2.5">Extra Child (₹)</th>
                            <th className="px-3 py-2.5">Tax / GST %</th>
                            <th className="px-3 py-2.5">Calculated Tax</th>
                            <th className="px-3 py-2.5">Grand Total</th>
                            <th className="px-3 py-2.5 text-center">Popular Tag</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {roomRates.map((rate) => {
                            const taxAmount = Math.round(rate.singlePrice * (rate.taxPct / 100));
                            const grandTotal = rate.singlePrice + taxAmount;

                            return (
                              <tr key={rate.planCode} className="hover:bg-surface-hover/40">
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-text-primary">{rate.title}</div>
                                  <div className="text-[11px] text-text-tertiary">{rate.description}</div>
                                </td>

                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    <span className="text-text-tertiary">₹</span>
                                    <input
                                      type="number"
                                      value={rate.singlePrice}
                                      onChange={(e) =>
                                        handleUpdateMatrixRate(rt.id, rate.planCode, "singlePrice", Number(e.target.value) || 0)
                                      }
                                      className="w-24 rounded border border-border bg-surface px-2 py-1 text-[12px] font-mono font-semibold text-text-primary focus:outline-none focus:border-primary"
                                    />
                                  </div>
                                </td>

                                <td className="px-3 py-3">
                                  <div className="flex items-center gap-1">
                                    <span className="text-text-tertiary">₹</span>
                                    <input
                                      type="number"
                                      value={rate.extraAdultPrice ?? 700}
                                      onChange={(e) =>
                                        handleUpdateMatrixRate(rt.id, rate.planCode, "extraAdultPrice", Number(e.target.value) || 0)
                                      }
                                      className="w-20 rounded border border-border bg-surface px-2 py-1 text-[12px] font-mono font-semibold text-text-primary focus:outline-none focus:border-primary"
                                    />
                                  </div>
                                </td>

                                <td className="px-3 py-3">
                                  <div className="flex items-center gap-1">
                                    <span className="text-text-tertiary">₹</span>
                                    <input
                                      type="number"
                                      value={rate.extraChildPrice ?? 500}
                                      onChange={(e) =>
                                        handleUpdateMatrixRate(rt.id, rate.planCode, "extraChildPrice", Number(e.target.value) || 0)
                                      }
                                      className="w-20 rounded border border-border bg-surface px-2 py-1 text-[12px] font-mono font-semibold text-text-primary focus:outline-none focus:border-primary"
                                    />
                                  </div>
                                </td>

                                <td className="px-4 py-3">
                                  <select
                                    value={rate.taxPct}
                                    onChange={(e) =>
                                      handleUpdateMatrixRate(rt.id, rate.planCode, "taxPct", Number(e.target.value) || 0)
                                    }
                                    className="rounded border border-border bg-surface px-2 py-1 text-[12px] text-text-primary focus:outline-none focus:border-primary"
                                  >
                                    <option value={0}>0% Tax</option>
                                    <option value={5}>5% GST</option>
                                    <option value={12}>12% GST</option>
                                    <option value={18}>18% GST</option>
                                  </select>
                                </td>

                                <td className="px-4 py-3 font-mono text-text-secondary">
                                  +₹{taxAmount.toLocaleString()}
                                </td>

                                <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                                  ₹{grandTotal.toLocaleString()}
                                </td>

                                <td className="px-4 py-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={rate.isPopular}
                                    onChange={(e) =>
                                      handleUpdateMatrixRate(rt.id, rate.planCode, "isPopular", e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-3 border-t border-border flex justify-end">
              <Button onClick={() => handleSaveHotel("Rates Matrix")} disabled={isSaving}>
                <Save className="h-4 w-4" /> Save Rates Matrix Live
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 8: BULK RATES */}
      {tab === "bulk-rates" && (
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Bulk Rates &amp; Seasonal Pricing Tools
                </h3>
                <p className="text-[12px] text-text-secondary">
                  Apply seasonal price overrides and inventory minimum stay constraints across selected date windows.
                </p>
              </div>
              <Button onClick={() => {
                if (!bulkStartDate || !bulkEndDate) {
                  toast.error("Please select both start date and end date");
                  return;
                }
                toast.success(`⚡ Bulk rates & inventory rules updated from ${bulkStartDate} to ${bulkEndDate} across all room categories!`);
              }}>
                <Save className="h-4 w-4" /> Apply Bulk Updates
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Start Date</label>
                <input
                  type="date"
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>End Date</label>
                <input
                  type="date"
                  value={bulkEndDate}
                  onChange={(e) => setBulkEndDate(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Base Room Rate (₹)</label>
                <input
                  type="number"
                  value={bulkSingleRate}
                  onChange={(e) => setBulkSingleRate(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 4500"
                />
              </div>

              <div>
                <label className={labelCls}>Extra Adult Rate (₹)</label>
                <input
                  type="number"
                  value={bulkExtraAdultRate}
                  onChange={(e) => setBulkExtraAdultRate(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Extra Child Rate (₹)</label>
                <input
                  type="number"
                  value={bulkExtraChildRate}
                  onChange={(e) => setBulkExtraChildRate(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Minimum Stay Nights Requirement</label>
                <input
                  type="number"
                  value={bulkMinNights}
                  onChange={(e) => setBulkMinNights(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 p-3 rounded-lg border border-border bg-surface cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={bulkStopSell}
                    onChange={(e) => setBulkStopSell(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary"
                  />
                  <span className="text-[12px] font-bold text-rose-500">Apply Stop-Sell (Block Room Sales)</span>
                </label>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: ADD NEW ROOM TYPE */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" /> Add New Room Type
              </h3>
              <button
                onClick={() => setShowAddRoomModal(false)}
                className="text-text-tertiary hover:text-text-primary text-[18px]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelCls}>Room Type Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Executive Ocean Suite"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Bed Type</label>
                  <input
                    type="text"
                    placeholder="e.g. King Bed"
                    value={newBedType}
                    onChange={(e) => setNewBedType(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Base Price (₹/night)</label>
                  <input
                    type="number"
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Base Included Adults</label>
                  <input
                    type="number"
                    value={newBaseIncludedAdults}
                    onChange={(e) => setNewBaseIncludedAdults(e.target.value)}
                    className={inputCls}
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className={labelCls}>Base Included Children</label>
                  <input
                    type="number"
                    value={newBaseIncludedChildren}
                    onChange={(e) => setNewBaseIncludedChildren(e.target.value)}
                    className={inputCls}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Max Adult Capacity Limit</label>
                  <input
                    type="number"
                    value={newMaxAdults}
                    onChange={(e) => setNewMaxAdults(e.target.value)}
                    className={inputCls}
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className={labelCls}>Max Child Capacity Limit</label>
                  <input
                    type="number"
                    value={newMaxChildren}
                    onChange={(e) => setNewMaxChildren(e.target.value)}
                    className={inputCls}
                    placeholder="2"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>Room Photo Thumbnail URL or Upload File</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newThumbnailUrl}
                    onChange={(e) => setNewThumbnailUrl(e.target.value)}
                    className={inputCls}
                    placeholder="https://... or pick local file"
                  />
                  <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary/50 bg-primary/10 hover:bg-primary/20 px-3 py-2 text-[12px] font-semibold text-primary transition shrink-0">
                    <Upload className="h-4 w-4" /> Pick File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleBrowserFileUpload(file, (dataUrl) => {
                            setNewThumbnailUrl(dataUrl);
                          });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Room Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe room amenities and features..."
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-text-primary block mb-2">
                  Select Provided Meal Plans:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["EP", "CP", "MAP", "AP"] as MealPlanCode[]).map((planCode) => {
                    const isChecked = newSelectedMealPlans.includes(planCode);
                    const cfg = MEAL_PLAN_CONFIG[planCode];
                    return (
                      <button
                        key={planCode}
                        type="button"
                        onClick={() => {
                          setNewSelectedMealPlans((prev) =>
                            isChecked ? prev.filter((p) => p !== planCode) : [...prev, planCode]
                          );
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-[12px] transition ${
                          isChecked
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border bg-surface-2 text-text-secondary"
                        }`}
                      >
                        {isChecked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                        <span>{cfg.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Room Amenities Selector Chips */}
              <div>
                <label className="text-[12px] font-semibold text-text-primary block mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Select Room Amenities &amp; Inclusions:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-lg border border-border bg-surface-2/40">
                  {MASTER_ROOM_AMENITIES.map((amName) => {
                    const isChecked = newRoomAmenities.includes(amName);
                    return (
                      <button
                        key={amName}
                        type="button"
                        onClick={() => {
                          setNewRoomAmenities((prev) =>
                            isChecked ? prev.filter((a) => a !== amName) : [...prev, amName]
                          );
                        }}
                        className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition ${
                          isChecked
                            ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                            : "bg-surface border border-border text-text-tertiary hover:text-text-secondary"
                        }`}
                      >
                        {isChecked ? "✓ " : "+ "} {amName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" onClick={() => setShowAddRoomModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRoomType}>Add Room Category</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW PAYMENT GATEWAY */}
      {showAddGatewayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Add New Payment Gateway
              </h3>
              <button
                onClick={() => setShowAddGatewayModal(false)}
                className="text-text-tertiary hover:text-text-primary text-[18px]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelCls}>Select Gateway Provider / Title *</label>
                <select
                  value={newGwProvider}
                  onChange={(e) => setNewGwProvider(e.target.value)}
                  className={inputCls}
                >
                  <option value="Razorpay (Cards, UPI, Netbanking, Wallets)">Razorpay (Cards, UPI, Netbanking, Wallets)</option>
                  <option value="Stripe (International Credit/Debit Cards)">Stripe (International Credit/Debit Cards)</option>
                  <option value="PhonePe PG / Direct QR Code">PhonePe PG / Direct QR Code</option>
                  <option value="Paytm PG / Paytm Wallet">Paytm PG / Paytm Wallet</option>
                  <option value="CCAvenue Multi-Currency Gateway">CCAvenue Multi-Currency Gateway</option>
                  <option value="PayPal Express Checkout">PayPal Express Checkout</option>
                  <option value="Instamojo Payment Gateway">Instamojo Payment Gateway</option>
                  <option value="Bank Transfer / Direct UPI Deposit">Bank Transfer / Direct UPI Deposit</option>
                  <option value="Pay at Hotel (Cash / Card at Check-in)">Pay at Hotel (Cash / Card at Check-in)</option>
                  <option value="Custom Merchant Payment Gateway">Custom Merchant Payment Gateway</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Key ID / Merchant ID / Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. rzp_live_xxxxx or merchant_123"
                  value={newGwKeyId}
                  onChange={(e) => setNewGwKeyId(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Secret Key / Salt / API Token</label>
                <input
                  type="password"
                  placeholder="e.g. secret_key_xxxxx"
                  value={newGwSecret}
                  onChange={(e) => setNewGwSecret(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Deposit % Required</label>
                  <input
                    type="number"
                    value={newGwDepositPct}
                    onChange={(e) => setNewGwDepositPct(e.target.value)}
                    className={inputCls}
                    placeholder="100"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer text-[12px] font-semibold text-text-primary mb-2">
                    <input
                      type="checkbox"
                      checked={newGwSandbox}
                      onChange={(e) => setNewGwSandbox(e.target.checked)}
                      className="h-4 w-4 text-primary rounded"
                    />
                    <span>Sandbox Test Mode</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-[12px] font-semibold text-text-primary">
                  <input
                    type="checkbox"
                    checked={newGwEnabled}
                    onChange={(e) => setNewGwEnabled(e.target.checked)}
                    className="h-4 w-4 text-primary rounded"
                  />
                  <span>Enable &amp; Make Active Immediately</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" onClick={() => setShowAddGatewayModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddGateway}>Save &amp; Enable Gateway</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
