import { createFileRoute } from "@tanstack/react-router";
import { NewHotelFeature } from "@/features/hotels/components/NewHotelFeature";

export const Route = createFileRoute("/hotels/new")({
  head: () => ({ meta: [{ title: "Add Hotel — Retrod PMS" }] }),
  component: NewHotelFeature,
});
