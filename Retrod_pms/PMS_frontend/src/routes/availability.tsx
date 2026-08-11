import { createFileRoute } from "@tanstack/react-router";
import { AvailabilityFeature } from "@/features/availability/components/AvailabilityFeature";

export const Route = createFileRoute("/availability")({
  head: () => ({ meta: [{ title: "Availability Management — Retrod PMS" }] }),
  component: AvailabilityFeature,
});
