import { createFileRoute } from "@tanstack/react-router";
import { PackagesFeature } from "@/features/packages/components/PackagesFeature";

export const Route = createFileRoute("/packages")({
  head: () => ({ meta: [{ title: "Packages — Retrod PMS" }] }),
  component: PackagesFeature,
});
