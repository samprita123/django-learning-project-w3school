import { Card, CardHeader, StatusBadge } from "@/components/ui/Primitives";
import { type HousekeepingRoom } from "@/types/pms";

export function HousekeepingListView({
  rooms,
  tone,
  onUpdateRoom,
}: {
  rooms: HousekeepingRoom[];
  tone: (s: string) => "success" | "warning" | "error" | "info" | "neutral" | "brand" | "dark";
  onUpdateRoom?: (room: HousekeepingRoom) => void;
}) {
  return (
    <Card>
      <CardHeader title="Room list" hint={`${rooms.length} rooms`} />
      <div className="space-y-2 p-3 md:hidden">
        {rooms.map((r) => (
          <div key={r.num} className="rounded-md border border-border-subtle bg-surface p-3">
            <div className="mb-1 flex items-center justify-between">
              <div className="font-mono text-[13px] font-semibold text-text-primary">{r.num}</div>
              <StatusBadge tone={tone(r.status)}>{r.status}</StatusBadge>
            </div>
            <div className="text-[11px] text-text-secondary">{r.type}</div>
            <div className="mt-1 text-[11px] text-text-primary">{r.staff}</div>
            <button
              type="button"
              onClick={() => onUpdateRoom?.(r)}
              className="mt-2 w-full rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-primary"
            >
              Update
            </button>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-2/40 text-left">
              {["Room", "Type", "Status", "Assigned", ""].map((h) => (
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
            {rooms.map((r) => (
              <tr key={r.num} className="border-b border-border-subtle hover:bg-surface-2/50">
                <td className="px-4 py-3 font-mono font-semibold text-text-primary">{r.num}</td>
                <td className="px-4 py-3 text-text-secondary">{r.type}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={tone(r.status)}>{r.status}</StatusBadge>
                </td>
                <td className="px-4 py-3 text-text-primary">{r.staff}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onUpdateRoom?.(r)}
                    className="text-[12px] font-medium text-primary hover:underline"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
