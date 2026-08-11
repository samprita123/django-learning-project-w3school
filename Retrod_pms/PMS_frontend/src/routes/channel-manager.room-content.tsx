import { createFileRoute } from "@tanstack/react-router";
import { RoomContentScreen } from "@/features/channel-manager/components/screens/ContentScreens";

export const Route = createFileRoute("/channel-manager/room-content")({
  head: () => ({ meta: [{ title: "Room Content — Channel Manager" }] }),
  component: RoomContentScreen,
});
