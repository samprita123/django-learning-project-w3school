import { createFileRoute } from "@tanstack/react-router";
import { FeedbackFeature } from "@/features/feedback/components/FeedbackFeature";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "Guest Feedback — Retrod PMS" }] }),
  component: FeedbackFeature,
});
