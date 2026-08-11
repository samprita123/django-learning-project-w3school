import { createFileRoute } from "@tanstack/react-router";
import { SyncLogsScreen } from "@/features/channel-manager/components/screens/SyncScreens";

export const Route = createFileRoute("/channel-manager/sync-logs")({
  head: () => ({ meta: [{ title: "Sync Logs — Channel Manager" }] }),
  component: SyncLogsScreen,
});
