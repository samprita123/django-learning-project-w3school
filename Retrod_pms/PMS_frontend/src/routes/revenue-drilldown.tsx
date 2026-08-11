import { createFileRoute } from "@tanstack/react-router";
import { RevenueDrilldownFeature } from "@/features/revenue/components/RevenueDrilldownFeature";

export const Route = createFileRoute("/revenue-drilldown")({
  head: () => ({ meta: [{ title: "Revenue Drilldown Suite — Retrod PMS" }] }),
  component: RevenueDrilldownFeature,
});
