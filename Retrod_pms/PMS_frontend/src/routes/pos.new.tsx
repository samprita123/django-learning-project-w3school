import { createFileRoute } from "@tanstack/react-router";
import { NewOrderFeature } from "@/features/pos/components/NewOrderFeature";

export const Route = createFileRoute("/pos/new")({
  head: () => ({ meta: [{ title: "New Order — POS" }] }),
  component: NewOrderRouteComponent,
});

function NewOrderRouteComponent() {
  return <NewOrderFeature />;
}
