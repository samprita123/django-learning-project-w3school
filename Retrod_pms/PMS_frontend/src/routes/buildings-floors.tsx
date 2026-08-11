import { createFileRoute } from "@tanstack/react-router";
import { BuildingsFloorsFeature } from "@/features/settings/components/BuildingsFloorsFeature";

export const Route = createFileRoute("/buildings-floors")({
  head: () => ({ meta: [{ title: "Building & Floor Management — Retrod PMS" }] }),
  component: BuildingsFloorsFeature,
});
