import { useState } from "react";
import { Button } from "@/components/ui/Primitives";
import { ROOM_TYPE_OPTIONS } from "@/features/rate-plans/lib/constants";
import {
  AVAILABILITY_STATUS_LABEL,
  RESTRICTION_LABEL,
  RESTRICTIONS,
} from "@/features/availability/lib/constants";
import type { AvailabilityRestriction, AvailabilityStatus } from "@/types/pms";

export type BulkApplyPayload = {
  dateFrom: string;
  dateTo: string;
  roomTypeIds: string[];
  status: AvailabilityStatus;
  restrictions: AvailabilityRestriction[];
};

interface AvailabilityBulkApplyModalProps {
  open: boolean;
  defaultDateFrom: string;
  defaultDateTo: string;
  onClose: () => void;
  onApply: (payload: BulkApplyPayload) => void;
}

export function AvailabilityBulkApplyModal({
  open,
  defaultDateFrom,
  defaultDateTo,
  onClose,
  onApply,
}: AvailabilityBulkApplyModalProps) {
  const [dateFrom, setDateFrom] = useState(defaultDateFrom);
  const [dateTo, setDateTo] = useState(defaultDateTo);
  const [roomTypeIds, setRoomTypeIds] = useState<string[]>(
    ROOM_TYPE_OPTIONS.map((room) => room.id),
  );
  const [status, setStatus] = useState<AvailabilityStatus>("open");
  const [restrictions, setRestrictions] = useState<AvailabilityRestriction[]>([]);

  if (!open) return null;

  const toggleRoom = (id: string) => {
    setRoomTypeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleRestriction = (key: AvailabilityRestriction) => {
    setRestrictions((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface shadow-e3">
        <div className="border-b border-border px-5 py-4">
          <div className="font-display text-lg font-semibold text-text-primary">
            Bulk apply availability
          </div>
          <div className="text-[12px] text-text-secondary">
            Set status and restrictions across a date range and room types.
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-[12px] font-medium text-text-secondary">From</span>
              <input
                type="date"
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[12px] font-medium text-text-secondary">To</span>
              <input
                type="date"
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </label>
          </div>
          <div>
            <div className="mb-2 text-[12px] font-medium text-text-secondary">Room types</div>
            <div className="flex flex-wrap gap-2">
              {ROOM_TYPE_OPTIONS.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => toggleRoom(room.id)}
                  className={`rounded-md border px-3 py-1.5 text-[12px] ${
                    roomTypeIds.includes(room.id)
                      ? "border-primary bg-primary-tint/40 text-primary"
                      : "border-border-subtle bg-surface text-text-secondary"
                  }`}
                >
                  {room.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-[12px] font-medium text-text-secondary">Status</div>
            <div className="flex gap-2">
              {(["open", "closed"] as AvailabilityStatus[]).map((value) => (
                <button
                  key={value}
                  type="button"
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
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() =>
              onApply({
                dateFrom,
                dateTo,
                roomTypeIds,
                status,
                restrictions,
              })
            }
          >
            Apply to calendar
          </Button>
        </div>
      </div>
    </div>
  );
}
