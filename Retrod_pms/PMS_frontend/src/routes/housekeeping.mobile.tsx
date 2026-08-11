import { createFileRoute } from "@tanstack/react-router";
import { HousekeepingMobileFeature } from "@/features/housekeeping/components/HousekeepingMobileFeature";

export const Route = createFileRoute("/housekeeping/mobile")({
  head: () => ({ meta: [{ title: "HK Mobile — Retrod PMS" }] }),
  component: HousekeepingMobileFeature,
});
