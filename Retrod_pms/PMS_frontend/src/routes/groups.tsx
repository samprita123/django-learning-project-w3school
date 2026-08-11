import { createFileRoute } from "@tanstack/react-router";
import { GroupsFeature } from "@/features/groups/components/GroupsFeature";

export const Route = createFileRoute("/groups")({
  head: () => ({ meta: [{ title: "Group Bookings — Retrod PMS" }] }),
  component: GroupsFeature,
});
