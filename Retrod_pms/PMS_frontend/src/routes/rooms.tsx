import { createFileRoute } from "@tanstack/react-router";
import { RoomsFeature } from "@/features/settings/components/RoomsFeature";

export const Route = createFileRoute("/rooms")({
  head: () => ({ meta: [{ title: "Rooms & Inventory — Retrod PMS" }] }),
  component: RoomsFeature,
});
