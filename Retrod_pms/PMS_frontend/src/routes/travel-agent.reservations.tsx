import { createFileRoute } from "@tanstack/react-router";
import { AgentReservations } from "@/features/travel-agent/components/AgentReservations";

export const Route = createFileRoute("/travel-agent/reservations")({
  head: () => ({ meta: [{ title: "Agent Reservations" }] }),
  component: AgentReservations,
});
