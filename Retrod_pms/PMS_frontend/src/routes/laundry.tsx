import { createFileRoute } from "@tanstack/react-router";
import { LaundryFeature } from "@/features/laundry/components/LaundryFeature";

export const Route = createFileRoute("/laundry")({
  head: () => ({ meta: [{ title: "Laundry Management — Retrod PMS" }] }),
  component: LaundryFeature,
});
