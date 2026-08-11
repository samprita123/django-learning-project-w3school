import { createFileRoute } from "@tanstack/react-router";
import { AgentBooking } from "@/features/travel-agent/components/AgentBooking";

export const Route = createFileRoute("/travel-agent/book")({
  head: () => ({ meta: [{ title: "Complete Booking" }] }),
  component: AgentBooking,
});
