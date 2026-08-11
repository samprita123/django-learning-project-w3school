import { createFileRoute } from "@tanstack/react-router";
import { B2BAgentsFeature } from "@/features/b2b-agents/components/B2BAgents";

export const Route = createFileRoute("/b2b-agents")({
  component: () => <B2BAgentsFeature />,
});
