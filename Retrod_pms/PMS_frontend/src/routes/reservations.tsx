import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { ReservationsFeature } from "@/features/reservations/components/ReservationsFeature";

export const Route = createFileRoute("/reservations")({
  head: () => ({ meta: [{ title: "Reservations — Retrod PMS" }] }),
  component: ReservationsRouteComponent,
});

function ReservationsRouteComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // Child routes like /reservations/new should render their own page.
  if (pathname !== "/reservations") {
    return <Outlet />;
  }

  return <ReservationsFeature />;
}
