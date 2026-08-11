import { createFileRoute } from "@tanstack/react-router";
import { MaintenanceFeature } from "@/features/maintenance/components/MaintenanceFeature";

export const Route = createFileRoute("/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — Retrod PMS" }] }),
  component: MaintenanceFeature,
});
