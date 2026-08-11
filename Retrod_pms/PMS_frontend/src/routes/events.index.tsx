import { createFileRoute } from "@tanstack/react-router";
import { EventsFeature } from "@/features/events/components/EventsFeature";

export const Route = createFileRoute("/events/")({
  head: () => ({ meta: [{ title: "Event Bookings — Retrod PMS" }] }),
  component: EventsFeature,
});
