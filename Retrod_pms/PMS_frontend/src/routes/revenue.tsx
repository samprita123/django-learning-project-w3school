import { createFileRoute } from "@tanstack/react-router";
import { RevenueFeature } from "@/features/revenue/components/RevenueFeature";

export const Route = createFileRoute("/revenue")({
  head: () => ({ meta: [{ title: "Revenue Management — Retrod PMS" }] }),
  component: RevenueFeature,
});
