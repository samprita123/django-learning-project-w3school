import { createFileRoute } from "@tanstack/react-router";
import { GuardedRoute } from "@/features/auth/components/GuardedRoute";
import { PropertyFeature } from "@/features/settings/components/PropertyFeature";

export const Route = createFileRoute("/property")({
  head: () => ({ meta: [{ title: "Property Configuration — Retrod PMS" }] }),
  component: PropertyGuardedRoute,
});

function PropertyGuardedRoute() {
  return (
    <GuardedRoute
      permission="settings.view"
      title="Property configuration is restricted"
      description="This route requires the property.configure permission."
    >
      <PropertyFeature />
    </GuardedRoute>
  );
}
