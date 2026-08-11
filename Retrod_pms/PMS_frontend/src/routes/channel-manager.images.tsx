import { createFileRoute } from "@tanstack/react-router";
import { ImageManagementScreen } from "@/features/channel-manager/components/screens/ContentScreens";

export const Route = createFileRoute("/channel-manager/images")({
  head: () => ({ meta: [{ title: "Image Management — Channel Manager" }] }),
  component: ImageManagementScreen,
});
