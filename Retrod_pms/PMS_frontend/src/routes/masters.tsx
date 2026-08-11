import { createFileRoute } from "@tanstack/react-router";
import { MastersFeature } from "@/features/masters/components/MastersFeature";
import FeatureDisabled from "@/components/FeatureDisabled";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const Route = createFileRoute("/masters")({
  head: () => ({ meta: [{ title: "Master Data — Retrod PMS" }] }),
  component: MastersGuardedRoute,
});

function MastersGuardedRoute() {
  const { featureEnabled } = useAuth();
  if (!featureEnabled("masterData")) {
    return (
      <FeatureDisabled
        title="Master Data is not enabled"
        description="This tenant setup does not include centralized Master Data Management."
      />
    );
  }
  return <MastersFeature />;
}
