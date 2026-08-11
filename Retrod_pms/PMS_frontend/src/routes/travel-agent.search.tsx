import { createFileRoute } from "@tanstack/react-router";
import { AgentSearch } from "@/features/travel-agent/components/AgentSearch";

export const Route = createFileRoute("/travel-agent/search")({
  head: () => ({ meta: [{ title: "Hotel Search" }] }),
  component: AgentSearch,
});
