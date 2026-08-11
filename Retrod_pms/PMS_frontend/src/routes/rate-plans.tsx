import { createFileRoute } from "@tanstack/react-router";
import { RatePlansFeature } from "@/features/rate-plans/components/RatePlansFeature";

export const Route = createFileRoute("/rate-plans")({
  head: () => ({ meta: [{ title: "Rate Plans — Retrod PMS" }] }),
  component: RatePlansFeature,
});
