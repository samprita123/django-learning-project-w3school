import { createFileRoute } from "@tanstack/react-router";
import { CheckInFeature } from "@/features/frontdesk/components/CheckInFeature";

export const Route = createFileRoute("/check-in")({
  head: () => ({ meta: [{ title: "Check-In / Out — Retrod PMS" }] }),
  component: CheckInFeature,
});
