import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  KpiCard,
  StatusBadge,
  Button,
} from "@/components/ui/Primitives";
import {
  useOtaBreakdownQuery,
  useOtaMappingsQuery,
  useOtaSyncLogsQuery,
} from "@/services/mock/queries";

const channels = [
  { name: "Booking.com", live: true, parity: "Aligned", commission: "15%" },
  { name: "Expedia", live: true, parity: "Aligned", commission: "18%" },
  { name: "Agoda", live: true, parity: "Drift · -3%", commission: "16%" },
  { name: "Airbnb", live: false, parity: "Aligned", commission: "13%" },
  { name: "Direct", live: true, parity: "Reference", commission: "0%" },
];

type Tab = "performance" | "mapping" | "sync";

const mapTone = (s: string) =>
  s === "Mapped" || s === "Reference" ? "success" : s === "Mismatch" ? "warning" : "error";

export function OtaFeature() {
  const { data: otaBreakdown = [] } = useOtaBreakdownQuery();
  const { data: otaMappings = [] } = useOtaMappingsQuery();
  const { data: otaSyncLogs = [] } = useOtaSyncLogsQuery();

  const [tab, setTab] = useState<Tab>("performance");
  const parityAlerts = channels.filter((c) => c.parity.includes("Drift")).length;

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="OTA & Channel Manager"
        description="Distribution health across all connected channels."
        actions={
          <Button size="sm">
            <RefreshCcw className="h-3.5 w-3.5" />
            Sync now
          </Button>
        }
      />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <KpiCard label="Channel bookings · MTD" value="352" delta="↑ 24" accent="info" />
          <KpiCard label="Channel revenue" value="₹46.8 L" accent="brand" />
          <KpiCard label="Avg commission" value="14.2%" accent="warning" />
          <KpiCard label="Sync health" value="100%" delta="All channels live" accent="success" />
          <KpiCard
            label="Parity alerts"
            value={String(parityAlerts)}
            deltaTone="error"
            accent="error"
          />
        </div>

        <div className="flex rounded-md border border-border bg-surface p-0.5 text-[12px] w-fit">
          {(
            [
              { id: "performance" as const, label: "Performance" },
              { id: "mapping" as const, label: "Mapping" },
              { id: "sync" as const, label: "Sync log" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded px-3 py-1 transition ${
                tab === t.id
                  ? "bg-foreground text-background"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "performance" && (
          <Card>
            <CardHeader title="Channel performance" hint="Month to date" />
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {[
                    "Channel",
                    "Status",
                    "Bookings",
                    "Revenue",
                    "Avg ADR",
                    "Parity",
                    "Commission",
                  ].map((h) => (
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
                {channels.map((c) => {
                  const ota = otaBreakdown.find((o) => o.source === c.name);
                  return (
                    <tr
                      key={c.name}
                      className="border-b border-border-subtle hover:bg-surface-2/50"
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">{c.name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={c.live ? "success" : "neutral"}>
                          {c.live ? "Live" : "Paused"}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 font-mono text-text-primary">
                        {ota?.bookings ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-text-primary">
                        {ota ? `₹${(ota.revenue / 100000).toFixed(1)}L` : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-text-secondary">
                        {ota ? `₹${Math.round(ota.revenue / ota.bookings).toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          tone={
                            c.parity.includes("Drift")
                              ? "warning"
                              : c.parity === "Reference"
                                ? "brand"
                                : "success"
                          }
                        >
                          {c.parity}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 font-mono text-text-secondary">{c.commission}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}

        {tab === "mapping" && (
          <Card>
            <CardHeader title="Room type mapping" hint="Channel ↔ PMS inventory" />
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    {["Room type", "Booking.com", "Expedia", "Agoda", "Direct"].map((h) => (
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
                  {otaMappings.map((m) => (
                    <tr
                      key={m.roomType}
                      className="border-b border-border-subtle hover:bg-surface-2/50"
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">{m.roomType}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={mapTone(m.bookingCom)}>{m.bookingCom}</StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={mapTone(m.expedia)}>{m.expedia}</StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={mapTone(m.agoda)}>{m.agoda}</StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone="brand">{m.direct}</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === "sync" && (
          <Card>
            <CardHeader title="Sync log" hint="Last 24 hours" />
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["ID", "Channel", "Action", "Status", "Time"].map((h) => (
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
                {otaSyncLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border-subtle hover:bg-surface-2/50">
                    <td className="px-4 py-3 font-mono text-[12px]">{log.id}</td>
                    <td className="px-4 py-3 font-medium">{log.channel}</td>
                    <td className="px-4 py-3 text-text-secondary">{log.action}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        tone={
                          log.status === "Success"
                            ? "success"
                            : log.status === "Warning"
                              ? "warning"
                              : "error"
                        }
                      >
                        {log.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{log.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
export default OtaFeature;
