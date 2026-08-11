import { createFileRoute } from "@tanstack/react-router";
import { GlobalSearchFeature } from "@/features/search/components/GlobalSearchFeature";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Global Search — Retrod PMS" }] }),
  component: GlobalSearchFeature,
});
