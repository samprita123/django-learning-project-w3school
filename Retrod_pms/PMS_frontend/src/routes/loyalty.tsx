import { createFileRoute } from "@tanstack/react-router";
import { LoyaltyFeature } from "@/features/loyalty/components/LoyaltyFeature";

export const Route = createFileRoute("/loyalty")({
  head: () => ({ meta: [{ title: "Loyalty Program — Retrod PMS" }] }),
  component: LoyaltyFeature,
});
