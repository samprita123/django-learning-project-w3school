import { createFileRoute } from "@tanstack/react-router";
import { OtaRevenueScreen } from "@/features/channel-manager/components/screens/RevenueAnalyticsScreens";

export const Route = createFileRoute("/channel-manager/revenue")({
  head: () => ({ meta: [{ title: "OTA Revenue — Channel Manager" }] }),
  component: OtaRevenueScreen,
});
