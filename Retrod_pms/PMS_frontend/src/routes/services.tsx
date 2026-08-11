import { createFileRoute } from "@tanstack/react-router";
import { ServicesFeature } from "@/features/services/components/ServicesFeature";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "Services — Retrod PMS" }] }),
  component: ServicesFeature,
});
