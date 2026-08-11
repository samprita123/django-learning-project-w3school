import { createFileRoute } from "@tanstack/react-router";
import { ConnectionsScreen } from "@/features/channel-manager/components/screens/ConnectionsScreen";

export const Route = createFileRoute("/channel-manager/connections")({
  head: () => ({ meta: [{ title: "OTA Connections — Channel Manager" }] }),
  component: ConnectionsScreen,
});
