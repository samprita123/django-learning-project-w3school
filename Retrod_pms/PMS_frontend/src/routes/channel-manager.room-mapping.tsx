import { createFileRoute } from "@tanstack/react-router";
import { RoomMappingScreen } from "@/features/channel-manager/components/screens/MappingScreens";

export const Route = createFileRoute("/channel-manager/room-mapping")({
  head: () => ({ meta: [{ title: "Room Mapping — Channel Manager" }] }),
  component: RoomMappingScreen,
});
