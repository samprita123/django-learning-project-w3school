import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsScreen } from "@/features/channel-manager/components/screens/RevenueAnalyticsScreens";

export const Route = createFileRoute("/channel-manager/analytics")({
  head: () => ({ meta: [{ title: "Channel Analytics — Channel Manager" }] }),
  component: AnalyticsScreen,
});
