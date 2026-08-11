import { useState } from "react";
import { Plus } from "lucide-react";
import {
  PageHeader,
  KpiCard,
  Button,
  Card,
  CardHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import { useConciergeRequestsQuery } from "@/services/mock/queries";

export function ConciergeFeature() {
  const { data: conciergeRequests = [] } = useConciergeRequestsQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    conciergeRequests.find((request) => request.id === selectedId) ?? conciergeRequests[0] ?? null;

  const open = conciergeRequests.filter(
    (r) => r.status === "New" || r.status === "Confirmed",
  ).length;

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Concierge"
        description="Restaurant bookings, tickets, and guest services."
        actions={
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            New request
          </Button>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Open requests" value={String(open)} accent="brand" />
          <KpiCard label="Completed today" value="1" accent="success" />
          <KpiCard label="Partner commissions" value="₹12k" accent="info" />
          <KpiCard label="Guest rating" value="4.9" accent="success" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <Card>
            <CardHeader title="Request queue" />
            <ul className="divide-y divide-border-subtle">
              {conciergeRequests.map((r, i) => (
                <li
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`cursor-pointer px-4 py-3 hover:bg-surface-2/50 ${
                    (selected ? selected.id === r.id : i === 0) ? "bg-primary-tint/30" : ""
                  }`}
                >
                  <div className="font-medium text-[13px]">
                    {r.guest} · {r.room}
                  </div>
                  <div className="text-[12px] text-text-secondary">{r.type}</div>
                  <div className="mt-1">
                    <StatusBadge
                      tone={
                        r.status === "Completed"
                          ? "success"
                          : r.status === "New"
                            ? "warning"
                            : "info"
                      }
                    >
                      {r.status}
                    </StatusBadge>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="Request detail" hint={selected?.datetime ?? "—"} />
            <div className="space-y-3 p-5 text-[13px]">
              <p>
                <span className="text-text-secondary">Guest:</span> {selected?.guest ?? "—"}
              </p>
              <p>
                <span className="text-text-secondary">Service:</span> {selected?.type ?? "—"}
              </p>
              <div className="flex gap-2 pt-2">
                <Button size="sm">Confirm with vendor</Button>
                <Button size="sm" variant="outline">
                  Bill to folio
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default ConciergeFeature;
