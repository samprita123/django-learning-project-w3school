import { createFileRoute } from "@tanstack/react-router";
import { GuardedRoute } from "@/features/auth/components/GuardedRoute";
import { AuditFeature } from "@/features/settings/components/AuditFeature";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit Logs — Retrod PMS" }] }),
  component: AuditGuardedRoute,
});

function AuditGuardedRoute() {
  return (
    <GuardedRoute
      permission="audit.view"
      title="Audit logs are restricted"
      description="This route requires the audit.view permission."
    >
      <AuditFeature />
    </GuardedRoute>
  );
}
