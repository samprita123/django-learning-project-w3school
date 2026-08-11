import { useEffect, useState } from "react";
import { Button, StatusBadge } from "@/components/ui/Primitives";
import { ROOM_TYPE_OPTIONS } from "@/features/rate-plans/lib/constants";
import {
  AVAILABILITY_STATUS_LABEL,
  RESTRICTION_LABEL,
  RESTRICTIONS,
} from "@/features/availability/lib/constants";
import type { AvailabilityCell, AvailabilityRestriction, AvailabilityStatus } from "@/types/pms";

interface AvailabilityCellDrawerProps {
  open: boolean;
  cell: AvailabilityCell | null;
  onClose: () => void;
  onSave: (cell: AvailabilityCell) => void;
  readOnly?: boolean;
}

export function AvailabilityCellDrawer({
  open,
  cell,
  onClose,
  onSave,
  readOnly,
}: AvailabilityCellDrawerProps) {
  const [status, setStatus] = useState<AvailabilityStatus>("open");
  const [restrictions, setRestrictions] = useState<AvailabilityRestriction[]>([]);

  useEffect(() => {
    if (cell) {
      setStatus(cell.status);
      setRestrictions(cell.restrictions);
    }
  }, [cell]);

  if (!open || !cell) return null;

  const roomName = ROOM_TYPE_OPTIONS.find((r) => r.id === cell.roomTypeId)?.name ?? cell.roomTypeId;

  const toggleRestriction = (key: AvailabilityRestriction) => {
    setRestrictions((prev) =>
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-sm flex-col border-l border-border bg-surface shadow-e3">
        <div className="border-b border-border px-5 py-4">
          <div className="label-uppercase text-text-secondary">Availability cell</div>
          <div className="font-display text-lg font-semibold text-text-primary">{roomName}</div>
          <div className="text-[12px] text-text-secondary">{cell.date}</div>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div>
            <div className="mb-2 text-[12px] font-medium text-text-secondary">Status</div>
            <div className="flex gap-2">
              {(["open", "closed"] as AvailabilityStatus[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={readOnly}
                  onClick={() => setStatus(value)}
                  className={`rounded-md border px-3 py-2 text-[12px] ${
                    status === value
                      ? "border-primary bg-primary-tint/40 text-primary"
                      : "border-border-subtle bg-surface text-text-secondary"
                  }`}
                >
                  {AVAILABILITY_STATUS_LABEL[value]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-[12px] font-medium text-text-secondary">Restrictions</div>
            <div className="flex flex-wrap gap-2">
              {RESTRICTIONS.map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleRestriction(key)}
                  className={`rounded-md border px-3 py-2 text-[12px] ${
                    restrictions.includes(key)
                      ? "border-primary bg-primary-tint/40 text-primary"
                      : "border-border-subtle bg-surface text-text-secondary"
                  }`}
                >
                  {RESTRICTION_LABEL[key]}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-2/40 p-3 text-[12px]">
            <div className="flex justify-between">
              <span className="text-text-secondary">Sold / Total</span>
              <span className="font-mono">
                {cell.sold}/{cell.total}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <StatusBadge tone={status === "open" ? "success" : "neutral"}>
                {AVAILABILITY_STATUS_LABEL[status]}
              </StatusBadge>
              {restrictions.map((r) => (
                <StatusBadge key={r} tone={r === "stop_sell" ? "error" : "warning"}>
                  {RESTRICTION_LABEL[r]}
                </StatusBadge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          {!readOnly && (
            <Button
              size="sm"
              onClick={() =>
                onSave({
                  ...cell,
                  status,
                  restrictions,
                  updatedAt: new Date().toISOString(),
                  updatedBy: "Current user",
                })
              }
            >
              Save cell
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
