import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { DashboardScreen } from "@/features/channel-manager/components/screens/DashboardScreen";
import FeatureDisabled from "@/components/FeatureDisabled";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const Route = createFileRoute("/channel-manager")({
  head: () => ({ meta: [{ title: "Channel Manager — Retrod PMS" }] }),
  component: ChannelManagerGuardedRoute,
});

function ChannelManagerGuardedRoute() {
  const { featureEnabled } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (!featureEnabled("channelManager")) {
    return (
      <FeatureDisabled
        title="Channel Manager is not enabled"
        description="This tenant plan does not include Channel Manager. Enable it in tenant setup to access OTA distribution."
      />
    );
  }

  if (pathname !== "/channel-manager") {
    return <Outlet />;
  }

  return <DashboardScreen />;
}
