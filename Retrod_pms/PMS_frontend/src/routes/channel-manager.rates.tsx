import { createFileRoute } from "@tanstack/react-router";
import { RateCalendarScreen } from "@/features/channel-manager/components/screens/InventoryCalendarScreens";

export const Route = createFileRoute("/channel-manager/rates")({
  head: () => ({ meta: [{ title: "Rate Calendar — Channel Manager" }] }),
  component: RateCalendarScreen,
});
