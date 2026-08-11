import { type ReactNode } from "react";
import { Button, StatusBadge } from "@/components/ui/Primitives";
import { mapTone } from "./shared";

export interface SyncJobRow {
  id: string;
  channel: string;
  action: string;
  status: string;
  at: string;
  type?: string;
  records?: number;
  message?: string;
  owner?: string;
  sla?: string;
}

export function SyncJobTable({
  rows,
  hint,
  onAction,
  actionLabel = "Resolve",
  selectable = false,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  renderActions,
}: {
  rows: SyncJobRow[];
  hint?: string;
  onAction?: (row: SyncJobRow) => void;
  actionLabel?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectRow?: (rowId: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  renderActions?: (row: SyncJobRow) => ReactNode;
}) {
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));

  return (
    <div className="table-scroll-shadow overflow-x-auto">
      <table className="w-full min-w-[860px] text-[13px]">
        <thead>
          <tr className="border-b border-border bg-surface-2/40 text-left">
            {[
              selectable ? "" : null,
              "ID",
              "Channel",
              "Type",
              "Action",
              "Status",
              "Owner",
              "SLA",
              "Records",
              "Time",
              "Message",
              "Actions",
            ]
              .filter(Boolean)
              .map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                >
                  {selectable && h === "" ? (
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => onSelectAll?.(e.target.checked)}
                    />
                  ) : (
                    h
                  )}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((log) => (
            <tr key={log.id} className="border-b border-border-subtle hover:bg-surface-2/30">
              {selectable && (
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(log.id)}
                    onChange={(e) => onSelectRow?.(log.id, e.target.checked)}
                  />
                </td>
              )}
              <td className="px-4 py-2.5 font-mono text-[11px]">{log.id}</td>
              <td className="px-4 py-2.5">{log.channel}</td>
              <td className="px-4 py-2.5 text-text-secondary">{log.type ?? hint ?? "Sync"}</td>
              <td className="px-4 py-2.5">{log.action}</td>
              <td className="px-4 py-2.5">
                <StatusBadge tone={mapTone(log.status)}>{log.status}</StatusBadge>
              </td>
              <td className="px-4 py-2.5 text-text-secondary">{log.owner ?? "—"}</td>
              <td className="px-4 py-2.5 text-text-secondary">{log.sla ?? "—"}</td>
              <td className="px-4 py-2.5 font-mono">{log.records ?? "—"}</td>
              <td className="px-4 py-2.5 text-text-secondary">{log.at}</td>
              <td className="max-w-[220px] truncate px-4 py-2.5 text-[12px] text-text-secondary">
                {log.message ?? "—"}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex flex-wrap gap-2">
                  {onAction &&
                  (log.status === "Error" ||
                    log.status === "Failed" ||
                    log.status === "Warning") ? (
                    <Button variant="outline" size="sm" onClick={() => onAction(log)}>
                      {actionLabel}
                    </Button>
                  ) : null}
                  {renderActions?.(log)}
                  {!onAction && !renderActions ? (
                    <span className="text-text-disabled">—</span>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
