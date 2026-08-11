import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { PosOrdersFeature } from "@/features/pos/components/PosOrdersFeature";
import FeatureDisabled from "@/components/FeatureDisabled";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  canAccessPlatformApp,
  getPlatformApp,
  resolvePlatformApps,
} from "@/features/retrod-one/lib/access";

export const Route = createFileRoute("/pos")({
  head: () => ({ meta: [{ title: "Point of Sale — Retrod One" }] }),
  component: PosRouteComponent,
});

function PosRouteComponent() {
  const { user, entitlements, featureEnabled } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const posApp = getPlatformApp("pos");

  if (!posApp || !canAccessPlatformApp(user?.role, resolvePlatformApps(entitlements), posApp)) {
    return (
      <FeatureDisabled
        title="POS is not available"
        description="Your role or subscription does not include Point of Sale. Contact your administrator."
      />
    );
  }

  if (pathname !== "/pos") {
    return <Outlet />;
  }

  return <PosOrdersFeature />;
}
