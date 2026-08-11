import { createFileRoute } from "@tanstack/react-router";
import { EditHotelFeature } from "@/features/hotels/components/EditHotelFeature";

export const Route = createFileRoute("/hotels/$hotelId/edit")({
  head: () => ({ meta: [{ title: "Edit Hotel — Retrod PMS" }] }),
  component: EditHotelFeature,
});
