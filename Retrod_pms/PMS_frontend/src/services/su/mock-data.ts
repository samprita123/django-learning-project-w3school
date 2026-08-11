import type {
  SuAnalyticsMetrics,
  SuAvailabilityCell,
  SuChannel,
  SuChannelRevenue,
  SuConnection,
  SuDashboardMetrics,
  SuImageAsset,
  SuInventoryRow,
  SuPropertyChannelSummary,
  SuPropertyContent,
  SuRateCell,
  SuRatePlanMapping,
  SuReservationSync,
  SuRestriction,
  SuRoomContent,
  SuRoomMapping,
  SuSyncLog,
} from "@/types/channel-manager";
import { SU_CHANNELS } from "@/types/channel-manager";

const ch = SU_CHANNELS;

function channelRecord<T>(fn: (c: SuChannel, idx: number) => T): Record<SuChannel, T> {
  return Object.fromEntries(ch.map((c, idx) => [c, fn(c, idx)])) as Record<SuChannel, T>;
}

export const suDashboardMetrics: SuDashboardMetrics = {
  channelsLive: 7,
  channelsTotal: 8,
  syncHealthPct: 94,
  bookingsMtd: 428,
  revenueMtd: 5280000,
  pendingSyncs: 3,
  parityAlerts: 2,
  failedJobs24h: 1,
};

export const suConnections: SuConnection[] = ch.map((channel, i) => ({
  channel,
  status: channel === "HotelBeds" ? "Error" : channel === "Airbnb" ? "Disconnected" : "Connected",
  propertyId: `SU-PROP-1001`,
  lastSync: [
    "15 May 11:42",
    "15 May 11:38",
    "15 May 11:15",
    "14 May 22:00",
    "15 May 10:55",
    "15 May 09:30",
    "15 May 08:12",
    "15 May 07:45",
  ][i],
  commission: ["15%", "16%", "18%", "13%", "14%", "12%", "17%", "15%"][i],
  bookingsMtd: [142, 34, 58, 22, 48, 36, 28, 60][i],
  revenueMtd: [1820000, 410000, 720000, 280000, 640000, 380000, 420000, 610000][i],
  parity: channel === "Agoda" ? "Drift" : "Aligned",
  parityDelta: channel === "Agoda" ? "-3%" : undefined,
}));

export const suRoomMappings: SuRoomMapping[] = [
  {
    pmsRoomType: "Deluxe King",
    pmsRoomCode: "DLX-K",
    channels: channelRecord((c) => ({
      otaRoomId: `${c.slice(0, 3).toUpperCase()}-DLXK`,
      otaRoomName: c === "Booking.com" ? "Deluxe King Room" : "Deluxe King",
      status: c === "HotelBeds" ? "Unmapped" : c === "Agoda" ? "Mismatch" : "Mapped",
    })),
  },
  {
    pmsRoomType: "Premier Suite",
    pmsRoomCode: "PRM-S",
    channels: channelRecord((c) => ({
      otaRoomId: `${c.slice(0, 3).toUpperCase()}-PRMS`,
      otaRoomName: "Premier Suite",
      status: c === "Expedia" ? "Mismatch" : "Mapped",
    })),
  },
  {
    pmsRoomType: "Heritage Suite",
    pmsRoomCode: "HTG-S",
    channels: channelRecord((c) => ({
      otaRoomId: `${c.slice(0, 3).toUpperCase()}-HTGS`,
      otaRoomName: "Heritage Suite",
      status: c === "Booking.com" ? "Unmapped" : "Mapped",
    })),
  },
];

