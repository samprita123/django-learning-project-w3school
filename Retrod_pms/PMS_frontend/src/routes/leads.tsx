import { createFileRoute } from "@tanstack/react-router";
import { LeadsFeature } from "@/features/leads/components/LeadsFeature";

export const Route = createFileRoute("/leads")({
  head: () => ({ meta: [{ title: "Leads — Retrod PMS" }] }),
  component: LeadsFeature,
});
