import { createFileRoute } from "@tanstack/react-router";
import { CustomerDisplayFeature } from "@/features/pos/components/CustomerDisplayFeature";

export const Route = createFileRoute("/pos/customer-display")({
  head: () => ({ meta: [{ title: "Customer Display — Retrod POS" }] }),
  component: CustomerDisplayFeature,
});
