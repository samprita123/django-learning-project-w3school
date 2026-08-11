import { createFileRoute } from "@tanstack/react-router";
import { AnomalyMonitorFeature } from "@/features/revenue/components/AnomalyMonitorFeature";
import FeatureDisabled from "@/components/FeatureDisabled";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const Route = createFileRoute("/anomaly-monitor")({
  head: () => ({ meta: [{ title: "AI Anomaly Monitor — Retrod PMS" }] }),
  component: AnomalyMonitorGuardedRoute,
});

function AnomalyMonitorGuardedRoute() {
  const { featureEnabled } = useAuth();
  if (!featureEnabled("revenueAi")) {
    return (
      <FeatureDisabled
        title="AI Anomaly Monitor is not enabled"
        description="This tenant plan does not include AI anomaly monitoring. Enable revenue AI to access this view."
      />
    );
  }
  return <AnomalyMonitorFeature />;
}
