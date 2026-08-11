import { createFileRoute } from "@tanstack/react-router";
import { ExecutiveAnalyticsFeature } from "@/features/analytics/components/ExecutiveAnalyticsFeature";

export const Route = createFileRoute("/analytics/executive")({
  head: () => ({ meta: [{ title: "Executive Analytics — Retrod PMS" }] }),
  component: ExecutiveAnalyticsFeature,
});
