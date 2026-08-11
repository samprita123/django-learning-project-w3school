import { createFileRoute } from "@tanstack/react-router";
import { PmsIntegrationsFeature } from "@/features/pms-integrations/components/PmsIntegrationsFeature";

export const Route = createFileRoute("/pms-integrations")({
  head: () => ({ meta: [{ title: "PMS Integrations Hub — Retrod PMS" }] }),
  component: PmsIntegrationsFeature,
});
