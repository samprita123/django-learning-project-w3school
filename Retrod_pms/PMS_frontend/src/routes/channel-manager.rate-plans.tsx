import { createFileRoute } from "@tanstack/react-router";
import { RatePlanMappingScreen } from "@/features/channel-manager/components/screens/MappingScreens";

export const Route = createFileRoute("/channel-manager/rate-plans")({
  head: () => ({ meta: [{ title: "Rate Plan Mapping — Channel Manager" }] }),
  component: RatePlanMappingScreen,
});
