import { createFileRoute } from "@tanstack/react-router";
import { AIInsightsFeature } from "@/features/revenue/components/AIInsightsFeature";

export const Route = createFileRoute("/ai-insights")({
  head: () => ({ meta: [{ title: "AI Insights — Retrod PMS" }] }),
  component: AIInsightsFeature,
});
