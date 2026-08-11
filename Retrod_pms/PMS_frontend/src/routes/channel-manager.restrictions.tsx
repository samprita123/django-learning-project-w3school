import { createFileRoute } from "@tanstack/react-router";
import { RestrictionsScreen } from "@/features/channel-manager/components/screens/RestrictionsMultiPropertyScreens";

export const Route = createFileRoute("/channel-manager/restrictions")({
  head: () => ({ meta: [{ title: "Restrictions — Channel Manager" }] }),
  component: RestrictionsScreen,
});
