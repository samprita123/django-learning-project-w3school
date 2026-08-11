import { createFileRoute } from "@tanstack/react-router";
import { FrontDeskFeature } from "@/features/frontdesk/components/FrontDeskFeature";

export const Route = createFileRoute("/front-desk")({
  head: () => ({ meta: [{ title: "Front Desk — Retrod PMS" }] }),
  component: FrontDeskFeature,
});
