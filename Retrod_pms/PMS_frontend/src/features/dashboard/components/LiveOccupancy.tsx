import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardHeader } from "@/components/ui/Primitives";

interface LiveOccupancyProps {
  occPct: number;
  occupied: number;
  totalRooms: number;
  occupancyByType: any[];
}

export function LiveOccupancy({ occPct, occupied, totalRooms, occupancyByType }: LiveOccupancyProps) {
  return (
    <Card>
      <CardHeader
        title="Live Occupancy"
        hint="Auto-refresh · 60s"
        action={
          <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
            Live
          </span>
        }
      />
      <div className="flex items-center gap-5 px-5 py-4">
        <div className="relative h-[140px] w-[140px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={[{ v: occPct }, { v: 100 - occPct }]}
                dataKey="v"
                innerRadius={52}
                outerRadius={68}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                <Cell fill="var(--color-primary)" />
                <Cell fill="var(--color-surface-2)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display text-[28px] font-semibold leading-none text-text-primary">
              {occPct}%
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-text-disabled">
              {occupied}/{totalRooms} rooms
            </div>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5 text-[12px]">
          {occupancyByType.map((t) => {
            const pct = Math.round((t.occupied / t.total) * 100);
            return (
              <li key={t.type}>
                <div className="flex justify-between">
                  <span className="text-text-secondary">{t.type}</span>
                  <span className="font-mono text-text-primary">
                    {t.occupied}/{t.total}
                  </span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
