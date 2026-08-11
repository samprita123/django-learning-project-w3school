import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { RefreshCcw, AlertTriangle, Link2, Calendar, FileText } from "lucide-react";
import { Button, Card, CardHeader, KpiCard, StatusBadge } from "@/components/ui/Primitives";
import { suClient } from "@/services/su/client";
import { ChannelManagerShell } from "../ChannelManagerShell";
import { useSuData } from "../../hooks/useSuData";
import { fmtINR, LoadingBlock, ErrorBlock, mapTone } from "../shared";

export function DashboardScreen() {
  const { data, loading, error, reload, meta } = useSuData(() => suClient.getDashboard());
  const { data: connections } = useSuData(() => suClient.getConnections());
  const { data: logs } = useSuData(() => suClient.getSyncLogs());
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await suClient.triggerSync({ types: ["Inventory", "Rates", "Reservations"] });
      reload();
    } finally {
      setSyncing(false);
    }
  };

  const m = data;
  const recentLogs = logs?.slice(0, 5) ?? [];
  const alerts = connections?.filter((c) => c.parity === "Drift" || c.status !== "Connected") ?? [];

  return (
    <ChannelManagerShell
      title="Channel Manager Dashboard"
      description="Distribution health, sync status, and OTA performance across all connected channels via SU APIs."
      actions={
        <Button size="sm" onClick={handleSync} disabled={syncing}>
          <RefreshCcw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Full sync"}
        </Button>
      }
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {m && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <KpiCard
              label="Channels live"
              value={`${m.channelsLive}/${m.channelsTotal}`}
              accent="brand"
            />
            <KpiCard
              label="Sync health"
              value={`${m.syncHealthPct}%`}
              delta={meta?.source === "mock" ? "Mock SU data" : "Live SU API"}
              accent="success"
            />
            <KpiCard
              label="Bookings · MTD"
              value={String(m.bookingsMtd)}
              delta="↑ 24 vs LM"
              accent="info"
            />
            <KpiCard label="Channel revenue" value={fmtINR(m.revenueMtd)} accent="brand" />
            <KpiCard label="Pending syncs" value={String(m.pendingSyncs)} accent="warning" />
            <KpiCard label="Parity alerts" value={String(m.parityAlerts)} accent="error" />
            <KpiCard label="Failed jobs · 24h" value={String(m.failedJobs24h)} accent="error" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Quick actions" hint="Common channel manager workflows" />
              <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "OTA Connections", to: "/channel-manager/connections", icon: Link2 },
                  { label: "Room mapping", to: "/channel-manager/room-mapping", icon: Link2 },
                  { label: "Availability", to: "/channel-manager/availability", icon: Calendar },
                  { label: "Sync logs", to: "/channel-manager/sync-logs", icon: FileText },
                ].map((a) => (
                  <Link
                    key={a.to}
                    to={a.to}
                    className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface-2/30 p-4 text-center text-[12px] font-medium text-text-primary transition hover:border-primary/30 hover:bg-primary-tint/30"
                  >
                    <a.icon className="h-4 w-4 text-primary" />
                    {a.label}
                  </Link>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Attention required" hint={`${alerts.length} items`} />
              <div className="divide-y divide-border-subtle">
                {alerts.length === 0 ? (
                  <p className="p-4 text-[13px] text-text-secondary">All channels aligned.</p>
                ) : (
                  alerts.map((c) => (
                    <div
                      key={c.channel}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />
                        <div>
                          <p className="text-[13px] font-medium text-text-primary">{c.channel}</p>
                          <p className="text-[11px] text-text-secondary">
                            {c.status !== "Connected"
                              ? c.status
                              : `Parity ${c.parityDelta ?? "drift"}`}
                          </p>
                        </div>
                      </div>
                      <StatusBadge tone={mapTone(c.status)}>{c.status}</StatusBadge>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="Recent sync activity" hint="Last 5 jobs via SU" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    {["Channel", "Type", "Action", "Status", "Records", "Time"].map((h) => (
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
                  {recentLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border-subtle hover:bg-surface-2/30"
                    >
                      <td className="px-4 py-2.5 font-medium">{log.channel}</td>
                      <td className="px-4 py-2.5 text-text-secondary">{log.type}</td>
                      <td className="px-4 py-2.5">{log.action}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge tone={mapTone(log.status)}>{log.status}</StatusBadge>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[12px]">{log.records}</td>
                      <td className="px-4 py-2.5 text-text-secondary">{log.at}</td>
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
