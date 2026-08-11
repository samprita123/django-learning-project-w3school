import { createFileRoute } from "@tanstack/react-router";
import { PosInventoryFeature } from "@/features/pos/components/PosInventoryFeature";

export const Route = createFileRoute("/pos/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Retrod POS" }] }),
  component: PosInventoryFeature,
});
