import { createFileRoute } from "@tanstack/react-router";
import { BookingReadinessFeature } from "@/features/booking-engine/components/BookingReadinessFeature";

export const Route = createFileRoute("/booking-readiness")({
  head: () => ({ meta: [{ title: "Booking Readiness — Retrod PMS" }] }),
  component: BookingReadinessFeature,
});
