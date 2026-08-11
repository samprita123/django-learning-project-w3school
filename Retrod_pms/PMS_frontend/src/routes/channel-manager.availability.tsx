import { createFileRoute } from "@tanstack/react-router";
import { AvailabilityCalendarScreen } from "@/features/channel-manager/components/screens/InventoryCalendarScreens";

export const Route = createFileRoute("/channel-manager/availability")({
  head: () => ({ meta: [{ title: "Availability Calendar — Channel Manager" }] }),
  component: AvailabilityCalendarScreen,
});
