import { createFileRoute } from "@tanstack/react-router";
import { PosKotFeature } from "@/features/pos/components/PosKotFeature";

export const Route = createFileRoute("/pos/kot")({
  head: () => ({ meta: [{ title: "Kitchen KOT — Retrod POS" }] }),
  component: PosKotFeature,
});
