import { hasPermission } from "@/features/auth/lib/rbac";
import type { TenantEntitlements } from "@/types/auth";
import type { FeatureKey } from "@/types/entitlements";
import { DEFAULT_PLATFORM_APPS } from "@/types/entitlements";
import type { PlatformAppDefinition, PlatformAppKey, PlatformApps, PlatformAppStatus } from "@/types/platform";
import type { Role } from "@/types/rbac";
import {
  BarChart3,
  FileText,
  Globe,
  Hotel,
  Link2,
  Sparkles,
  Users,
  UtensilsCrossed,
} from "lucide-react";

export const PLATFORM_APPLICATIONS: PlatformAppDefinition[] = [
  {
    key: "pms",
    title: "Property Management System",
    description: "Manage reservations, front desk operations, housekeeping, billing, payments, and guest experiences.",
    icon: Hotel,
    features: ["Reservations", "Front Desk", "Guest Management", "Housekeeping", "Billing", "Reports"],
    route: "/",
    openLabel: "Open PMS",
    status: "active",
    accentClass: "from-primary/15 to-primary/5 border-primary/20",
    anyPermissions: ["dashboard.view"],
  },
  {
    key: "pos",
    title: "Point of Sale",
    description: "Manage restaurant operations, orders, kitchen workflows, billing, and inventory.",
    icon: UtensilsCrossed,
    features: ["Orders", "Menu Management", "KOT", "Billing", "Inventory"],
    route: "/pos",
    openLabel: "Open POS",
    status: "active",
    accentClass: "from-warning/15 to-warning/5 border-warning/25",
    roles: ["super_admin", "owner", "general_manager", "accounts"],
  },
  {
    key: "crm",
    title: "Customer Relationship Management",
    description: "Manage leads, customers, campaigns, and sales activities.",
    icon: Users,
    features: ["Leads", "Contacts", "Opportunities", "Campaigns", "Tasks"],
    route: "/leads",
    openLabel: "Open CRM",
    status: "active",
    accentClass: "from-info/15 to-info/5 border-info/25",
    roles: ["super_admin", "owner", "general_manager", "front_office_manager", "revenue_manager"],
  },
  {
    key: "analytics",
    title: "Analytics & Insights",
    description: "View business performance, KPIs, revenue, occupancy, and customer analytics.",
    icon: BarChart3,
    features: ["Revenue Analytics", "Occupancy Analytics", "Sales Insights", "KPI Dashboard"],
    route: "/analytics/executive",
    openLabel: "Open Analytics",
    status: "active",
    accentClass: "from-success/15 to-success/5 border-success/25",
    anyPermissions: ["analytics.executive", "reports.view", "ai.view"],
  },
  {
    key: "reports",
    title: "Reports Center",
    description: "Access operational, financial, tax, and custom reports.",
    icon: FileText,
    features: ["Occupancy Reports", "Revenue Reports", "GST Reports", "Financial Reports"],
    route: "/reports",
    openLabel: "Open Reports",
    status: "active",
    accentClass: "from-primary/10 to-surface-2 border-border",
    anyPermissions: ["reports.view"],
  },
  {
    key: "channelManager",
    title: "Channel Manager",
    description: "Synchronize inventory, rates, and reservations across OTA channels.",
    icon: Link2,
    features: ["OTA Sync", "Inventory Sync", "Rate Sync", "Mapping"],
    route: "/channel-manager",
    openLabel: "Open Channel Manager",
    status: "coming_soon",
    accentClass: "from-muted/30 to-surface-2 border-border-subtle",
    anyPermissions: ["ota.manage"],
    feature: "channelManager",
  },
  {
    key: "bookingEngine",
    title: "Booking Engine",
    description: "Configure hotel direct bookings — rates, media, promotions, and payment gateways.",
    icon: Globe,
    features: ["Direct Booking", "Rate Sync", "Photo Galleries", "Promotions", "Payment Gateways"],
    route: "/booking-engine",
    openLabel: "Manage Booking Engine",
    status: "active",
    accentClass: "from-success/15 to-success/5 border-success/25",
    anyPermissions: ["dashboard.view"],
  },
  {
    key: "aiHub",
    title: "AI Hub",
    description: "AI-powered assistants and automation tools for hotel operations.",
    icon: Sparkles,
    features: ["AI Concierge", "Revenue Manager", "AI Analytics", "Operations Assistant"],
    route: "/ai-insights",
    openLabel: "Open AI Hub",
    status: "coming_soon",
    accentClass: "from-primary/10 to-surface-2 border-primary/15",
    anyPermissions: ["ai.view", "revenue.aiDashboard"],
    feature: "revenueAi",
  },
  {
    key: "superadmin",
    title: "Superadmin Console",
    description: "Manage tenants, subscriptions, features, and platform-wide settings.",
    icon: Users,
    features: ["Hospitality Partner", "Subscription Plans", "Platform Settings"],
    route: "/superadmin/dashboard",
    openLabel: "Open Console",
    status: "active",
    accentClass: "from-primary/20 to-primary/5 border-primary/30",
    roles: ["super_admin"],
  },
];

const ACTIVE_ACCENTS: Partial<Record<PlatformAppKey, string>> = {
  channelManager: "from-info/15 to-info/5 border-info/25",
  bookingEngine: "from-success/15 to-success/5 border-success/25",
  aiHub: "from-primary/15 to-primary/5 border-primary/20",
};

const COMING_SOON_ACCENT = "from-muted/30 to-surface-2 border-border-subtle";

export function resolvePlatformApps(entitlements: TenantEntitlements): PlatformApps {
  return {
    ...DEFAULT_PLATFORM_APPS,
    ...entitlements.platformApps,
  };
}

export function resolveAppStatus(
  app: PlatformAppDefinition,
  featureEnabled: (feature: FeatureKey) => boolean,
): PlatformAppStatus {
  if (app.feature) {
    return featureEnabled(app.feature) ? "active" : "coming_soon";
  }
  return app.status;
}

export function resolveAppForDisplay(
  app: PlatformAppDefinition,
  featureEnabled: (feature: FeatureKey) => boolean,
): PlatformAppDefinition {
  const status = resolveAppStatus(app, featureEnabled);
  const accentClass =
    status === "active"
      ? (ACTIVE_ACCENTS[app.key] ?? app.accentClass)
      : COMING_SOON_ACCENT;

  return { ...app, status, accentClass };
}

export function canAccessPlatformApp(
  role: Role | undefined,
  platformApps: PlatformApps,
  app: PlatformAppDefinition,
): boolean {
  if (!role) return false;
  if (!platformApps[app.key]) return false;
  if (app.roles?.length && !app.roles.includes(role)) return false;
  if (app.anyPermissions?.length) {
    return app.anyPermissions.some((perm) => hasPermission(role, perm));
  }
  return true;
}

export function getVisiblePlatformApps(
  role: Role | undefined,
  entitlements: TenantEntitlements,
  featureEnabled: (feature: FeatureKey) => boolean,
): PlatformAppDefinition[] {
  const platformApps = resolvePlatformApps(entitlements);
  return PLATFORM_APPLICATIONS.filter((app) => canAccessPlatformApp(role, platformApps, app)).map(
    (app) => resolveAppForDisplay(app, featureEnabled),
  );
}

export function getPlatformApp(key: PlatformAppKey): PlatformAppDefinition | undefined {
  return PLATFORM_APPLICATIONS.find((app) => app.key === key);
}

export function isPosPath(pathname: string): boolean {
  return pathname === "/pos" || pathname.startsWith("/pos/");
}
