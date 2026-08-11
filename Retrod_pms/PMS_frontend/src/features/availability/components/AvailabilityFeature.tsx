import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  KpiCard,
  Button,
  Card,
  CardHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import { GuardedRoute } from "@/features/auth/components/GuardedRoute";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  AvailabilityBulkApplyModal,
  type BulkApplyPayload,
} from "@/features/availability/components/AvailabilityBulkApplyModal";
import { AvailabilityCellDrawer } from "@/features/availability/components/AvailabilityCellDrawer";
import { applyBulkAvailability } from "@/features/availability/lib/bulk-apply";
import {
  AVAILABILITY_STATUS_LABEL,
  RESTRICTION_LABEL,
} from "@/features/availability/lib/constants";
import {
  queueAvailabilitySuSync,
  simulateAvailabilitySyncJobCompletion,
} from "@/features/availability/lib/su-sync";
import { ROOM_TYPE_OPTIONS } from "@/features/rate-plans/lib/constants";
import { listSuAvailabilitySyncJobs } from "@/services/su/availability-store";
import type { SuAvailabilitySyncJob } from "@/types/channel-manager";
import {
  useAvailabilityCellsQuery,
  useSaveAvailabilityCellsMutation,
} from "@/services/mock/queries";
import type { AvailabilityCell } from "@/types/pms";

function cellTone(cell: AvailabilityCell) {
  if (cell.status === "closed" || cell.restrictions.includes("stop_sell")) return "error" as const;
  if (cell.restrictions.length > 0) return "warning" as const;
  const free = cell.total - cell.sold;
  if (free === 0) return "error" as const;
  if (free / cell.total < 0.2) return "warning" as const;
  return "success" as const;
}

function cellSummary(cell: AvailabilityCell) {
  const parts: string[] = [AVAILABILITY_STATUS_LABEL[cell.status]];
  for (const r of cell.restrictions) parts.push(RESTRICTION_LABEL[r]);
  return parts.join(" · ");
}

