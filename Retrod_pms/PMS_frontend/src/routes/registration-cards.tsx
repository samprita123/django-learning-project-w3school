import { createFileRoute } from "@tanstack/react-router";
import { RegistrationCardsFeature } from "@/features/registration/components/RegistrationCardsFeature";

export const Route = createFileRoute("/registration-cards")({
  head: () => ({ meta: [{ title: "Registration Cards — Retrod PMS" }] }),
  component: RegistrationCardsFeature,
});
