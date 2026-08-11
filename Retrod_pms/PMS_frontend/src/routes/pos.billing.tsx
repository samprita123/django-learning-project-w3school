import { createFileRoute } from "@tanstack/react-router";
import { PosBillingFeature } from "@/features/pos/components/PosBillingFeature";

export const Route = createFileRoute("/pos/billing")({
  head: () => ({ meta: [{ title: "Billing — Retrod POS" }] }),
  component: PosBillingFeature,
});
