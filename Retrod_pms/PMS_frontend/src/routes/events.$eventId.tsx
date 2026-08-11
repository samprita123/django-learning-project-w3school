import { createFileRoute } from "@tanstack/react-router";
import { EventDetailFeature } from "@/features/events/components/EventDetailFeature";

export const Route = createFileRoute("/events/$eventId")({
  component: EventDetailFeature,
});
