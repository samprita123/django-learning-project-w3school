import { createFileRoute } from "@tanstack/react-router";
import { PricingFeature } from "@/features/pricing/components/PricingFeature";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Dynamic Pricing — Retrod PMS" }] }),
  component: PricingFeature,
});
