export type EngineStatus = "active" | "draft" | "maintenance" | "suspended";
export type SyncStatus = "synced" | "pending" | "syncing" | "error";

export interface HotelSocials {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  twitter?: string;
  website?: string;
}

export interface HotelLocationInfo {
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  googleMapsEmbedUrl?: string;
  phone: string;
  email: string;
  socials: HotelSocials;
}

export interface RoomGalleryItem {
  id: string;
  roomTypeId: string;
  roomTypeName: string;
  photos: string[];
  coverPhoto: string;
}

export interface RoomRateConfig {
  roomTypeId: string;
  roomTypeName: string;
  basePricePerNight: number;
  extraAdultPrice?: number;
  extraChildPrice?: number;
  taxPercentage: number;
  isSynced: boolean;
  lastSyncedAt?: string;
}

export interface PromoCodeConfig {
  id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  validFrom: string;
  validTo: string;
  minNights?: number;
  isActive: boolean;
}

export interface HotelPolicies {
  checkInTime: string;
  checkOutTime: string;
  cancellationType: "free" | "flexible" | "non_refundable";
  cancellationNoticeDays: number;
  cancellationPolicyText: string;
  childPolicyText?: string;
  houseRulesText?: string;
}

export interface PaymentGatewayConfig {
  provider: "razorpay" | "stripe" | "phonepe" | "pay_at_hotel";
  isEnabled: boolean;
  keyId?: string;
  keySecret?: string;
  isSandbox: boolean;
  payAtHotelAllowed: boolean;
  depositPercentage: number;
}

export interface HotelBookingEngine {
  id: string;
  propertyId: string;
  propertyName: string;
  slug: string;
  customDomain?: string;
  status: EngineStatus;
  syncStatus: SyncStatus;
  lastSyncedAt: string;
  apiKey: string;
  heroSlideshow: string[];
  location: HotelLocationInfo;
  roomGalleries: RoomGalleryItem[];
  roomRates: RoomRateConfig[];
  promos: PromoCodeConfig[];
  policies: HotelPolicies;
  paymentGateways: PaymentGatewayConfig[];
  totalDirectBookings: number;
  totalDirectRevenue: number;
  createdAt: string;
}
