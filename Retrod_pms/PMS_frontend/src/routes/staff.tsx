import { createFileRoute } from "@tanstack/react-router";
import { GuardedRoute } from "@/features/auth/components/GuardedRoute";
import { StaffFeature } from "@/features/settings/components/StaffFeature";

export const Route = createFileRoute("/staff")({
  head: () => ({ meta: [{ title: "Staff Management — Retrod PMS" }] }),
  component: StaffGuardedRoute,
});

function StaffGuardedRoute() {
  return (
    <GuardedRoute
      permission="staff.view"
      title="Staff management is restricted"
      description="This route requires the staff.manage permission."
    >
      <StaffFeature />
    </GuardedRoute>
  );
}
