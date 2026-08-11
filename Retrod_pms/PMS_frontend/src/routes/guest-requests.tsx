import { createFileRoute } from "@tanstack/react-router";
import { GuestRequestsFeature } from "@/features/guest-requests/components/GuestRequestsFeature";

export const Route = createFileRoute("/guest-requests")({
  head: () => ({ meta: [{ title: "Guest Requests — Retrod PMS" }] }),
  component: GuestRequestsFeature,
});
