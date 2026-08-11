export type LaundryStatus =
  | "Pickup Requested"
  | "Picked Up"
  | "Received at Laundry"
  | "Washing"
  | "Ironing"
  | "Ready for Delivery"
  | "Delivered to Room"
  | "Completed";

export type LaundryServiceType =
  | "Wash & Fold"
  | "Dry Cleaning"
  | "Steam Press"
  | "Iron Only"
  | "Stain Removal"
  | "Express Laundry";

export type LaundryItemCategory =
  | "Shirts"
  | "T-Shirts"
  | "Trousers"
  | "Jeans"
  | "Sarees"
  | "Suits"
  | "Towels"
  | "Bedsheets"
  | "Others";

export interface LaundryItem {
  id: string;
  category: LaundryItemCategory;
  quantity: number;
  serviceType: LaundryServiceType;
  color?: string;
  fabricType?: string;
  conditionBefore?: string;
  remarks?: string;
  price: number;
}

export interface LaundryOrder {
  id: string;
  guestName: string;
  roomNumber: string;
  reservationId: string;
  status: LaundryStatus;
  items: LaundryItem[];
  totalAmount: number;
  pickupTime?: string;
  expectedDelivery?: string;
  isExpress: boolean;
  assignedStaff?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinenItem {
  id: string;
  type: string;
  location: string;
  totalStock: number;
  inUse: number;
  inWash: number;
  damaged: number;
}

export interface UniformItem {
  id: string;
  employeeName: string;
  department: string;
  uniformType: string;
  status: "Clean" | "In Wash" | "Repair";
}

export interface Machine {
  id: string;
  name: string;
  type: "Washer" | "Dryer" | "Iron";
  capacity: string;
  status: "Operating" | "Idle" | "Maintenance";
  currentLoad?: number;
}
