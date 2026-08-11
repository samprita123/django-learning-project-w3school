import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  Navigate,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AppShell } from "@/app/layouts/AppShell";
import { PosShell } from "@/app/layouts/PosShell";
import { SuperadminShell } from "@/app/layouts/SuperadminShell";
import { isPosPath, resolvePlatformApps } from "@/features/retrod-one/lib/access";
import { AuthProvider } from "@/features/auth/providers/AuthProvider";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import { applyTheme, readSavedTheme } from "@/app/theme/theme";
import FeatureDisabled from "@/components/FeatureDisabled";
import AccessDenied from "@/components/AccessDenied";
import type { FeatureKey } from "@/types/entitlements";
import { toast } from "sonner";

// Suppress unauthorized/credential error toasts after logout or when not authenticated
if (typeof window !== "undefined") {
  const originalError = toast.error;
  toast.error = (message, data) => {
    const hasAccessToken = !!localStorage.getItem("retrod.auth.access_token");
    if (!hasAccessToken) {
      const msgStr = String(message).toLowerCase();
      if (
        msgStr.includes("credential") ||
        msgStr.includes("unauthorized") ||
        msgStr.includes("auth") ||
        msgStr.includes("401") ||
        msgStr.includes("not provided")
      ) {
        console.warn("Suppressed post-logout/unauthenticated error toast:", message);
        return "";
      }
    }
    return originalError(message, data);
  };
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-semibold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-pressed"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-pressed"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Retrod PMS — Hospitality Operating System" },
      {
        name: "description",
        content:
          "Enterprise-grade Property Management System for luxury hotels and hospitality groups.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function AuthGate() {
  const { isAuthenticated, featureEnabled, user, entitlements } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Standalone check: All routes except "/login" require authentication
  if (pathname !== "/login" && !isAuthenticated) {
    const hasAccessToken = typeof window !== "undefined" && !!localStorage.getItem("retrod.auth.access_token");
    if (hasAccessToken) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-background text-text-secondary">
          <div className="flex flex-col items-center gap-2.5">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-[12px] font-medium tracking-wide">Hydrating session context...</span>
          </div>
        </div>
      );
    }
    return <Navigate to="/login" />;
  }

  // Standalone routes render without any sidebar/header shells
  if (pathname === "/login" || pathname === "/one") return <Outlet />;

  const isSuperadmin = pathname === "/superadmin" || pathname.startsWith("/superadmin/");

  if (isSuperadmin && user?.role !== "super_admin") {
    return (
      <AccessDenied
        title="Access Denied"
        description="You do not have the required credentials to access the superadmin dashboard."
      />
    );
  }

  // Subscription access guard
  if (user?.role !== "super_admin") {
    const platformApps = resolvePlatformApps(entitlements);
    let appKey: keyof typeof platformApps | null = null;
    
    if (pathname.startsWith("/pos")) {
      appKey = "pos";
    } else if (pathname.startsWith("/leads")) {
      appKey = "crm";
    } else if (pathname.startsWith("/analytics") || pathname === "/revenue/ai-dashboard") {
      appKey = "analytics";
    } else if (pathname.startsWith("/reports")) {
      appKey = "reports";
    } else if (pathname.startsWith("/channel-manager")) {
      appKey = "channelManager";
    } else if (pathname.startsWith("/booking-engine")) {
      appKey = "bookingEngine";
    } else if (pathname.startsWith("/ai-insights")) {
      appKey = "aiHub";
    } else {
      // General PMS routes
      appKey = "pms";
    }

    if (appKey && !platformApps[appKey]) {
      return (
        <AccessDenied
          title="Subscription Required"
          description={`Your property is not subscribed to the ${appKey.toUpperCase()} application. Please contact the system administrator to enable this module.`}
        />
      );
    }
  }

  const disabledFeature = getFeatureBlockedOnPath(pathname, featureEnabled);
  if (disabledFeature) {
    const Shell = isSuperadmin ? SuperadminShell : (isPosPath(pathname) ? PosShell : AppShell);
    return (
      <Shell>
        <FeatureDisabled title={disabledFeature.title} description={disabledFeature.description} />
      </Shell>
    );
  }

  if (isSuperadmin) {
    return (
      <SuperadminShell>
        <Outlet />
      </SuperadminShell>
    );
  }

  if (isPosPath(pathname)) {
    return (
      <PosShell>
        <Outlet />
      </PosShell>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    applyTheme(readSavedTheme());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster richColors />
        <AuthGate />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function getFeatureBlockedOnPath(
  pathname: string,
  featureEnabled: (feature: FeatureKey) => boolean,
): { title: string; description: string } | null {
  const checks: Array<{
    feature: FeatureKey;
    matches: (path: string) => boolean;
    title: string;
    description: string;
  }> = [
    {
      feature: "channelManager",
      matches: (path) => path === "/channel-manager" || path.startsWith("/channel-manager/"),
      title: "Channel Manager is not enabled",
      description:
        "This tenant setup does not include Channel Manager. Enable it in tenant features to use OTA connectivity screens.",
    },
    {
      feature: "websiteBuilder",
      matches: (path) => path === "/website-builder" || path.startsWith("/website-builder/"),
      title: "Website Builder is not enabled",
      description:
        "This tenant setup does not include Website Builder. Enable it in tenant features to manage website pages.",
    },
    {
      feature: "bookingEngine",
      matches: (path) => path === "/booking-engine" || path.startsWith("/booking-engine/"),
      title: "Booking Engine is not enabled",
      description:
        "This tenant setup does not include Booking Engine. Enable it in tenant features to manage direct booking experiences.",
    },
    {
      feature: "revenueAi",
      matches: (path) => path === "/revenue/ai-dashboard" || path === "/ai-insights",
      title: "AI Revenue features are not enabled",
      description:
        "This tenant setup does not include AI Revenue features. Enable it in tenant features to access AI demand and pricing insights.",
    },
    {
      feature: "masterData",
      matches: (path) => path === "/masters" || path.startsWith("/masters/"),
      title: "Master Data is not enabled",
      description:
        "This tenant setup does not include centralized Master Data Management. Enable it in tenant features to access this module.",
    },
  ];

  for (const check of checks) {
    if (check.matches(pathname) && !featureEnabled(check.feature)) {
      return { title: check.title, description: check.description };
    }
  }
  return null;
}
