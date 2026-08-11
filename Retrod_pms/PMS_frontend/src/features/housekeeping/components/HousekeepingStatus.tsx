import { Card } from "@/components/ui/Primitives";

interface StatsProps {
  stats: {
    total: number;
    clean: number;
    dirty: number;
    inspected: number;
  };
}

export function HousekeepingStatus({ stats }: StatsProps) {
  return (
    <Card>
      <div className="grid grid-cols-2 divide-x divide-border-subtle md:grid-cols-4">
        {[
          { l: "Total Rooms", v: String(stats?.total || 0), c: "text-text-primary" },
          { l: "Clean", v: String(stats?.clean || 0), c: "text-[var(--color-success)]" },
          { l: "Dirty", v: String(stats?.dirty || 0), c: "text-[var(--color-error)]" },
          { l: "Inspected", v: String(stats?.inspected || 0), c: "text-text-secondary" },
        ].map((s) => (
          <div key={s.l} className="px-5 py-4">
            <div className="label-uppercase">{s.l}</div>
            <div className={`mt-1 text-[22px] font-semibold ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
export default HousekeepingStatus;
