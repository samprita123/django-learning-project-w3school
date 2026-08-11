import { createFileRoute } from "@tanstack/react-router";
import { BillingFeature } from "@/features/billing/components/BillingFeature";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Billing & Invoicing — Retrod PMS" }] }),
  component: BillingFeature,
});
