import { createFileRoute } from "@tanstack/react-router";
import { NewReservationFeature } from "@/features/reservations/components/NewReservationFeature";

export const Route = createFileRoute("/reservations/new")({
  head: () => ({ meta: [{ title: "New Reservation — Retrod PMS" }] }),
  component: NewReservationFeature,
});
