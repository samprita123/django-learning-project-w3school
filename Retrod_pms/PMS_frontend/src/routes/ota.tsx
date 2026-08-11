import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ota")({
  beforeLoad: () => {
    throw redirect({ to: "/channel-manager" });
  },
});
