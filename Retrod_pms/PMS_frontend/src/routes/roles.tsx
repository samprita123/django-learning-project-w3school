import { createFileRoute } from "@tanstack/react-router";
import { GuardedRoute } from "@/features/auth/components/GuardedRoute";
import { RolesFeature } from "@/features/settings/components/RolesFeature";

export const Route = createFileRoute("/roles")({
  head: () => ({ meta: [{ title: "Roles & Privileges — Retrod PMS" }] }),
  component: RolesGuardedRoute,
});

function RolesGuardedRoute() {
  return (
    <GuardedRoute
      permission="roles.view"
      title="Roles & permissions are restricted"
      description="This route requires the roles.manage permission. Contact a system administrator to manage role policies."
    >
      <RolesFeature />
    </GuardedRoute>
  );
}
