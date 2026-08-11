import { createFileRoute } from "@tanstack/react-router";
import { TenantOnboardingWizard } from "@/features/superadmin/components/TenantOnboardingWizard";

export const Route = createFileRoute("/superadmin/tenants/new")({
  head: () => ({ meta: [{ title: "New Tenant — Superadmin" }] }),
  component: TenantOnboardingWizard,
});
