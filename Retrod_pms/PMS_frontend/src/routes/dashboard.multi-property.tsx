import { createFileRoute } from "@tanstack/react-router";
import { MultiPropertyFeature } from "@/features/dashboard/components/MultiPropertyFeature";

export const Route = createFileRoute("/dashboard/multi-property")({
  head: () => ({ meta: [{ title: "Multi-Property — Retrod PMS" }] }),
  component: MultiPropertyFeature,
});
