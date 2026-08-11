import { createFileRoute } from "@tanstack/react-router";
import { NightAuditWizard } from "@/features/night-audit/components/NightAuditWizard";
import { GuardedRoute } from "@/features/auth/components/GuardedRoute";

export const Route = createFileRoute("/night-audit")({
  head: () => ({ meta: [{ title: "Night Audit — Retrod PMS" }] }),
  component: NightAuditRoute,
});

function NightAuditRoute() {
  return (
    <GuardedRoute
      permission="dashboard.view"
      title="Night Audit Restricted"
      description="This route requires the night-audit.run permission."
    >
      <NightAuditWizard />
    </GuardedRoute>
  );
}
