import { createFileRoute } from "@tanstack/react-router";
import { ReportsFeature } from "@/features/reports/components/ReportsFeature";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics — Retrod PMS" }] }),
  component: ReportsFeature,
});
