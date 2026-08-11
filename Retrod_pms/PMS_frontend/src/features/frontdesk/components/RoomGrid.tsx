import { Link } from "@tanstack/react-router";
import { Search, KeyRound } from "lucide-react";
import { Card, CardHeader, Button } from "@/components/ui/Primitives";

interface RoomGridProps {
  floors: number[];
  sample: (floor: number) => { num: string; status: string }[];
  colorFor: (status: string) => string;
}

export function RoomGrid({ floors, sample, colorFor }: RoomGridProps) {
  return (
    <Card>
      <CardHeader
        title="Assign room"
        hint="Floor 2 · Deluxe King available"
        action={
          <div className="relative w-full sm:w-auto">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-disabled" />
            <input
              className="h-8 w-full rounded-md border border-border bg-surface pl-8 pr-2 text-[12px] sm:w-44"
              placeholder="Search room…"
            />
          </div>
        }
      />
      <div className="space-y-4 p-5">
        {floors.map((f) => (
          <div key={f}>
            <div className="label-uppercase mb-2">Floor {f}</div>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {sample(f).map((r) => (
                <button
                  key={r.num}
                  className={`group relative aspect-[3/2.4] rounded-md border text-left transition hover:scale-[1.03] hover:shadow-e2 ${colorFor(
                    r.status,
                  )}`}
                  title={`${r.num} · ${r.status}`}
                >
                  <span className="absolute left-1.5 top-1 font-mono text-[11px] font-medium">
                    {r.num}
                  </span>
                  <span className="absolute bottom-1 right-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border-subtle bg-surface-2/40 px-5 py-3">
        <div className="text-[12px] text-text-secondary">
          Selected: <span className="font-mono text-text-primary">Room 204</span>
        </div>
        <Link to="/check-in">
          <Button size="sm">
            <KeyRound className="h-3.5 w-3.5" />
            Continue to wizard
          </Button>
        </Link>
      </div>
    </Card>
  );
}
export default RoomGrid;
