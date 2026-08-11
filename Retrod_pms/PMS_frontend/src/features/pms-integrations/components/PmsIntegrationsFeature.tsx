import { useEffect, useState } from "react";
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  KpiCard,
  StatusBadge,
} from "@/components/ui/Primitives";
import { RefreshCcw, ShieldCheck, KeyRound, RotateCcw } from "lucide-react";
import { useOtaSyncLogsQuery } from "@/services/mock/queries";
import { SyncJobTable, type SyncJobRow } from "@/features/channel-manager/components/SyncJobTable";
import { toast } from "sonner";

export function PmsIntegrationsFeature() {
  const { data: syncLogs = [] } = useOtaSyncLogsQuery();
  const [queue, setQueue] = useState<SyncJobRow[]>([]);
  const [tokenExpiry] = useState("2026-06-30 23:59");
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [retryPolicy, setRetryPolicy] = useState<"immediate" | "delayed" | "nightly">("immediate");
  const [transitionEvents, setTransitionEvents] = useState<
    Array<{ id: string; jobId: string; at: string; from: string; to: string; note: string }>
  >([]);

  const normalizedLogs: SyncJobRow[] = syncLogs.map((log) => ({
    ...log,
    type: "PMS Sync",
    records: 1,
    owner: log.status === "Error" ? "Ops" : log.status === "Warning" ? "Revenue" : "System",
    sla: log.status === "Error" ? "30m" : log.status === "Warning" ? "2h" : "Within SLA",
    message:
      log.status === "Error"
        ? "Sync failed due to upstream payload mismatch."
        : log.status === "Warning"
          ? "Completed with warning; parity verification needed."
          : "Completed successfully.",
  }));

  const nowLabel = () =>
    new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const seedTransitionsIfEmpty = () => {
    setTransitionEvents((prev) => {
      if (prev.length > 0) return prev;
      return normalizedLogs.map((row) => ({
        id: `seed-${row.id}`,
        jobId: row.id,
        at: row.at,
        from: "Queued",
        to: row.status,
        note: `${row.channel} initial sync import.`,
      }));
    });
  };

  useEffect(() => {
    if (normalizedLogs.length > 0) seedTransitionsIfEmpty();
  }, [normalizedLogs]);

  const failedQueue = (queue.length ? queue : normalizedLogs).filter(
    (log) => log.status === "Error" || log.status === "Failed" || log.status === "Warning",
  );

  const successCount = syncLogs.filter((log) => log.status === "Success").length;
  const warningCount = syncLogs.filter((log) => log.status === "Warning").length;
  const errorCount = syncLogs.filter((log) => log.status === "Error").length;

  const handleRetry = (row: SyncJobRow) => {
    setRetryingId(row.id);
    setTransitionEvents((prev) => [
      {
        id: `evt-${Date.now()}-start-${row.id}`,
        jobId: row.id,
        at: nowLabel(),
        from: row.status,
        to: "Retrying",
        note: `Manual retry started for ${row.channel}.`,
      },
      ...prev,
    ]);
    setTimeout(() => {
      setQueue((prev) => {
        const base = prev.length ? prev : normalizedLogs;
        return base.map((item) =>
          item.id === row.id
            ? {
                ...item,
                status: "Success",
                at: "Just now",
                message: "Retry completed successfully.",
              }
            : item,
        );
      });
      setTransitionEvents((prev) => [
        {
          id: `evt-${Date.now()}-done-${row.id}`,
          jobId: row.id,
          at: nowLabel(),
          from: "Retrying",
          to: "Success",
          note: "Retry completed successfully.",
        },
        ...prev,
      ]);
      setRetryingId(null);
      toast.success(`Retry completed for ${row.id}.`);
    }, 700);
  };

  const handleBulkRetry = () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one failed operation.");
      return;
    }
    const wait = retryPolicy === "immediate" ? 500 : retryPolicy === "delayed" ? 1100 : 1600;
    setRetryingId("bulk");
    const base = queue.length ? queue : normalizedLogs;
    const selectedRows = base.filter((item) => selectedIds.includes(item.id));
    setTransitionEvents((prev) => [
      ...selectedRows.map((row) => ({
        id: `evt-${Date.now()}-bulk-start-${row.id}`,
        jobId: row.id,
        at: nowLabel(),
        from: row.status,
        to: "Retrying",
        note: `Bulk retry started (${retryPolicy}).`,
      })),
      ...prev,
    ]);
    setTimeout(() => {
      setQueue((prev) => {
        const base = prev.length ? prev : normalizedLogs;
        return base.map((item) =>
          selectedIds.includes(item.id)
            ? {
                ...item,
                status: "Success",
                at:
                  retryPolicy === "nightly"
                    ? "Night batch"
                    : retryPolicy === "delayed"
                      ? "Queued + retried"
                      : "Just now",
                message: `Bulk retry (${retryPolicy}) completed successfully.`,
              }
            : item,
        );
      });
      setTransitionEvents((prev) => [
        ...selectedRows.map((row) => ({
          id: `evt-${Date.now()}-bulk-done-${row.id}`,
          jobId: row.id,
          at: nowLabel(),
          from: "Retrying",
          to: "Success",
          note: `Bulk retry finished (${retryPolicy}).`,
        })),
        ...prev,
      ]);
      toast.success(`Bulk retry completed for ${selectedIds.length} operation(s).`);
      setSelectedIds([]);
      setRetryingId(null);
    }, wait);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Integrations"
        title="PMS Integrations Hub"
        description="Manage PMS API token, synchronization health, and operational controls."
        actions={
          <Button size="sm">
            <RefreshCcw className="h-3.5 w-3.5" />
            Trigger full sync
          </Button>
        }
      />

      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Sync success" value={String(successCount)} accent="success" />
          <KpiCard label="Warnings" value={String(warningCount)} accent="warning" />
          <KpiCard label="Errors" value={String(errorCount)} accent="error" />
          <KpiCard label="Token status" value="Healthy" accent="info" />
        </div>

        <Card>
          <CardHeader title="Su Token Management" hint="Credential lifecycle controls" />
          <div className="space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-2/20 px-3 py-2">
              <div>
                <div className="text-[13px] font-medium text-text-primary">SU API token</div>
                <div className="text-[11px] text-text-secondary">
                  Last rotated: 2026-05-20 09:20
                </div>
              </div>
              <StatusBadge tone="success">Valid until {tokenExpiry}</StatusBadge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline">
                <KeyRound className="h-3.5 w-3.5" />
                Rotate token
              </Button>
              <Button size="sm" variant="outline">
                <ShieldCheck className="h-3.5 w-3.5" />
                Validate credentials
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Recent synchronization activity"
            hint="PMS-facing sync operations"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setQueue([]);
                  toast.success("Sync activity has been refreshed from source logs.");
                }}
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            }
          />
          <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-4 py-3 sm:px-5">
            <select
              className="h-8 rounded-md border border-border bg-surface px-2 text-[12px]"
              value={retryPolicy}
              onChange={(e) =>
                setRetryPolicy(e.target.value as "immediate" | "delayed" | "nightly")
              }
            >
              <option value="immediate">Retry policy: Immediate</option>
              <option value="delayed">Retry policy: Delayed (5 min)</option>
              <option value="nightly">Retry policy: Nightly batch</option>
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkRetry}
              disabled={retryingId === "bulk"}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {retryingId === "bulk" ? "Retrying selected..." : "Bulk retry selected"}
            </Button>
          </div>
          <SyncJobTable
            rows={queue.length ? queue : normalizedLogs}
            onAction={handleRetry}
            actionLabel={retryingId ? "Retrying..." : "Retry"}
            selectable
            selectedIds={selectedIds}
            onSelectAll={(checked) => {
              if (!checked) return setSelectedIds([]);
              const targets = (queue.length ? queue : normalizedLogs)
                .filter(
                  (row) =>
                    row.status === "Error" || row.status === "Warning" || row.status === "Failed",
                )
                .map((row) => row.id);
              setSelectedIds(targets);
            }}
            onSelectRow={(rowId, checked) => {
              setSelectedIds((prev) =>
                checked ? [...new Set([...prev, rowId])] : prev.filter((id) => id !== rowId),
              );
            }}
          />
        </Card>

        <Card>
          <CardHeader
            title="Failed operations queue"
            hint={`${failedQueue.length} items require action`}
          />
          <div className="space-y-2 p-4 sm:p-5">
            {failedQueue.map((item) => (
              <div
                key={`queue-${item.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-2/20 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-text-primary">
                    {item.id} · {item.channel}
                  </div>
                  <div className="text-[12px] text-text-secondary">
                    {item.message ?? item.action}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRetry(item)}
                  disabled={retryingId === item.id}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {retryingId === item.id ? "Retrying..." : "Retry now"}
                </Button>
              </div>
            ))}
            {failedQueue.length === 0 && (
              <div className="rounded-md border border-border-subtle bg-surface-2/20 px-3 py-2 text-[12px] text-text-secondary">
                No failed operations in queue.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Sync job transition timeline" hint="Status changes over time" />
          <div className="table-scroll-shadow overflow-x-auto">
            <table className="w-full min-w-[760px] text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["Time", "Job", "From", "To", "Note"].map((h) => (
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
                {transitionEvents.slice(0, 24).map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-border-subtle hover:bg-surface-2/30"
                  >
                    <td className="px-4 py-3 font-mono text-[12px] text-text-secondary">
                      {event.at}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px]">{event.jobId}</td>
                    <td className="px-4 py-3 text-text-secondary">{event.from}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        tone={
                          event.to === "Success"
                            ? "success"
                            : event.to === "Retrying"
                              ? "info"
                              : "warning"
                        }
                      >
                        {event.to}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{event.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PmsIntegrationsFeature;
