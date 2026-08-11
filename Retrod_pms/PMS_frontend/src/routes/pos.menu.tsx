import { createFileRoute } from "@tanstack/react-router";
import { PosMenuFeature } from "@/features/pos/components/PosMenuFeature";

export const Route = createFileRoute("/pos/menu")({
  head: () => ({ meta: [{ title: "Menu — Retrod POS" }] }),
  component: PosMenuFeature,
});
