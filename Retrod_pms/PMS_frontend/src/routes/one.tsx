import { createFileRoute } from "@tanstack/react-router";
import { RetrodOneFeature } from "@/features/retrod-one/components/RetrodOneFeature";

export const Route = createFileRoute("/one")({
  head: () => ({
    meta: [
      { title: "Retrod One — Hospitality Operating System" },
      {
        name: "description",
        content: "Central platform hub for PMS, POS, CRM, analytics, and hospitality applications.",
      },
    ],
  }),
  component: RetrodOneFeature,
});
