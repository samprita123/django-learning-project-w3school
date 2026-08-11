import { createFileRoute } from "@tanstack/react-router";
import { GuardedRoute } from "@/features/auth/components/GuardedRoute";
import { SettingsFeature } from "@/features/settings/components/SettingsFeature";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "System Setup — Retrod PMS" }] }),
  component: SettingsGuardedRoute,
});

function SettingsGuardedRoute() {
  return (
    <GuardedRoute
      permission="settings.view"
      title="System setup is restricted"
      description="This route requires the settings.manage permission."
    >
      <SettingsFeature />
    </GuardedRoute>
  );
}
