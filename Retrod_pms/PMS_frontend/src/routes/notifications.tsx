import { createFileRoute } from "@tanstack/react-router";
import { NotificationCenterFeature } from "@/features/notifications/components/NotificationCenterFeature";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notification Center — Retrod PMS" }] }),
  component: NotificationCenterFeature,
});
