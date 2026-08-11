import { Plus } from "lucide-react";
import { PageHeader, KpiCard, Button, Card, StatusBadge } from "@/components/ui/Primitives";
import { useGuestServiceRequestsQuery } from "@/services/mock/queries";

const columns = ["New", "Assigned", "In Progress", "Done"] as const;

export function GuestRequestsFeature() {
  const { data: guestServiceRequests = [] } = useGuestServiceRequestsQuery();

  const open = guestServiceRequests.filter((r) => r.status !== "Done");

  return (
    <div>
      <PageHeader
        eyebrow="Guests"
        title="Guest Mobile Requests"
        description="In-stay requests from the mobile app."
        actions={
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Assign
          </Button>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Open requests" value={String(open.length)} accent="brand" />
          <KpiCard label="Avg response" value="14 min" accent="info" />
          <KpiCard label="SLA breaches" value="0" accent="success" />
          <KpiCard label="Satisfaction" value="4.8/5" accent="success" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {columns.map((col) => {
            const items = guestServiceRequests.filter((r) => r.status === col);
            return (
              <div key={col}>
                <div className="mb-2 flex justify-between px-1 text-[12px] font-semibold">
                  <span>{col}</span>
                  <span className="text-text-secondary">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((r) => (
                    <Card key={r.id} className="p-3">
                      <div className="font-mono text-[11px] text-text-secondary">{r.id}</div>
                      <div className="mt-1 font-medium">Room {r.room}</div>
                      <div className="text-[12px] text-text-secondary">{r.type}</div>
                      <div className="mt-2 text-[10px] text-text-secondary">{r.sla}</div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default GuestRequestsFeature;
