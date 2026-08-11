import { createFileRoute } from "@tanstack/react-router";
import { InventoryScreen } from "@/features/channel-manager/components/screens/InventoryCalendarScreens";

export const Route = createFileRoute("/channel-manager/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Channel Manager" }] }),
  component: InventoryScreen,
});