export const suRatePlanMappings: SuRatePlanMapping[] = [
  {
    pmsRatePlan: "BAR Flexible",
    pmsRatePlanCode: "BAR-FLEX",
    mealPlan: "Room only",
    channels: channelRecord((c) => ({
      otaRatePlanId: `${c.slice(0, 2)}-BAR`,
      status: "Mapped" as const,
    })),
  },
  {
    pmsRatePlan: "Corporate Neg",
    pmsRatePlanCode: "CORP-NEG",
    mealPlan: "Breakfast incl.",
    channels: channelRecord((c) => ({
      otaRatePlanId: c === "MakeMyTrip" || c === "Goibibo" ? "CORP-IN" : `${c.slice(0, 2)}-CORP`,
      status: c === "Airbnb" ? "Unmapped" : "Mapped",
    })),
  },
  {
    pmsRatePlan: "Non-refundable",
    pmsRatePlanCode: "NRF-STD",
    mealPlan: "Room only",
    channels: channelRecord((c) => ({
      otaRatePlanId: `${c.slice(0, 2)}-NRF`,
      status: c === "Trip.com" ? "Pending" : "Mapped",
    })),
  },
  {
    pmsRatePlan: "Summer Seasonal Promo",
    pmsRatePlanCode: "SUMMER-26",
    mealPlan: "Half board",
    channels: channelRecord((c) => ({
      otaRatePlanId: `${c.slice(0, 2)}-SUM`,
      status: c === "HotelBeds" ? "Pending" : "Mapped",
    })),
  },
];

export const suInventory: SuInventoryRow[] = [
  {
    roomType: "Deluxe King",
    total: 36,
    channels: channelRecord((_, idx) => {
      const allocated = [32, 30, 28, 20, 34, 33, 25, 30][idx];
      const sold = [28, 22, 24, 14, 26, 24, 18, 22][idx];
      return { allocated, sold, available: allocated - sold };
    }),
  },
  {
    roomType: "Premier Suite",
    total: 24,
    channels: channelRecord((_, idx) => {
      const allocated = [20, 18, 18, 12, 22, 20, 16, 18][idx];
      const sold = [16, 12, 14, 8, 15, 14, 10, 12][idx];
      return { allocated, sold, available: allocated - sold };
    }),
  },
];

export const suAvailability: SuAvailabilityCell[] = (() => {
  const types = ["Deluxe King", "Premier Suite"];
  const cells: SuAvailabilityCell[] = [];
  for (let d = 15; d <= 24; d++) {
    for (const roomType of types) {
      cells.push({
        date: d,
        roomType,
        total: roomType === "Deluxe King" ? 36 : 24,
        available: Math.max(
          2,
          Math.round((roomType === "Deluxe King" ? 36 : 24) * (0.2 + (d % 5) / 10)),
        ),
        stopSell: d === 21 && roomType === "Premier Suite",
      });
    }
  }
  return cells;
})();

export const suRates: SuRateCell[] = (() => {
  const base = { "Deluxe King": 12000, "Premier Suite": 22000 };
  const cells: SuRateCell[] = [];
  for (let d = 15; d <= 24; d++) {
    for (const roomType of Object.keys(base)) {
      const wknd = d % 7 === 6 || d % 7 === 0;
      cells.push({
        date: d,
        roomType,
        ratePlan: "BAR Flexible",
        amount: Math.round(base[roomType as keyof typeof base] * (wknd ? 1.18 : 1)),
      });
    }
  }
  return cells;
})();

export const suReservationSync: SuReservationSync[] = [
  {
    id: "RS-9001",
    channel: "Booking.com",
    otaRef: "BK-8829102",
    pmsRef: "RES-2041",
    guest: "John Mathews",
    status: "Synced",
    checkIn: "15 May",
    amount: 36000,
    syncedAt: "15 May 08:12",
  },
  {
    id: "RS-9002",
    channel: "Expedia",
    otaRef: "EXP-4410293",
    pmsRef: "RES-2043",
    guest: "Hiroshi Tanaka",
    status: "Synced",
    checkIn: "15 May",
    amount: 72000,
    syncedAt: "15 May 07:55",
  },
  {
    id: "RS-9003",
    channel: "Agoda",
    otaRef: "AGO-992817",
    pmsRef: "—",
    guest: "Pending import",
    status: "Conflict",
    checkIn: "16 May",
    amount: 22000,
    syncedAt: "15 May 11:20",
    error: "Room type mismatch · Premier Suite",
  },
  {
    id: "RS-9004",
    channel: "MakeMyTrip",
    otaRef: "MMT-77201",
    pmsRef: "RES-2050",
    guest: "Anita Desai",
    status: "Pending",
    checkIn: "17 May",
    amount: 14400,
    syncedAt: "—",
  },
  {
    id: "RS-9005",
    channel: "HotelBeds",
    otaRef: "HB-33102",
    pmsRef: "—",
    guest: "Import failed",
    status: "Failed",
    checkIn: "18 May",
    amount: 35000,
    syncedAt: "15 May 06:00",
    error: "Connection timeout · SU API",
  },
];

