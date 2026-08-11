import { createFileRoute } from "@tanstack/react-router";
import { ReservationSyncScreen } from "@/features/channel-manager/components/screens/SyncScreens";

export const Route = createFileRoute("/channel-manager/reservations")({
  head: () => ({ meta: [{ title: "Reservation Sync — Channel Manager" }] }),
  component: ReservationSyncScreen,
});
