import {
  BarChart3,
  CalendarPlus,
  FileText,
  KeyRound,
  Receipt,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import type { PlatformActivity, PlatformFavorite, PlatformQuickAction } from "@/types/platform";

export const PLATFORM_STATS = {
  properties: 5,
  activeUsers: 125,
  occupancyToday: "78%",
  revenueToday: "₹2.5L",
} as const;

export const DEFAULT_FAVORITES: PlatformFavorite[] = [
  { id: "fav-res", label: "Reservations", route: "/reservations", appKey: "pms" },
  { id: "fav-bill", label: "Billing", route: "/billing", appKey: "pms" },
  { id: "fav-rep", label: "Reports", route: "/reports", appKey: "reports" },
  { id: "fav-crm", label: "CRM Leads", route: "/leads", appKey: "crm" },
];

export const QUICK_ACTIONS: PlatformQuickAction[] = [
  {
    id: "qa-res",
    label: "Create Reservation",
    route: "/reservations/new",
    icon: CalendarPlus,
    anyPermissions: ["reservations.create"],
  },
  {
    id: "qa-ci",
    label: "Check-In Guest",
    route: "/check-in",
    icon: KeyRound,
    anyPermissions: ["frontdesk.checkin"],
  },
  {
    id: "qa-inv",
    label: "Create Invoice",
    route: "/billing",
    icon: Receipt,
    anyPermissions: ["billing.post", "billing.view"],
  },
  {
    id: "qa-pos",
    label: "Add POS Order",
    route: "/pos",
    icon: ShoppingBag,
    anyPermissions: [],
  },
  {
    id: "qa-lead",
    label: "Create Lead",
    route: "/leads",
    icon: UserPlus,
    anyPermissions: ["dashboard.view"],
  },
  {
    id: "qa-rep",
    label: "View Reports",
    route: "/reports",
    icon: BarChart3,
    anyPermissions: ["reports.view"],
  },
];

export const RECENT_ACTIVITY: PlatformActivity[] = [
  {
    id: "act-1",
    title: "Reservation Created",
    detail: "RES-2094 · Heritage Suite · Priya Sharma",
    timestamp: "12 min ago",
    tone: "brand",
  },
  {
    id: "act-2",
    title: "Guest Checked-In",
    detail: "Room 401 · John Mathews · Walk-in",
    timestamp: "28 min ago",
    tone: "success",
  },
  {
    id: "act-3",
    title: "Invoice Generated",
    detail: "INV-8842 · ₹51,920 · GST applied",
    timestamp: "1 hr ago",
    tone: "info",
  },
  {
    id: "act-4",
    title: "Lead Created",
    detail: "Blue Lotus Events · Website inquiry",
    timestamp: "2 hr ago",
    tone: "warning",
  },
  {
    id: "act-5",
    title: "POS Order Completed",
    detail: "Table 12 · ₹4,860 · Room charge to 312",
    timestamp: "3 hr ago",
    tone: "success",
  },
];
