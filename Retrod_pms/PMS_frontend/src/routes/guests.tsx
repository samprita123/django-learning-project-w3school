import { createFileRoute } from "@tanstack/react-router";
import { GuestsFeature } from "@/features/guests/components/GuestsFeature";

export const Route = createFileRoute("/guests")({
  head: () => ({ meta: [{ title: "Guest Profiles — Retrod PMS" }] }),
  component: GuestsFeature,
});
