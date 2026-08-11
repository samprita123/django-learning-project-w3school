import { createFileRoute } from "@tanstack/react-router";
import { RoleManagementFeature } from "@/features/superadmin/components/RoleManagementFeature";

export const Route = createFileRoute("/superadmin/roles")({
  head: () => ({ meta: [{ title: "Role Management — Superadmin" }] }),
  component: RoleManagementFeature,
});
