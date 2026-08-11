import { Plus } from "lucide-react";
import {
  PageHeader,
  KpiCard,
  Button,
  Card,
  CardHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import { useTransportTripsQuery } from "@/services/mock/queries";

export function TransportFeature() {
  const { data: transportTrips = [] } = useTransportTripsQuery();

  const today = transportTrips.filter((t) => t.status !== "Completed").length;

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Transportation"
        description="Airport transfers and scheduled rides."
        actions={
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Schedule ride
          </Button>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Pickups today" value={String(today)} accent="brand" />
          <KpiCard label="Drop-offs" value="2" accent="info" />
          <KpiCard label="Delayed" value="0" accent="success" />
          <KpiCard label="Revenue · MTD" value="₹1.2L" accent="success" />
        </div>
        <Card>
          <CardHeader title="Schedule" hint="Today & upcoming" />
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface-2/40 text-left">
                {["Trip", "Guest", "Pickup", "Flight", "Driver", "Status", ""].map((h) => (
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
              {transportTrips.map((t) => (
                <tr key={t.id} className="border-b border-border-subtle hover:bg-surface-2/50">
                  <td className="px-4 py-3 font-mono text-[12px]">{t.id}</td>
                  <td className="px-4 py-3 font-medium">{t.guest}</td>
                  <td className="px-4 py-3">{t.pickup}</td>
                  <td className="px-4 py-3 font-mono">{t.flight ?? "—"}</td>
                  <td className="px-4 py-3">{t.driver}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={
                        t.status === "Completed"
                          ? "success"
                          : t.status === "Delayed"
                            ? "error"
                            : "info"
                      }
                    >
                      {t.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" className="text-[12px] font-medium text-primary">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
export default TransportFeature;
