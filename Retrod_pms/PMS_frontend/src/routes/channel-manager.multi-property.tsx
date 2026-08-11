import { createFileRoute } from "@tanstack/react-router";
import { MultiPropertyScreen } from "@/features/channel-manager/components/screens/RestrictionsMultiPropertyScreens";

export const Route = createFileRoute("/channel-manager/multi-property")({
  head: () => ({ meta: [{ title: "Multi-Property — Channel Manager" }] }),
  component: MultiPropertyScreen,
});
