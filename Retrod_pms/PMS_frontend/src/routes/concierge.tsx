import { createFileRoute } from "@tanstack/react-router";
import { ConciergeFeature } from "@/features/concierge/components/ConciergeFeature";

export const Route = createFileRoute("/concierge")({
  head: () => ({ meta: [{ title: "Concierge — Retrod PMS" }] }),
  component: ConciergeFeature,
});
