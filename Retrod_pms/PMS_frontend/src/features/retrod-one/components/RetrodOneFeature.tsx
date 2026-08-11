import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Pin,
  Rocket,
  Star,
  BarChart3,
  FileText,
  Globe,
  Hotel,
  Link2,
  Sparkles,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { Button, Card, KpiCard } from "@/components/ui/Primitives";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { hasPermission } from "@/features/auth/lib/rbac";
import type { Permission } from "@/types/rbac";
import { ApplicationCard } from "./ApplicationCard";
import { RetrodOneHeader } from "./RetrodOneHeader";
import { loadPlatformFavorites, toggleFavoritePin } from "../lib/favorites-store";
import { APP_NAV_GROUPS } from "@/app/navigation/nav-config";

// Recursive search helper to find navigation details by node id
function findNavItem(id: string): { label: string; to: string } | null {
  for (const group of APP_NAV_GROUPS) {
    const found = searchNodes(group.nodes, id);
    if (found) return found;
  }
  return null;
}

function searchNodes(nodes: any[], id: string): { label: string; to: string } | null {
  for (const node of nodes) {
    if (node.id === id && node.to) {
      return { label: node.label, to: node.to };
    }
    if (node.children) {
      const found = searchNodes(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

import {
  DEFAULT_FAVORITES,
  PLATFORM_STATS,
  QUICK_ACTIONS,
} from "../lib/platform-data";
import type { PlatformFavorite, PlatformQuickAction } from "@/types/platform";
import { cn } from "@/lib/utils";
import { subscriptionApi } from "@/services/api/subscription";
import { auditApi, type AuditLog } from "@/services/api/audit";
import { tenantApi, type DashboardStats } from "@/services/api/tenant";
import { resolvePlatformApps } from "../lib/access";

function formatRelativeTime(isoString: string): string {
  try {
    const now = new Date();
    const past = new Date(isoString);
    const diffMs = now.getTime() - past.getTime();
    if (isNaN(diffMs) || diffMs < 0) return "Just now";

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHrs < 24) return `${diffHrs} hr ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  } catch {
    return "Just now";
  }
}

function getAuditDisplay(log: AuditLog) {
  let tone = "brand";
  const action = log.action_type?.toUpperCase() || "";
  if (action === "LOGIN" || action === "LOGOUT" || action === "ACCESS") {
    tone = "info";
  } else if (action === "CREATED" || action.includes("CREATE") || action.includes("ADD") || action.includes("CHECKIN")) {
    tone = "success";
  } else if (action === "DELETED" || action.includes("DELETE") || action.includes("REMOVE")) {
    tone = "warning";
  } else if (action === "UPDATED" || action.includes("UPDATE") || action.includes("EDIT")) {
    tone = "brand";
  }

  let title = "";
  if (log.action_type && log.target_entity) {
    const entity = log.target_entity.charAt(0).toUpperCase() + log.target_entity.slice(1).replace(/_/g, " ");
    if (action === "CREATED") {
      title = `${entity} Created`;
    } else if (action === "UPDATED") {
      title = `${entity} Updated`;
    } else if (action === "DELETED") {
      title = `${entity} Deleted`;
    } else {
      const actionWord = log.action_type
        .split("_")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
      title = `${entity} ${actionWord}`;
    }
  } else {
    title = log.action_type || "Activity Logged";
  }

  const formattedRole = log.actor_role_code
    ? log.actor_role_code.replace(/_/g, " ").toUpperCase()
    : "USER";
  const detail = `By ${log.actor_name || "Unknown"} (${formattedRole}) ${
    log.target_id ? `· ID: ${log.target_id.slice(0, 8)}` : ""
  }`;

  return { tone, title, detail };
}

function filterQuickActions(
  actions: PlatformQuickAction[],
  can: (perm: Permission) => boolean,
  role: ReturnType<typeof useAuth>["user"],
  entitlements: any,
): PlatformQuickAction[] {
  const platformApps = resolvePlatformApps(entitlements);

  return actions.filter((action) => {
    // Map action to its respective application key
    let appKey: keyof typeof platformApps = "pms";
    if (action.id === "qa-pos") {
      appKey = "pos";
    } else if (action.id === "qa-lead") {
      appKey = "crm";
    } else if (action.id === "qa-rep") {
      appKey = "reports";
    }

    // Hide quick actions for applications the property hasn't subscribed to
    if (!platformApps[appKey]) return false;

    if (action.id === "qa-pos") {
      return role?.role
        ? ["super_admin", "owner", "general_manager", "accounts"].includes(role.role)
        : false;
    }
    if (!action.anyPermissions?.length) return true;
    return action.anyPermissions.some((perm) => can(perm));
  });
}

const activityTone: Record<string, string> = {
  brand: "bg-primary",
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
};

export function RetrodOneFeature() {
  const { user, entitlements, featureEnabled, can } = useAuth();
  const [favorites, setFavorites] = useState<PlatformFavorite[]>(() => {
    if (typeof window === "undefined") return DEFAULT_FAVORITES;
    const pinnedIds = JSON.parse(localStorage.getItem("retrod.nav.pinned.v1") || "[]");
    if (!Array.isArray(pinnedIds) || pinnedIds.length === 0) return DEFAULT_FAVORITES;
    
    const list: PlatformFavorite[] = [];
    pinnedIds.forEach((id: string) => {
      const found = findNavItem(id);
      if (found) {
        list.push({
          id,
          label: found.label,
          route: found.to,
          appKey: "pms",
        });
      }
    });
    return list;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productFeatures, setProductFeatures] = useState<any[]>([]);
  const [subscribedProducts, setSubscribedProducts] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync favorites when pinned nodes change elsewhere
  useEffect(() => {
    const handlePinnedChange = () => {
      const pinnedIds = JSON.parse(localStorage.getItem("retrod.nav.pinned.v1") || "[]");
      if (!Array.isArray(pinnedIds) || pinnedIds.length === 0) {
        setFavorites(DEFAULT_FAVORITES);
        return;
      }
      const list: PlatformFavorite[] = [];
      pinnedIds.forEach((id: string) => {
        const found = findNavItem(id);
        if (found) {
          list.push({
            id,
            label: found.label,
            route: found.to,
            appKey: "pms",
          });
        }
      });
      setFavorites(list);
    };

    window.addEventListener("retrod.nav.pinned.changed", handlePinnedChange);
    return () => {
      window.removeEventListener("retrod.nav.pinned.changed", handlePinnedChange);
    };
  }, []);

  // Subscription Request States
  const [showSubscribeModal, setShowSubscribeModal] = useState<string | null>(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [reqContactName, setReqContactName] = useState("");
  const [reqContactEmail, setReqContactEmail] = useState("");
  const [reqComments, setReqComments] = useState("");

  // Initialize contact details from user context
  useEffect(() => {
    if (user) {
      setReqContactName(user.name || "");
      setReqContactEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [allProdsRes, tenantProdsRes, logsRes, featuresRes, statsRes] = await Promise.allSettled([
          subscriptionApi.getProducts(),
          subscriptionApi.getTenantProducts(),
          auditApi.getAuditLogs(),
          subscriptionApi.getFeatures(),
          tenantApi.getDashboardStats()
        ]);
        
        if (!active) return;

        if (allProdsRes.status === "fulfilled") {
          setAllProducts(allProdsRes.value || []);
        }

        if (tenantProdsRes.status === "fulfilled") {
          setSubscribedProducts(tenantProdsRes.value || []);
        }
        
        if (logsRes.status === "fulfilled") {
          const val = logsRes.value;
          if (val && typeof val === "object" && "results" in val) {
            setAuditLogs((val as any).results || []);
          } else if (Array.isArray(val)) {
            setAuditLogs(val);
          } else {
            setAuditLogs([]);
          }
        }

        if (featuresRes.status === "fulfilled") {
          setProductFeatures(featuresRes.value || []);
        }

        if (statsRes.status === "fulfilled") {
          setDashboardStats(statsRes.value || null);
        }
      } catch (err) {
        console.error("Error loading platform data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const visibleApps = useMemo(() => {
    const isSuperAdmin = user?.role === "super_admin";
    
    const normalizeProductCode = (rawCode: string): string => {
      const c = (rawCode || "").toLowerCase().trim().replace(/[\s\-_]+/g, "_");
      if (c.includes("booking")) return "booking_engine";
      if (c.includes("channel")) return "channel_manager";
      if (c.includes("pos")) return "pos";
      if (c.includes("crm")) return "crm";
      if (c.includes("analytics")) return "analytics";
      if (c.includes("report")) return "reports";
      if (c.includes("ai")) return "ai_hub";
      if (c.includes("pms")) return "pms";
      return c;
    };

    // Subscribed codes list
    const allowedSubscribedCodes = subscribedProducts
      .filter((p: any) => p.status === "ACTIVE")
      .map((c: any) => normalizeProductCode(c.code || c.product_code || c.product?.code || ""))
      .filter(Boolean);
    
    const PRODUCT_METADATA: Record<string, {
      icon: any;
      route: string;
      openLabel: string;
      accentClass: string;
      defaultFeatures: string[];
    }> = {
      pms: {
        icon: Hotel,
        route: "/",
        openLabel: "Open PMS",
        accentClass: "from-primary/15 to-primary/5 border-primary/20",
        defaultFeatures: ["Reservations", "Front Desk", "Guest Management", "Housekeeping", "Billing", "Reports"],
      },
      pos: {
        icon: UtensilsCrossed,
        route: "/pos",
        openLabel: "Open POS",
        accentClass: "from-warning/15 to-warning/5 border-warning/25",
        defaultFeatures: ["Orders", "Menu Management", "KOT", "Billing", "Inventory"],
      },
      crm: {
        icon: Users,
        route: "/leads",
        openLabel: "Open CRM",
        accentClass: "from-info/15 to-info/5 border-info/25",
        defaultFeatures: ["Leads", "Contacts", "Opportunities", "Campaigns", "Tasks"],
      },
      analytics: {
        icon: BarChart3,
        route: "/analytics/executive",
        openLabel: "Open Analytics",
        accentClass: "from-success/15 to-success/5 border-success/25",
        defaultFeatures: ["Revenue Analytics", "Occupancy Analytics", "Sales Insights", "KPI Dashboard"],
      },
      reports: {
        icon: FileText,
        route: "/reports",
        openLabel: "Open Reports",
        accentClass: "from-primary/10 to-surface-2 border-border",
        defaultFeatures: ["Occupancy Reports", "Revenue Reports", "GST Reports", "Financial Reports"],
      },
      channel_manager: {
        icon: Link2,
        route: "/channel-manager",
        openLabel: "Open Channel Manager",
        accentClass: "from-muted/30 to-surface-2 border-border-subtle",
        defaultFeatures: ["OTA Sync", "Inventory Sync", "Rate Sync", "Mapping"],
      },
      booking_engine: {
        icon: Globe,
        route: "/booking-engine",
        openLabel: "Manage Booking Engine",
        accentClass: "from-success/15 to-success/5 border-success/25",
        defaultFeatures: ["Direct Booking", "Promotions", "Availability", "Rate Management"],
      },
      ai_hub: {
        icon: Sparkles,
        route: "/ai-insights",
        openLabel: "Open AI Hub",
        accentClass: "from-primary/10 to-surface-2 border-primary/15",
        defaultFeatures: ["AI Concierge", "Revenue Manager", "AI Analytics", "Operations Assistant"],
      }
    };

    const appsList = allProducts.map((backendProduct: any) => {
      const rawCode = (backendProduct.code || "").toLowerCase();
      const code = normalizeProductCode(rawCode);
      const meta = PRODUCT_METADATA[code] || {
        icon: Hotel,
        route: "/",
        openLabel: `Open ${backendProduct.name}`,
        accentClass: "from-muted/30 to-surface-2 border-border-subtle",
        defaultFeatures: []
      };

      const isSubscribed = isSuperAdmin || allowedSubscribedCodes.includes(code);
      const backendFeatures = productFeatures.filter((f: any) => f.product === backendProduct.id).map((f: any) => f.name);
      const isBookingEngine = code === "booking_engine";

      return {
        key: code,
        title: isBookingEngine ? "Booking Engine" : backendProduct.name,
        description: backendProduct.description || (isBookingEngine ? "Register hotel booking engines, configure rates, galleries, promotions, and payment gateways." : ""),
        icon: meta.icon,
        route: meta.route,
        openLabel: meta.openLabel,
        accentClass: meta.accentClass,
        features: backendFeatures.length > 0 ? backendFeatures : meta.defaultFeatures,
        status: "active" as const,
        subscribed: isSubscribed,
      };
    });

    // Add superadmin console if user is a superadmin
    if (isSuperAdmin) {
      appsList.push({
        key: "superadmin",
        title: "Superadmin Console",
        description: "Manage tenants, subscriptions, features, and platform-wide settings.",
        icon: Users,
        route: "/superadmin/dashboard",
        openLabel: "Open Console",
        accentClass: "from-primary/20 to-primary/5 border-primary/30",
        features: ["Hospitality Partner", "Subscription Plans", "Platform Settings"],
        status: "active" as const,
        subscribed: true,
      });

      // Inject dedicated Booking Engine management card for super admins
      const hasBookingEngineFromBackend = appsList.some(
        (a: any) => a.key === "booking_engine" || a.key === "bookingEngine",
      );
      if (!hasBookingEngineFromBackend) {
        appsList.push({
          key: "bookingEngine",
          title: "Booking Engine",
          description: "Register hotel booking engines, configure rates, galleries, promotions, and payment gateways. Sync live to guest-facing booking pages.",
          icon: Globe,
          route: "/booking-engine",
          openLabel: "Manage Booking Engine",
          accentClass: "from-success/15 to-success/5 border-success/25",
          features: ["Direct Booking", "Rate Sync", "Photo Galleries", "Promotions", "Payment Gateways"],
          status: "active" as const,
          subscribed: true,
        });
      } else {
        const idx = appsList.findIndex((a: any) => a.key === "booking_engine" || a.key === "bookingEngine");
        if (idx !== -1) {
          appsList[idx] = {
            ...appsList[idx],
            key: "bookingEngine",
            title: "Booking Engine",
            route: "/booking-engine",
            openLabel: "Manage Booking Engine",
            accentClass: "from-success/15 to-success/5 border-success/25",
          };
        }
      }
    }

    return appsList;
  }, [user?.role, allProducts, subscribedProducts, productFeatures]);

  const quickActions = useMemo(
    () => filterQuickActions(QUICK_ACTIONS, can, user, entitlements),
    [can, user, entitlements],
  );

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const handlePin = (item: PlatformFavorite) => {
    const pinnedIds = JSON.parse(localStorage.getItem("retrod.nav.pinned.v1") || "[]");
    let nextIds: string[];
    if (pinnedIds.includes(item.id)) {
      nextIds = pinnedIds.filter((id: string) => id !== item.id);
    } else {
      nextIds = [...pinnedIds, item.id];
    }
    localStorage.setItem("retrod.nav.pinned.v1", JSON.stringify(nextIds));
    
    // Dispatch event to synchronize Sidebar and other active pages
    window.dispatchEvent(new Event("retrod.nav.pinned.changed"));
  };

  const handleSubmitSubscriptionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSubscribeModal) return;
    setSubmittingRequest(true);
    try {
      await tenantApi.requestSubscription({
        product_name: showSubscribeModal,
        contact_name: reqContactName,
        contact_email: reqContactEmail,
        comments: reqComments
      });
      toast.success(`Subscription request for ${showSubscribeModal} sent to admin successfully!`);
      setShowSubscribeModal(null);
      setReqComments("");
    } catch (err: any) {
      toast.error("Failed to send subscription request: " + err.message);
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <RetrodOneHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        {/* Welcome hero */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-e2 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-info/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="label-uppercase text-primary">Retrod One Platform</p>
              <h1 className="mt-2 font-display text-[28px] font-semibold leading-tight text-text-primary sm:text-[34px]">
                Welcome back, {firstName}
              </h1>
              <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-text-secondary sm:text-[15px]">
                Manage your hospitality business from one unified platform.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/">
                  <Button size="sm">
                    <Rocket className="h-3.5 w-3.5" />
                    Launch PMS
                  </Button>
                </Link>
                <Link to={user?.role === "super_admin" ? "/superadmin/settings" : "/settings"}>
                  <Button variant="outline" size="sm">
                    Platform settings
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-3xl">
              <KpiCard
                label="Properties"
                value={dashboardStats?.properties !== undefined ? String(dashboardStats.properties) : String(user && user.properties && user.properties.length > 0 ? user.properties.length : PLATFORM_STATS.properties)}
                accent="brand"
              />
              <KpiCard
                label="Active Users"
                value={dashboardStats?.active_users !== undefined ? String(dashboardStats.active_users) : String(PLATFORM_STATS.activeUsers)}
                accent="info"
              />
              <KpiCard
                label="Occupancy Today"
                value={dashboardStats?.occupancy_today || PLATFORM_STATS.occupancyToday}
                accent="success"
              />
              <KpiCard
                label="Revenue Today"
                value={dashboardStats?.revenue_today || PLATFORM_STATS.revenueToday}
                accent="warning"
              />
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="mt-10" aria-labelledby="apps-heading">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="apps-heading" className="font-display text-[22px] font-semibold text-text-primary">
                Applications
              </h2>
              <p className="mt-1 text-[13px] text-text-secondary">
                Access your hospitality tools and services
              </p>
            </div>
            <p className="text-[12px] text-text-secondary">
              Showing {visibleApps.length} app{visibleApps.length === 1 ? "" : "s"} for your role
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <Card key={n} className="animate-pulse p-6">
                  <div className="h-6 w-1/2 rounded bg-border-subtle"></div>
                  <div className="mt-3 h-4 w-5/6 rounded bg-border-subtle"></div>
                  <div className="mt-2 h-4 w-4/6 rounded bg-border-subtle"></div>
                  <div className="mt-5 h-8 w-1/3 rounded bg-border-subtle"></div>
                </Card>
              ))}
            </div>
          ) : visibleApps.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-[14px] text-text-secondary">
                No applications are enabled for your account. Contact your administrator.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {visibleApps.map((app) => (
                <ApplicationCard
                  key={app.key}
                  app={app}
                  onSubscribeClick={(title) => setShowSubscribeModal(title)}
                  onBookingEngineClick={() => setShowBookingEngineModal(true)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section className="mt-10" aria-labelledby="quick-actions-heading">
          <h2
            id="quick-actions-heading"
            className="font-display text-[20px] font-semibold text-text-primary"
          >
            Quick Actions
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.id}
                  to={action.route}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-3 py-4 text-center shadow-e1 transition hover:border-primary/30 hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-primary transition group-hover:bg-primary-tint">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <span className="text-[12px] font-medium leading-snug text-text-primary">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent activity */}
          <section className="lg:col-span-2" aria-labelledby="activity-heading">
            <Card className="overflow-hidden">
              <div className="border-b border-border-subtle px-5 py-4">
                <h2 id="activity-heading" className="font-display text-[18px] font-semibold text-text-primary">
                  Recent Activity
                </h2>
              </div>
              <ul className="divide-y divide-border-subtle">
                {loading ? (
                  [1, 2, 3, 4, 5].map((n) => (
                    <li key={n} className="flex gap-4 px-5 py-4 animate-pulse">
                      <div className="h-2.5 w-2.5 rounded-full bg-border-subtle mt-1 shrink-0"></div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-1/4 rounded bg-border-subtle"></div>
                        <div className="h-3 w-1/2 rounded bg-border-subtle"></div>
                      </div>
                    </li>
                  ))
                ) : !Array.isArray(auditLogs) || auditLogs.length === 0 ? (
                  <li className="px-5 py-8 text-center text-[13px] text-text-secondary">
                    No recent activity found.
                  </li>
                ) : (
                  auditLogs.slice(0, 5).map((item) => {
                    const { tone, title, detail } = getAuditDisplay(item);
                    return (
                      <li key={item.id} className="flex gap-4 px-5 py-4">
                        <div className="relative mt-1 flex flex-col items-center">
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full",
                              activityTone[tone] ?? "bg-border",
                            )}
                          />
                          <span className="mt-1 h-full w-px bg-border-subtle" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-semibold text-text-primary">{title}</div>
                          <div className="mt-0.5 text-[12px] text-text-secondary">{detail}</div>
                        </div>
                        <time className="shrink-0 text-[11px] text-text-disabled">
                          {formatRelativeTime(item.timestamp)}
                        </time>
                      </li>
                    );
                  })
                )}
              </ul>
            </Card>
          </section>

          {/* Favorites */}
          <section aria-labelledby="favorites-heading">
            <Card className="h-full">
              <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
                <div>
                  <h2 id="favorites-heading" className="font-display text-[18px] font-semibold text-text-primary">
                    Favorites
                  </h2>
                  <p className="text-[11px] text-text-secondary">Pin modules you use most</p>
                </div>
                <Star className="h-4 w-4 text-gold" aria-hidden />
              </div>
              <ul className="space-y-2 p-4">
                {favorites.length === 0 ? (
                  <li className="px-3 py-6 text-center text-[12px] text-text-secondary">
                    No pinned modules. Pin modules from the sidebar or click pin above to access them quickly.
                  </li>
                ) : (
                  favorites.map((item) => {
                    const pinned = true;
                    return (
                      <li
                        key={item.id}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2.5 transition",
                          pinned
                            ? "border-primary/25 bg-primary-tint/20"
                            : "border-border-subtle bg-surface hover:bg-surface-2",
                        )}
                      >
                        <Link
                          to={item.route}
                          className="flex min-w-0 flex-1 items-center gap-2 text-[13px] font-medium text-text-primary"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handlePin(item)}
                          className={cn(
                            "rounded-md p-1.5 transition",
                            pinned
                              ? "bg-primary text-primary-foreground"
                              : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
                          )}
                          aria-label={pinned ? `Unpin ${item.label}` : `Pin ${item.label}`}
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </Card>
          </section>
        </div>
      </main>

      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-e5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Rocket className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-text-primary">Request Access: {showSubscribeModal}</h3>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              Fill in your contact details below to send a subscription request for this hospitality product to your system administrator.
            </p>

            <form onSubmit={handleSubmitSubscriptionRequest} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Contact Name</label>
                <input
                  type="text"
                  required
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  placeholder="Enter contact name"
                  value={reqContactName}
                  onChange={(e) => setReqContactName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Contact Email</label>
                <input
                  type="email"
                  required
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  placeholder="Enter email address"
                  value={reqContactEmail}
                  onChange={(e) => setReqContactEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Additional Comments</label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border border-border bg-surface p-3 text-[13px] text-text-primary focus:border-primary focus:outline-none resize-none"
                  placeholder="Explain why you need access to this application..."
                  value={reqComments}
                  onChange={(e) => setReqComments(e.target.value)}
                />
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setShowSubscribeModal(null)}>Cancel</Button>
                <Button type="submit" disabled={submittingRequest}>
                  {submittingRequest ? "Sending..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
