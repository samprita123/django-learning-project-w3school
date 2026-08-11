import { createFileRoute } from "@tanstack/react-router";
import { AgentProfile } from "@/features/travel-agent/components/AgentProfile";

export const Route = createFileRoute("/travel-agent/profile")({
  head: () => ({ meta: [{ title: "My Profile" }] }),
  component: AgentProfile,
});
