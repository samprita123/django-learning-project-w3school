import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "@/features/travel-agent/components/LoginScreen";

export const Route = createFileRoute("/travel-agent/login")({
  component: LoginScreen,
});
