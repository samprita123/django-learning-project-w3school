import { createFileRoute } from "@tanstack/react-router";
import { TasksFeature } from "@/features/tasks/components/TasksFeature";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Retrod PMS" }] }),
  component: TasksFeature,
});
