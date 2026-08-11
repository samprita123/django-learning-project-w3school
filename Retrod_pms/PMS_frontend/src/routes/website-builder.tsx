import { createFileRoute } from "@tanstack/react-router";
import { WebsiteBuilderFeature } from "@/features/website-builder/components/WebsiteBuilderFeature";
import FeatureDisabled from "@/components/FeatureDisabled";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const Route = createFileRoute("/website-builder")({
  head: () => ({ meta: [{ title: "Website Builder — Retrod PMS" }] }),
  component: WebsiteBuilderGuardedRoute,
});

function WebsiteBuilderGuardedRoute() {
  const { featureEnabled } = useAuth();
  if (!featureEnabled("websiteBuilder")) {
    return (
      <FeatureDisabled
        title="Website Builder is not enabled"
        description="This tenant plan does not include Website Builder. Enable it during tenant setup to publish a branded site."
      />
    );
  }
  return <WebsiteBuilderFeature />;
}
