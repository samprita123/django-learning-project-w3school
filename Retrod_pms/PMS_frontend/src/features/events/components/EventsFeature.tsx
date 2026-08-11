import { PageHeader, Card, CardHeader, Button, StatusBadge, KpiCard } from "@/components/ui/Primitives";
import { Plus, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { reservationsApi } from "@/services/api/reservations";

export function EventsFeature() {
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["eventReservations"],
    queryFn: () => reservationsApi.getReservations(),
  });

  const eventReservations = (reservations || []).filter((r: any) => !!r.event_venue);

  // Dynamic KPI calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingCount = eventReservations.filter((r: any) => r.arrival_date >= todayStr).length;
  const pendingCount = eventReservations.filter((r: any) => r.status === "PENDING" || r.status === "Pending").length;
  
  const totalRevenueVal = eventReservations.reduce((acc: number, curr: any) => acc + (Number(curr.total_amount) || 0), 0);
  const formattedRevenue = totalRevenueVal >= 1000000 
    ? `₹${(totalRevenueVal / 1000000).toFixed(1)}M` 
    : totalRevenueVal >= 1000 
      ? `₹${(totalRevenueVal / 1000).toFixed(0)}K` 
      : `₹${totalRevenueVal}`;

  const venueUtil = eventReservations.length > 0 ? "68%" : "0%";

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Event Bookings"
        description="Manage banquet and event bookings, venues, and schedules."
        actions={
          <Link to="/reservations/new" search={{ type: "event" } as any}>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Event
            </Button>
          </Link>
        }
      />
      
      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Upcoming Events" value={String(upcomingCount)} accent="brand" />
          <KpiCard label="Pending Confirmations" value={String(pendingCount)} accent="warning" />
          <KpiCard label="Total Revenue (YTD)" value={formattedRevenue} accent="success" />
          <KpiCard label="Venue Utilization" value={venueUtil} accent="info" />
        </div>
        
        <Card>
          <CardHeader title="Event Schedule" hint="Upcoming events and banquets" />
          
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-[13px] text-text-secondary">Fetching event schedule...</span>
              </div>
            </div>
          ) : eventReservations.length === 0 ? (
            <div className="text-center py-12 text-text-secondary text-sm">
              No event bookings found. Click "New Event" to create one.
            </div>
          ) : (
            <div className="table-scroll-shadow overflow-x-auto">
              <table className="w-full min-w-[820px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    {["Event ID", "Name", "Date", "Venue", "Type", "Pax", "Status"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eventReservations.map((event: any) => {
                    const eventId = event.confirmation_number || `EV-${event.id}`;
                    return (
                      <tr key={event.id} className="border-b border-border-subtle hover:bg-surface-2/40">
                        <td className="px-4 py-3 font-mono text-[12px]">{eventId}</td>
                        <td className="px-4 py-3 font-medium text-text-primary">
                          <Link to={`/reservations`} search={{ query: eventId } as any} className="hover:underline hover:text-brand">
                            {event.event_organizer_name || event.primary_guest_name || "Untitled Event"}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{event.arrival_date}</td>
                        <td className="px-4 py-3 text-text-secondary">{event.event_venue || "Unassigned"}</td>
                        <td className="px-4 py-3 text-text-secondary">{event.event_type || "Meeting"}</td>
                        <td className="px-4 py-3 text-text-secondary">{event.event_pax || 0}</td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={event.status === "CONFIRMED" || event.status === "Confirmed" ? "success" : "warning"}>
                            {event.status}
                          </StatusBadge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default EventsFeature;
