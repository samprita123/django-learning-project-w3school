import { createFileRoute } from "@tanstack/react-router";
import { ActivityTimelineFeature } from "@/features/activity/components/ActivityTimelineFeature";

export const Route = createFileRoute("/activity-timeline")({
  head: () => ({ meta: [{ title: "Activity Timeline — Retrod PMS" }] }),
  component: ActivityTimelineFeature,
});
