import { createFileRoute } from "@tanstack/react-router";
import { AIRevenueDashboardFeature } from "@/features/revenue/components/AIRevenueDashboardFeature";
import FeatureDisabled from "@/components/FeatureDisabled";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const Route = createFileRoute("/revenue/ai-dashboard")({
  head: () => ({ meta: [{ title: "AI Revenue Dashboard — Retrod PMS" }] }),
  component: AIRevenueDashboardGuardedRoute,
});

function AIRevenueDashboardGuardedRoute() {
  const { featureEnabled } = useAuth();
  if (!featureEnabled("revenueAi")) {
    return (
      <FeatureDisabled
        title="AI Revenue Dashboard is not enabled"
        description="This tenant plan does not include AI revenue optimization. Enable it to access AI demand and pricing features."
      />
    );
  }
  return <AIRevenueDashboardFeature />;
}
