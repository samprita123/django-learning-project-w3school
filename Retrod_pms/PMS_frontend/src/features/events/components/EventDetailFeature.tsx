import { PageHeader, Card, CardHeader, StatusBadge } from "@/components/ui/Primitives";
import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { reservationsApi } from "@/services/api/reservations";
import { ArrowLeft, Loader2 } from "lucide-react";

export function EventDetailFeature() {
  const { eventId } = useParams({ from: "/events/$eventId" });

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["eventReservations"],
    queryFn: () => reservationsApi.getReservations(),
  });

  const event = (reservations || []).find((r: any) => String(r.id) === String(eventId));

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 text-center text-text-secondary">
        <p>Event not found.</p>
        <Link to="/events" className="text-brand hover:underline mt-4 inline-block">Return to Events</Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={
          <Link to="/events" className="inline-flex items-center text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="mr-1 h-3 w-3" />
            Events
          </Link>
        }
        title={event.event_type || event.guest_name || `Event #${event.id}`}
        description={`${event.arrival_date || ''} • ${event.event_venue || 'Banquet Hall'}`}
        actions={
          <StatusBadge tone={event.status === "CONFIRMED" || event.status === "Confirmed" ? "success" : "warning"}>
            {event.status}
          </StatusBadge>
        }
      />
      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        <Card>
          <CardHeader title="Event Details" hint="Basic information" />
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-secondary">Event Type</p>
              <p className="font-medium text-text-primary">{event.event_type || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Expected Pax</p>
              <p className="font-medium text-text-primary">{event.event_pax || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Organizer / Primary Guest</p>
              <p className="font-medium text-text-primary">{event.guest_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total Amount</p>
              <p className="font-medium text-text-primary">₹{event.total_amount || 0}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