export const suSyncLogs: SuSyncLog[] = [
  {
    id: "SYNC-1001",
    channel: "Booking.com",
    type: "Rates",
    action: "Push rates · 14 days",
    status: "Success",
    records: 280,
    at: "15 May 11:42",
  },
  {
    id: "SYNC-1002",
    channel: "Agoda",
    type: "Inventory",
    action: "Pull availability",
    status: "Warning",
    records: 120,
    at: "15 May 11:38",
    message: "2 cells parity drift",
  },
  {
    id: "SYNC-1003",
    channel: "Expedia",
    type: "Restrictions",
    action: "Sync CTA/CTD",
    status: "Success",
    records: 45,
    at: "15 May 11:15",
  },
  {
    id: "SYNC-1004",
    channel: "Airbnb",
    type: "Content",
    action: "Property description",
    status: "Error",
    records: 0,
    at: "15 May 10:55",
    message: "Channel disconnected",
  },
  {
    id: "SYNC-1005",
    channel: "MakeMyTrip",
    type: "Reservations",
    action: "Pull new bookings",
    status: "Success",
    records: 6,
    at: "15 May 10:30",
  },
  {
    id: "SYNC-1006",
    channel: "Goibibo",
    type: "Images",
    action: "Push room gallery",
    status: "In Progress",
    records: 18,
    at: "15 May 10:15",
  },
  {
    id: "SYNC-1007",
    channel: "HotelBeds",
    type: "Inventory",
    action: "Full inventory sync",
    status: "Error",
    records: 0,
    at: "15 May 09:00",
    message: "Auth token expired",
  },
  {
    id: "SYNC-1008",
    channel: "Trip.com",
    type: "Rates",
    action: "Rate plan mapping update",
    status: "Success",
    records: 84,
    at: "15 May 08:45",
  },
];

export const suChannelRevenue: SuChannelRevenue[] = suConnections.map((c) => ({
  channel: c.channel,
  bookings: c.bookingsMtd,
  revenue: c.revenueMtd,
  adr: Math.round(c.revenueMtd / Math.max(1, c.bookingsMtd)),
  commission: Math.round((c.revenueMtd * parseFloat(c.commission)) / 100),
  netRevenue: Math.round(c.revenueMtd * (1 - parseFloat(c.commission) / 100)),
  share: Math.round((c.revenueMtd / 5280000) * 1000) / 10,
}));

export const suPropertyContent: SuPropertyContent[] = [
  {
    field: "Property name",
    pmsValue: "The Grand Palace",
    channels: {
      "Booking.com": { value: "The Grand Palace New Delhi", status: "Synced" },
      Agoda: { value: "Grand Palace Hotel", status: "Synced" },
    },
  },
  {
    field: "Description",
    pmsValue: "Luxury 5-star heritage hotel...",
    channels: {
      Expedia: { value: "Luxury 5-star...", status: "Synced" },
      Airbnb: { value: "—", status: "Error" },
    },
  },
  {
    field: "Check-in time",
    pmsValue: "14:00",
    channels: channelRecord(() => ({ value: "14:00", status: "Synced" as const })),
  },
  {
    field: "Policies",
    pmsValue: "Standard cancellation",
    channels: { "Trip.com": { value: "Flexible · 24h", status: "Synced" } },
  },
];

