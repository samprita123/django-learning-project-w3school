import { createFileRoute } from "@tanstack/react-router";
import { TaxesFeesFeature } from "@/features/taxes-fees/components/TaxesFeesFeature";

export const Route = createFileRoute("/taxes-fees")({
  head: () => ({ meta: [{ title: "Taxes & Fees — Retrod PMS" }] }),
  component: TaxesFeesFeature,
});
