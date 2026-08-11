import { createFileRoute } from "@tanstack/react-router";
import { PaymentsFeature } from "@/features/settings/components/PaymentsFeature";

export const Route = createFileRoute("/payments")({
  head: () => ({ meta: [{ title: "Payments — Retrod PMS" }] }),
  component: PaymentsFeature,
});
