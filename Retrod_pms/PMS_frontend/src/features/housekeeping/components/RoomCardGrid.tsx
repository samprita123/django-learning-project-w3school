import { useState, useMemo, useEffect } from "react";
import { StatusBadge } from "@/components/ui/Primitives";
import { type HousekeepingRoom } from "@/types/pms";

interface RoomCardGridProps {
  housekeepingRooms: HousekeepingRoom[];
  tone: (status: string) => "success" | "warning" | "error" | "info" | "neutral" | "brand" | "dark";
  cardBg: (status: string) => string;
  onUpdateRoom?: (room: HousekeepingRoom) => void;
}

export function RoomCardGrid({ housekeepingRooms, tone, cardBg, onUpdateRoom }: RoomCardGridProps) {
  const floors = useMemo(() => {
    const uniqueFloors = Array.from(new Set(housekeepingRooms.map((r) => r.floor)));
    return uniqueFloors.sort();
  }, [housekeepingRooms]);

  const [selectedFloor, setSelectedFloor] = useState<string>("Floor 1");

  useEffect(() => {
    if (floors.length > 0 && !floors.includes(selectedFloor)) {
      setSelectedFloor(floors[0]);
    }
  }, [floors, selectedFloor]);

  const filteredRooms = housekeepingRooms.filter(r => r.floor === selectedFloor);

  return (
    <div className="space-y-6">
      {/* Floor tabs */}
      <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-1 w-fit">
        {floors.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFloor(f)}
            className={`rounded px-3 py-1.5 text-[12px] font-medium transition ${
              selectedFloor === f
                ? "bg-foreground text-background"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-3 text-[11px] text-text-disabled">
          Showing {selectedFloor} · {filteredRooms.length} rooms
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filteredRooms.map((r) => (
          <div
            key={r.num}
            onClick={() => onUpdateRoom?.(r)}
            className={`cursor-pointer rounded-md border border-l-[3px] border-border bg-surface p-3 shadow-e1 transition hover:scale-[1.03] ${cardBg(
              r.status,
            )}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[16px] font-semibold text-text-primary">{r.num}</div>
              </div>
              <StatusBadge tone={tone(r.status)}>{r.status}</StatusBadge>
            </div>
            <div className="mt-3 border-t border-border-subtle pt-2 text-[11px]">
              <span className="text-text-secondary">Assigned: </span>
              <span className="font-medium text-text-primary">{r.staff}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default RoomCardGrid;
