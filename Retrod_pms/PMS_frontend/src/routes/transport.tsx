import { createFileRoute } from "@tanstack/react-router";
import { TransportFeature } from "@/features/transport/components/TransportFeature";

export const Route = createFileRoute("/transport")({
  head: () => ({ meta: [{ title: "Transportation — Retrod PMS" }] }),
  component: TransportFeature,
});
