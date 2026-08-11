import { LaundryOrder, LinenItem, UniformItem, Machine } from "../types";

export const MOCK_ORDERS: LaundryOrder[] = [
  {
    id: "LND-1001",
    guestName: "Alice Smith",
    roomNumber: "402",
    reservationId: "RES-8921",
    status: "Ready for Delivery",
    items: [
      {
        id: "ITEM-1",
        category: "Shirts",
        quantity: 2,
        serviceType: "Wash & Fold",
        price: 15,
      },
      {
        id: "ITEM-2",
        category: "Jeans",
        quantity: 1,
        serviceType: "Dry Cleaning",
        price: 25,
      },
    ],
    totalAmount: 55,
    pickupTime: "2026-06-30T09:00:00Z",
    expectedDelivery: "2026-06-30T18:00:00Z",
    isExpress: false,
    createdAt: "2026-06-30T08:30:00Z",
    updatedAt: "2026-06-30T14:20:00Z",
  },
  {
    id: "LND-1002",
    guestName: "Bob Johnson",
    roomNumber: "215",
    reservationId: "RES-8922",
    status: "Washing",
    items: [
      {
        id: "ITEM-3",
        category: "Suits",
        quantity: 1,
        serviceType: "Dry Cleaning",
        price: 50,
      },
    ],
    totalAmount: 50,
    pickupTime: "2026-06-30T10:15:00Z",
    expectedDelivery: "2026-07-01T10:00:00Z",
    isExpress: false,
    createdAt: "2026-06-30T10:00:00Z",
    updatedAt: "2026-06-30T11:45:00Z",
  },
  {
    id: "LND-1003",
    guestName: "Charlie Brown",
    roomNumber: "510",
    reservationId: "RES-8923",
    status: "Pickup Requested",
    items: [
      {
        id: "ITEM-4",
        category: "T-Shirts",
        quantity: 3,
        serviceType: "Express Laundry",
        price: 45,
      },
    ],
    totalAmount: 45,
    isExpress: true,
    createdAt: "2026-06-30T12:00:00Z",
    updatedAt: "2026-06-30T12:00:00Z",
  },
];

export const MOCK_LINEN: LinenItem[] = [
  { id: "LIN-1", type: "King Bedsheet", location: "Housekeeping", totalStock: 500, inUse: 300, inWash: 150, damaged: 10 },
  { id: "LIN-2", type: "Bath Towel", location: "Pool", totalStock: 800, inUse: 400, inWash: 350, damaged: 25 },
  { id: "LIN-3", type: "Pillow Cover", location: "Housekeeping", totalStock: 1000, inUse: 600, inWash: 300, damaged: 5 },
];

export const MOCK_UNIFORMS: UniformItem[] = [
  { id: "UNI-1", employeeName: "David Lee", department: "Front Desk", uniformType: "Blazer Set", status: "Clean" },
  { id: "UNI-2", employeeName: "Sarah Connor", department: "F&B", uniformType: "Apron & Shirt", status: "In Wash" },
];

export const MOCK_MACHINES: Machine[] = [
  { id: "MAC-1", name: "Washer A1", type: "Washer", capacity: "50kg", status: "Operating", currentLoad: 80 },
  { id: "MAC-2", name: "Washer A2", type: "Washer", capacity: "50kg", status: "Idle" },
  { id: "MAC-3", name: "Dryer D1", type: "Dryer", capacity: "30kg", status: "Operating", currentLoad: 50 },
  { id: "MAC-4", name: "Iron Press 1", type: "Iron", capacity: "N/A", status: "Maintenance" },
];
