import { createFileRoute } from "@tanstack/react-router";
import { ReservationDetailFeature } from "@/features/reservations/components/ReservationDetailFeature";

export const Route = createFileRoute("/reservations/$reservationId")({
  component: ReservationDetailFeature,
});