export function AvailabilityFeature() {
  const { can, logAuditEvent, user } = useAuth();
  const canManage = can("revenue.editrates");
  const { data: cells = [] } = useAvailabilityCellsQuery();
  const saveMutation = useSaveAvailabilityCellsMutation();

  const [roomFilter, setRoomFilter] = useState("All");
  const [selectedCell, setSelectedCell] = useState<AvailabilityCell | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [syncJobs, setSyncJobs] = useState<SuAvailabilitySyncJob[]>(() =>
    listSuAvailabilitySyncJobs(),
  );
  const [syncing, setSyncing] = useState(false);

  const refreshSyncJobs = () => setSyncJobs(listSuAvailabilitySyncJobs());

  const dates = useMemo(() => [...new Set(cells.map((c) => c.date))].sort(), [cells]);

  const roomTypes = useMemo(() => {
    const ids = [...new Set(cells.map((c) => c.roomTypeId))];
    return ids
      .map((id) => ROOM_TYPE_OPTIONS.find((r) => r.id === id))
      .filter((r): r is (typeof ROOM_TYPE_OPTIONS)[number] => !!r);
  }, [cells]);

  const filteredRoomTypes =
    roomFilter === "All" ? roomTypes : roomTypes.filter((r) => r.id === roomFilter);

  const kpis = useMemo(() => {
    let open = 0;
    let closed = 0;
    let stopSell = 0;
    let cta = 0;
    let ctd = 0;
    for (const cell of cells) {
      if (cell.status === "open") open += 1;
      else closed += 1;
      if (cell.restrictions.includes("stop_sell")) stopSell += 1;
      if (cell.restrictions.includes("cta")) cta += 1;
      if (cell.restrictions.includes("ctd")) ctd += 1;
    }
    return { open, closed, stopSell, cta, ctd };
  }, [cells]);

  const openCell = (cell: AvailabilityCell) => {
    setSelectedCell(cell);
    setDrawerOpen(true);
  };

  const persistCells = (next: AvailabilityCell[]) => {
    saveMutation.mutate(next);
  };

  const handleSaveCell = (updated: AvailabilityCell) => {
    const next = cells.map((c) => (c.id === updated.id ? updated : c));
    persistCells(next);
    logAuditEvent(
      "Availability cell updated",
      `${updated.date} · ${updated.roomTypeId}`,
      cellSummary(updated),
    );
    toast.success("Availability updated");
    setDrawerOpen(false);
  };

  const handleBulkApply = (payload: BulkApplyPayload) => {
    const { next, affected } = applyBulkAvailability(cells, {
      ...payload,
      updatedBy: user?.name ?? "Revenue Manager",
    });
    if (affected === 0) {
      toast.error("No cells matched the selected range and room types.");
      return;
    }
    persistCells(next);
    logAuditEvent(
      "Availability bulk apply",
      `${payload.dateFrom} → ${payload.dateTo}`,
      `${affected} cells · ${AVAILABILITY_STATUS_LABEL[payload.status]}`,
    );
    toast.success(`Updated ${affected} availability cells`);
    setBulkOpen(false);
  };

  const handleSyncToCm = async () => {
    if (!cells.length) return;
    setSyncing(true);
    try {
      const { jobId } = await queueAvailabilitySuSync(cells);
      refreshSyncJobs();
      logAuditEvent("Availability SU sync queued", "Channel Manager", `Job ${jobId}`);
      toast.success(`Sync queued · ${jobId}`);
      simulateAvailabilitySyncJobCompletion(jobId, (success) => {
        refreshSyncJobs();
        if (success) toast.success(`SU sync completed (${jobId})`);
        else toast.error(`SU sync failed (${jobId})`);
      });
    } catch {
      toast.error("Failed to queue availability sync.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <GuardedRoute
      permission="revenue.view"
      title="Availability access required"
      description="You need revenue view permission to manage availability and selling restrictions."
    >
      <div>
        <PageHeader
          eyebrow="Commercial"
          title="Availability Management"
          description="Control open/closed status and selling restrictions (Stop Sell, CTA, CTD) by room type and date."
          actions={
            <>
              <Link
                to="/channel-manager/availability"
                className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-[12px] font-medium text-primary hover:bg-surface-2"
              >
                OTA calendar
              </Link>
              {canManage ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
                    <Filter className="h-3.5 w-3.5" />
                    Bulk apply
                  </Button>
                  <Button size="sm" onClick={handleSyncToCm} disabled={syncing}>
                    <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                    Sync to CM
                  </Button>
                </>
              ) : null}
            </>
          }
        />

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <KpiCard label="Open cells" value={String(kpis.open)} accent="success" />
            <KpiCard label="Closed" value={String(kpis.closed)} accent="info" />
            <KpiCard label="Stop sell" value={String(kpis.stopSell)} accent="error" />
            <KpiCard label="CTA" value={String(kpis.cta)} accent="warning" />
            <KpiCard label="CTD" value={String(kpis.ctd)} accent="info" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-surface px-2 text-[12px]"
            >
              <option value="All">All room types</option>
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5">
              <button type="button" className="rounded p-1 text-text-secondary hover:bg-surface-2">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 text-[12px] font-medium text-text-primary">
                {dates[0] ?? "—"} → {dates[dates.length - 1] ?? "—"}
              </span>
              <button type="button" className="rounded p-1 text-text-secondary hover:bg-surface-2">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <Card>
            <CardHeader
              title="Availability calendar"
              hint="Click a cell to edit status and restrictions"
            />
            <div className="overflow-x-auto p-4 sm:p-5">
              <div className="min-w-[900px]">
                <div
                  className="grid gap-px bg-border-subtle"
                  style={{
                    gridTemplateColumns: `160px repeat(${dates.length}, minmax(56px, 1fr))`,
                  }}
                >
                  <div className="bg-surface px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                    Room type
                  </div>
                  {dates.map((date) => (
                    <div
                      key={date}
                      className="bg-surface px-1 py-2 text-center text-[10px] font-medium text-text-secondary"
                    >
                      {date.slice(8)}
                    </div>
                  ))}
                  {filteredRoomTypes.map((rt) => (
                    <div key={rt.id} className="contents">
                      <div className="bg-surface px-3 py-2 text-[12px] font-medium text-text-primary">
                        {rt.name}
                      </div>
                      {dates.map((date) => {
                        const cell = cells.find((c) => c.roomTypeId === rt.id && c.date === date);
                        if (!cell) {
                          return (
                            <div
                              key={date}
                              className="bg-surface px-1 py-2 text-center text-[11px] text-text-disabled"
                            >
                              —
                            </div>
                          );
                        }
                        const tone = cellTone(cell);
                        const free = cell.total - cell.sold;
                        return (
                          <div key={date} className="bg-surface px-1 py-2">
                            <button
                              type="button"
                              onClick={() => openCell(cell)}
                              className={`w-full rounded px-1 py-2 text-center text-[10px] transition hover:ring-2 hover:ring-primary/20 ${
                                tone === "error"
                                  ? "bg-[oklch(0.985_0.03_27)] text-[var(--color-error)]"
                                  : tone === "warning"
                                    ? "bg-[oklch(0.985_0.04_70)] text-[var(--color-warning)]"
                                    : "bg-[oklch(0.96_0.05_152)] text-[var(--color-success)]"
                              }`}
                            >
                              <div className="font-mono font-medium">
                                {free}/{cell.total}
                              </div>
                              <div className="mt-0.5 truncate text-[9px] opacity-80">
                                {cellSummary(cell)}
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 border-t border-border-subtle px-5 py-3 text-[11px] text-text-secondary">
              <StatusBadge tone="success">Open</StatusBadge>
              <StatusBadge tone="neutral">Closed</StatusBadge>
              <StatusBadge tone="error">Stop Sell</StatusBadge>
              <StatusBadge tone="warning">CTA / CTD</StatusBadge>
            </div>
          </Card>

          {syncJobs.length > 0 ? (
            <Card>
              <CardHeader
                title="SU sync jobs"
                hint="Recent availability pushes to channel manager"
              />
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-2/40 text-left">
                      {["Job ID", "Cells", "Status", "Queued", "Completed"].map((h) => (
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
                    {syncJobs.slice(0, 8).map((job) => (
                      <tr key={job.id} className="border-b border-border-subtle">
                        <td className="px-4 py-3 font-mono text-[11px]">{job.id}</td>
                        <td className="px-4 py-3 font-mono text-[11px]">{job.recordsPushed}</td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            tone={
                              job.status === "success"
                                ? "success"
                                : job.status === "error"
                                  ? "error"
                                  : "warning"
                            }
                          >
                            {job.status.replace("_", " ")}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-text-secondary">
                          {new Date(job.queuedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-text-secondary">
                          {job.completedAt ? new Date(job.completedAt).toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}
        </div>

        <AvailabilityCellDrawer
          open={drawerOpen}
          cell={selectedCell}
          onClose={() => setDrawerOpen(false)}
          onSave={handleSaveCell}
          readOnly={!canManage}
        />

        <AvailabilityBulkApplyModal
          open={bulkOpen}
          defaultDateFrom={dates[0] ?? ""}
          defaultDateTo={dates[dates.length - 1] ?? ""}
          onClose={() => setBulkOpen(false)}
          onApply={handleBulkApply}
        />
      </div>
    </GuardedRoute>
  );
}
