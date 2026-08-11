import { createFileRoute } from "@tanstack/react-router";
import { IncidentConsoleScreen } from "@/features/channel-manager/components/screens/IncidentConsoleScreen";

export const Route = createFileRoute("/channel-manager/incidents")({
  head: () => ({ meta: [{ title: "Incident Console — Channel Manager" }] }),
  component: IncidentConsoleScreen,
});
