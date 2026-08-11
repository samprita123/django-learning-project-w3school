import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, RefreshCcw, AlertCircle } from "lucide-react";
import { Button, Card, CardHeader, KpiCard, StatusBadge } from "@/components/ui/Primitives";
import { suClient } from "@/services/su/client";
import type { SuChannel } from "@/types/channel-manager";
import { ChannelManagerShell } from "../ChannelManagerShell";
import { SyncJobTable } from "../SyncJobTable";
import { useSuData } from "../../hooks/useSuData";
import { ChannelFilterToolbar, fmtINR, LoadingBlock, ErrorBlock, mapTone } from "../shared";

export function ReservationSyncScreen() {
  const { data, loading, error, reload } = useSuData(() => suClient.getReservationSync());
  const [channel, setChannel] = useState<SuChannel | "All">("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [syncing, setSyncing] = useState(false);

  const filtered = useMemo(() => {
    let rows = data ?? [];
    if (channel !== "All") rows = rows.filter((r) => r.channel === channel);
    if (statusFilter !== "All") rows = rows.filter((r) => r.status === statusFilter);
    return rows;
  }, [data, channel, statusFilter]);

  const stats = useMemo(() => {
    const rows = data ?? [];
    return {
      synced: rows.filter((r) => r.status === "Synced").length,
      pending: rows.filter((r) => r.status === "Pending").length,
      conflicts: rows.filter((r) => r.status === "Conflict").length,
      failed: rows.filter((r) => r.status === "Failed").length,
    };
  }, [data]);

  const handlePull = async () => {
    setSyncing(true);
    try {
      await suClient.triggerSync({
        types: ["Reservations"],
        channels: channel === "All" ? undefined : [channel],
      });
      reload();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ChannelManagerShell
      title="Reservation Sync Center"
      description="Monitor OTA booking imports, conflicts, and PMS reservation linkage via SU."
      actions={
        <Button size="sm" onClick={handlePull} disabled={syncing}>
          <Download className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          Pull reservations
        </Button>
      }
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard label="Synced" value={String(stats.synced)} accent="success" />
            <KpiCard label="Pending" value={String(stats.pending)} accent="warning" />
            <KpiCard label="Conflicts" value={String(stats.conflicts)} accent="error" />
            <KpiCard label="Failed" value={String(stats.failed)} accent="error" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ChannelFilterToolbar
              channel={channel}
              onChannel={setChannel}
              onSync={handlePull}
              syncing={syncing}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-surface px-2 text-[12px]"
            >
              {["All", "Synced", "Pending", "Conflict", "Failed"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <Card>
            <CardHeader title="Reservation sync queue" hint="OTA ref ↔ PMS ref" />
            <div className="table-scroll-shadow overflow-x-auto">
              <table className="w-full min-w-[900px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    {[
                      "Channel",
                      "OTA ref",
                      "PMS ref",
                      "Guest",
                      "Check-in",
                      "Amount",
                      "Status",
                      "Synced at",
                      "Actions",
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
                  {filtered.map((r) => {
                    const isLinked = r.pmsRef && r.pmsRef !== "—";
                    return (
                      <tr key={r.id} className="border-b border-border-subtle hover:bg-surface-2/30">
                        <td className="px-4 py-3 font-medium">{r.channel}</td>
                        <td className="px-4 py-3 font-mono text-[12px]">{r.otaRef}</td>
                        <td className="px-4 py-3 font-mono text-[12px]">
                          {isLinked ? (
                            <Link
                              to="/reservations/$reservationId"
                              params={{ reservationId: r.pmsRef }}
                              className="text-primary hover:underline font-medium"
                            >
                              {r.pmsRef}
                            </Link>
                          ) : (
                            r.pmsRef
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isLinked && r.guest !== "Pending import" && r.guest !== "Import failed" ? (
                            <Link
                              to="/reservations/$reservationId"
                              params={{ reservationId: r.pmsRef }}
                              className="text-primary hover:underline font-medium"
                            >
                              {r.guest}
                            </Link>
                          ) : (
                            r.guest
                          )}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{r.checkIn}</td>
                      <td className="px-4 py-3 font-mono">{fmtINR(r.amount)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={mapTone(r.status)}>{r.status}</StatusBadge>
                        {r.error && (
                          <p className="mt-1 flex items-start gap-1 text-[11px] text-[var(--color-error)]">
                            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                            {r.error}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{r.syncedAt}</td>
                      <td className="px-4 py-3">
                        {(r.status === "Conflict" || r.status === "Failed") && (
                          <Button variant="outline" size="sm">
                            Resolve
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </ChannelManagerShell>
  );
}

export function SyncLogsScreen() {
  const { data, loading, error, reload } = useSuData(() => suClient.getSyncLogs());
  const [channel, setChannel] = useState<SuChannel | "All">("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = useMemo(() => {
    let rows = data ?? [];
    if (channel !== "All") rows = rows.filter((r) => r.channel === channel);
    if (typeFilter !== "All") rows = rows.filter((r) => r.type === typeFilter);
    return rows;
  }, [data, channel, typeFilter]);

  const errors = data?.filter((l) => l.status === "Error").length ?? 0;

  return (
    <ChannelManagerShell
      title="Channel Sync Logs"
      description="Audit trail of inventory, rate, reservation, content, and restriction sync jobs."
      actions={
        <Button variant="outline" size="sm" onClick={reload}>
          <RefreshCcw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      }
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard label="Total jobs" value={String(data.length)} accent="info" />
            <KpiCard
              label="Success"
              value={String(data.filter((l) => l.status === "Success").length)}
              accent="success"
            />
            <KpiCard
              label="Warnings"
              value={String(data.filter((l) => l.status === "Warning").length)}
              accent="warning"
            />
            <KpiCard label="Errors" value={String(errors)} accent="error" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ChannelFilterToolbar channel={channel} onChannel={setChannel} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-surface px-2 text-[12px]"
            >
              {[
                "All",
                "Inventory",
                "Rates",
                "Reservations",
                "Content",
                "Images",
                "Restrictions",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <Card>
            <CardHeader title="Sync log" hint="SU API job history" />
            <SyncJobTable rows={filtered} />
          </Card>
        </>
      )}
    </ChannelManagerShell>
  );
}
