import { Plus } from "lucide-react";
import {
  PageHeader,
  KpiCard,
  Button,
  Card,
  CardHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import { useActivitySlotsQuery } from "@/services/mock/queries";

export function ActivitiesFeature() {
  const { data: activitySlots = [] } = useActivitySlotsQuery();

  const booked = activitySlots.reduce((a, s) => a + s.booked, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Activities & Excursions"
        description="Tours, experiences, and capacity management."
        actions={
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Book slot
          </Button>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Bookings today" value={String(booked)} accent="brand" />
          <KpiCard label="Capacity used" value="72%" accent="info" />
          <KpiCard label="Revenue · MTD" value="₹2.1L" accent="success" />
          <KpiCard label="No-shows" value="1" accent="warning" />
        </div>
        <Card>
          <CardHeader title="Activity calendar" />
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface-2/40 text-left">
                {["Activity", "Date", "Capacity", "Booked", "Price", "Availability"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activitySlots.map((a) => {
                const full = a.booked >= a.capacity;
                return (
                  <tr key={a.id} className="border-b border-border-subtle hover:bg-surface-2/50">
                    <td className="px-4 py-3 font-medium">{a.name}</td>
                    <td className="px-4 py-3">{a.date}</td>
                    <td className="px-4 py-3 font-mono">{a.capacity}</td>
                    <td className="px-4 py-3 font-mono">{a.booked}</td>
                    <td className="px-4 py-3 font-mono">₹{a.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={full ? "error" : "success"}>
                        {full ? "Full" : "Open"}
                      </StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
export default ActivitiesFeature;
