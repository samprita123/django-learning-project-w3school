import { createFileRoute } from "@tanstack/react-router";
import { CorporateFeature } from "@/features/corporate/components/CorporateFeature";

export const Route = createFileRoute("/corporate")({
  head: () => ({ meta: [{ title: "Corporate Accounts — Retrod PMS" }] }),
  component: CorporateFeature,
});