export const suRoomContent: SuRoomContent[] = [
  {
    roomType: "Deluxe King",
    amenities: ["King bed", "City view", "Rain shower"],
    bedType: "King",
    maxOccupancy: 2,
    syncStatus: "Synced",
  },
  {
    roomType: "Premier Suite",
    amenities: ["Separate living", "Butler", "Jacuzzi"],
    bedType: "King",
    maxOccupancy: 3,
    syncStatus: "Synced",
  },
  {
    roomType: "Heritage Suite",
    amenities: ["Heritage décor", "Dining area", "Private terrace"],
    bedType: "King",
    maxOccupancy: 4,
    syncStatus: "Warning",
  },
];

export const suImages: SuImageAsset[] = [
  {
    id: "IMG-1",
    roomType: "Deluxe King",
    label: "Main room",
    url: "/assets/rooms/dlx-king.jpg",
    primary: true,
    channels: { "Booking.com": "Synced", Agoda: "Synced", Expedia: "Synced" },
  },
  {
    id: "IMG-2",
    roomType: "Deluxe King",
    label: "Bathroom",
    url: "/assets/rooms/dlx-bath.jpg",
    primary: false,
    channels: { "Booking.com": "Synced", MakeMyTrip: "Pending" },
  },
  {
    id: "IMG-3",
    roomType: "Premier Suite",
    label: "Living area",
    url: "/assets/rooms/prm-living.jpg",
    primary: true,
    channels: channelRecord(() => "Synced" as const),
  },
  {
    id: "IMG-4",
    roomType: "Heritage Suite",
    label: "Terrace",
    url: "/assets/rooms/htg-terrace.jpg",
    primary: true,
    channels: { Airbnb: "Error", Goibibo: "Pending" },
  },
];

export const suRestrictions: SuRestriction[] = [
  {
    id: "RST-1",
    date: 16,
    roomType: "Heritage Suite",
    channel: "All",
    kind: "Min Stay",
    value: "2N",
  },
  { id: "RST-2", date: 18, roomType: "All", channel: "Booking.com", kind: "CTA" },
  { id: "RST-3", date: 21, roomType: "Premier Suite", channel: "All", kind: "Stop Sell" },
  { id: "RST-4", date: 22, roomType: "Deluxe King", channel: "Expedia", kind: "CTD" },
  {
    id: "RST-5",
    date: 24,
    roomType: "Deluxe King",
    channel: "Agoda",
    kind: "Min Stay",
    value: "3N",
  },
];

export const suMultiProperty: SuPropertyChannelSummary[] = [
  {
    propertyId: "PROP-1",
    propertyName: "The Grand Palace",
    city: "New Delhi",
    channelsLive: 7,
    syncHealth: 94,
    bookingsMtd: 428,
    revenueMtd: 5280000,
    errors: 1,
  },
  {
    propertyId: "PROP-2",
    propertyName: "Retrod Marina",
    city: "Goa",
    channelsLive: 8,
    syncHealth: 98,
    bookingsMtd: 312,
    revenueMtd: 3840000,
    errors: 0,
  },
  {
    propertyId: "PROP-3",
    propertyName: "Himalayan Retreat",
    city: "Shimla",
    channelsLive: 6,
    syncHealth: 88,
    bookingsMtd: 186,
    revenueMtd: 1920000,
    errors: 2,
  },
  {
    propertyId: "PROP-4",
    propertyName: "City Lights",
    city: "Mumbai",
    channelsLive: 8,
    syncHealth: 96,
    bookingsMtd: 264,
    revenueMtd: 3160000,
    errors: 0,
  },
];

export const suAnalytics: SuAnalyticsMetrics[] = ch.map((channel, i) => ({
  channel,
  impressions: [42000, 18000, 28000, 12000, 35000, 22000, 15000, 26000][i],
  conversion: [3.4, 1.9, 2.1, 1.8, 1.4, 1.6, 1.9, 2.3][i],
  bookings: suConnections[i].bookingsMtd,
  revenue: suConnections[i].revenueMtd,
  cancellationRate: [8.2, 12.1, 9.4, 14.5, 6.8, 7.2, 10.1, 8.9][i],
  avgLeadTime: [12, 18, 14, 21, 8, 9, 16, 11][i],
}));
