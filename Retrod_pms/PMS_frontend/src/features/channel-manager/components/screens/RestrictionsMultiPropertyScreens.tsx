import { useMemo, useState } from "react";
import { Ban, Plus } from "lucide-react";
import { Button, Card, CardHeader, KpiCard, StatusBadge } from "@/components/ui/Primitives";
import { suClient } from "@/services/su/client";
import type { SuChannel } from "@/types/channel-manager";
import { ChannelManagerShell } from "../ChannelManagerShell";
import { useSuData } from "../../hooks/useSuData";
import { ChannelFilterToolbar, LoadingBlock, ErrorBlock } from "../shared";

export function RestrictionsScreen() {
  const { data, loading, error, reload } = useSuData(() => suClient.getRestrictions());
  const [channel, setChannel] = useState<SuChannel | "All">("All");
  const [kindFilter, setKindFilter] = useState("All");

  const filtered = useMemo(() => {
    let rows = data ?? [];
    if (channel !== "All") rows = rows.filter((r) => r.channel === channel || r.channel === "All");
    if (kindFilter !== "All") rows = rows.filter((r) => r.kind === kindFilter);
    return rows;
  }, [data, channel, kindFilter]);

  const stats = useMemo(() => {
    const rows = data ?? [];
    return {
      stopSell: rows.filter((r) => r.kind === "Stop Sell").length,
      minStay: rows.filter((r) => r.kind === "Min Stay").length,
      ctaCtd: rows.filter((r) => r.kind === "CTA" || r.kind === "CTD").length,
    };
  }, [data]);

  return (
    <ChannelManagerShell
      title="Restrictions Management"
      description="Min/max stay, close-to-arrival, close-to-departure, and stop-sell rules synced to OTAs."
      actions={
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          Add restriction
        </Button>
      }
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard label="Active rules" value={String(data.length)} accent="brand" />
            <KpiCard label="Stop sell" value={String(stats.stopSell)} accent="error" />
            <KpiCard label="Min stay" value={String(stats.minStay)} accent="warning" />
            <KpiCard label="CTA / CTD" value={String(stats.ctaCtd)} accent="info" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ChannelFilterToolbar
              channel={channel}
              onChannel={setChannel}
              onSync={async () => {
                await suClient.triggerSync({ types: ["Restrictions"] });
                reload();
              }}
            />
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-surface px-2 text-[12px]"
            >
              {["All", "Min Stay", "Max Stay", "CTA", "CTD", "Stop Sell"].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>

          <Card>
            <CardHeader title="Restriction rules" hint="Pushed via SU restriction sync" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    {["Date", "Room type", "Channel", "Restriction", "Value", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-border-subtle hover:bg-surface-2/30">
                      <td className="px-4 py-3 font-mono">{r.date} May</td>
                      <td className="px-4 py-3">{r.roomType}</td>
                      <td className="px-4 py-3 text-text-secondary">{r.channel}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={r.kind === "Stop Sell" ? "error" : "warning"}>
                          <Ban className="mr-1 inline h-3 w-3" />
                          {r.kind}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 font-mono">{r.value ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </ChannelManagerShell>
  );
}

export function MultiPropertyScreen() {
  const { data, loading, error, reload } = useSuData(() => suClient.getMultiProperty());

  const totals = useMemo(() => {
    const rows = data ?? [];
    return {
      properties: rows.length,
      bookings: rows.reduce((a, r) => a + r.bookingsMtd, 0),
      revenue: rows.reduce((a, r) => a + r.revenueMtd, 0),
      errors: rows.reduce((a, r) => a + r.errors, 0),
    };
  }, [data]);

  return (
    <ChannelManagerShell
      title="Multi-Property Channel Dashboard"
      description="Portfolio-wide channel health, sync status, and revenue across all properties."
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard label="Properties" value={String(totals.properties)} accent="brand" />
            <KpiCard label="Total bookings" value={String(totals.bookings)} accent="info" />
            <KpiCard
              label="Portfolio revenue"
              value={`₹${(totals.revenue / 100000).toFixed(1)} L`}
              accent="success"
            />
            <KpiCard label="Sync errors" value={String(totals.errors)} accent="error" />
          </div>

          <Card>
            <CardHeader title="Property portfolio" hint="SU multi-property channel overview" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    {[
                      "Property",
                      "City",
                      "Channels live",
                      "Sync health",
                      "Bookings",
                      "Revenue",
                      "Errors",
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
                  {data.map((p) => (
                    <tr
                      key={p.propertyId}
                      className="border-b border-border-subtle hover:bg-surface-2/30"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.propertyName}</p>
                        <p className="font-mono text-[11px] text-text-secondary">{p.propertyId}</p>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{p.city}</td>
                      <td className="px-4 py-3 font-mono">{p.channelsLive}/8</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-surface-2">
                            <div
                              className={`h-full rounded-full ${p.syncHealth >= 95 ? "bg-[var(--color-success)]" : p.syncHealth >= 90 ? "bg-[var(--color-warning)]" : "bg-[var(--color-error)]"}`}
                              style={{ width: `${p.syncHealth}%` }}
                            />
                          </div>
                          <span className="font-mono text-[12px]">{p.syncHealth}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono">{p.bookingsMtd}</td>
                      <td className="px-4 py-3 font-mono">
                        ₹{(p.revenueMtd / 100000).toFixed(1)} L
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={p.errors === 0 ? "success" : "error"}>
                          {p.errors}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </ChannelManagerShell>
  );
}
