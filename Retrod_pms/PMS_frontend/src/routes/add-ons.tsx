import { createFileRoute } from "@tanstack/react-router";
import { AddOnsFeature } from "@/features/addons/components/AddOnsFeature";

export const Route = createFileRoute("/add-ons")({
  head: () => ({ meta: [{ title: "Add-On Services — Retrod PMS" }] }),
  component: AddOnsFeature,
});
