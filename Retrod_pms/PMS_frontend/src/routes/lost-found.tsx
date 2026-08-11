import { createFileRoute } from "@tanstack/react-router";
import { LostFoundFeature } from "@/features/lost-found/components/LostFoundFeature";

export const Route = createFileRoute("/lost-found")({
  head: () => ({ meta: [{ title: "Lost & Found — Retrod PMS" }] }),
  component: LostFoundFeature,
});
