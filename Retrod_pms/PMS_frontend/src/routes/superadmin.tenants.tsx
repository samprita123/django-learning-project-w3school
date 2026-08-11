import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { TenantListFeature } from "@/features/superadmin/components/TenantListFeature";

export const Route = createFileRoute("/superadmin/tenants")({
  head: () => ({ meta: [{ title: "Tenant Management — Superadmin" }] }),
  component: SuperadminTenantsRouteComponent,
});

function SuperadminTenantsRouteComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // Child routes like /superadmin/tenants/new should render their own page.
  if (pathname !== "/superadmin/tenants") {
    return <Outlet />;
  }

  return <TenantListFeature />;
}
