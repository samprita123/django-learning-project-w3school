import { createFileRoute } from "@tanstack/react-router";
import { AgentDashboard } from "@/features/travel-agent/components/AgentDashboard";

export const Route = createFileRoute("/travel-agent/dashboard")({
  head: () => ({ meta: [{ title: "Travel Agent Dashboard" }] }),
  component: AgentDashboard,
});
