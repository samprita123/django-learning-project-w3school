import { createFileRoute } from "@tanstack/react-router";
import { HousekeepingFeature } from "@/features/housekeeping/components/HousekeepingFeature";

export const Route = createFileRoute("/housekeeping")({
  head: () => ({ meta: [{ title: "Housekeeping — Retrod PMS" }] }),
  component: HousekeepingFeature,
});
