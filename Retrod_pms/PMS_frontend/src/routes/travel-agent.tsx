import { createFileRoute } from "@tanstack/react-router";
import { TravelAgentLayout } from "@/features/travel-agent/layouts/TravelAgentLayout";

export const Route = createFileRoute("/travel-agent")({
  component: TravelAgentLayout,
});
