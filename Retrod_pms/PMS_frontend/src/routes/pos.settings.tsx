import { createFileRoute } from "@tanstack/react-router";
import { PosSettingsFeature } from "@/features/pos/components/PosSettingsFeature";

export const Route = createFileRoute("/pos/settings")({
  component: PosSettingsFeature,
});
