import { createFileRoute } from "@tanstack/react-router";
import { RegisterScreen } from "@/features/travel-agent/components/RegisterScreen";

export const Route = createFileRoute("/travel-agent/register")({
  component: RegisterScreen,
});
