import { createFileRoute } from "@tanstack/react-router";
import { AgentCommissions } from "@/features/travel-agent/components/AgentCommissions";

export const Route = createFileRoute("/travel-agent/commissions")({
  head: () => ({ meta: [{ title: "Commissions & Payouts" }] }),
  component: AgentCommissions,
});
