import { createFileRoute } from "@tanstack/react-router";
import { CommunicationsFeature } from "@/features/settings/components/CommunicationsFeature";

export const Route = createFileRoute("/communications")({
  head: () => ({ meta: [{ title: "Guest Communications — Retrod PMS" }] }),
  component: CommunicationsFeature,
});
