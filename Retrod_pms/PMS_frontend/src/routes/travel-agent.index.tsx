import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/travel-agent/")({
  beforeLoad: () => {
    throw redirect({
      to: "/travel-agent/dashboard",
    });
  },
});
