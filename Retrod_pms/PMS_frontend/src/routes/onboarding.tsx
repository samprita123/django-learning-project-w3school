import { createFileRoute } from "@tanstack/react-router";
import { OnboardingFeature } from "@/features/onboarding/components/OnboardingFeature";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Property Onboarding — Retrod PMS" }] }),
  component: OnboardingFeature,
});
