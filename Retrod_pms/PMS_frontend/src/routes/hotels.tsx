import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { HotelsFeature } from "@/features/hotels/components/HotelsFeature";

export const Route = createFileRoute("/hotels")({
  head: () => ({ meta: [{ title: "Hotels — Retrod PMS" }] }),
  component: HotelsRouteComponent,
});

function HotelsRouteComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // Child routes like /hotels/new should render their own page.
  if (pathname !== "/hotels") {
    return <Outlet />;
  }

  return <HotelsFeature />;
}
