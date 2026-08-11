import { Card, StatusBadge } from "@/components/ui/Primitives";
import { type HousekeepingRoom } from "@/types/pms";

const columns = [
  {
    id: "assigned",
    label: "Assigned",
    match: (r: HousekeepingRoom) => r.staff !== "—" && r.status === "Dirty",
  },
  { id: "progress", label: "In progress", match: (r: HousekeepingRoom) => r.status === "Cleaning" },
  {
    id: "inspect",
    label: "Inspection",
    match: (r: HousekeepingRoom) => r.status === "Inspected" || r.status === "Ready",
  },
];

export function HousekeepingKanban({
  rooms,
  tone,
}: {
  rooms: HousekeepingRoom[];
  tone: (s: string) => "success" | "warning" | "error" | "info" | "neutral" | "brand" | "dark";
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {columns.map((col) => {
        const items = rooms.filter(col.match);
        return (
          <div key={col.id}>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[12px] font-semibold text-text-primary">{col.label}</span>
              <span className="rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-secondary">
                {items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((r) => (
                <Card key={r.num} className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[15px] font-semibold">{r.num}</span>
                    <StatusBadge tone={tone(r.status)}>{r.status}</StatusBadge>
                  </div>
                  <p className="mt-1 text-[11px] text-text-secondary">{r.type}</p>
                  <p className="mt-2 text-[11px] text-text-primary">→ {r.staff}</p>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
