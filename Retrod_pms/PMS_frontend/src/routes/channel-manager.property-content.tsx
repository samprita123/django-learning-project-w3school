import { createFileRoute } from "@tanstack/react-router";
import { PropertyContentScreen } from "@/features/channel-manager/components/screens/ContentScreens";

export const Route = createFileRoute("/channel-manager/property-content")({
  head: () => ({ meta: [{ title: "Property Content — Channel Manager" }] }),
  component: PropertyContentScreen,
});
