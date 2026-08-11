import { createFileRoute } from "@tanstack/react-router";
import { ActivitiesFeature } from "@/features/activities/components/ActivitiesFeature";

export const Route = createFileRoute("/activities")({
  head: () => ({ meta: [{ title: "Activities — Retrod PMS" }] }),
  component: ActivitiesFeature,
});
