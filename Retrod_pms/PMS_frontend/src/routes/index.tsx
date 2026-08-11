import { createFileRoute } from "@tanstack/react-router";
import { DashboardFeature } from "@/features/dashboard/components/DashboardFeature";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Retrod PMS" },
      { name: "description", content: "Operational heartbeat for The Grand Palace, New Delhi." },
    ],
  }),
  component: DashboardFeature,
});
