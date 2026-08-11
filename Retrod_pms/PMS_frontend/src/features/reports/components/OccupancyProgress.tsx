import { Card, CardHeader } from "@/components/ui/Primitives";

export function OccupancyProgress() {
  return (
    <Card>
      <CardHeader title="Occupancy by room type" />
      <div className="space-y-3 p-5">
        {[
          { t: "Heritage Suite", v: 92 },
          { t: "Premier Suite", v: 84 },
          { t: "Executive", v: 78 },
          { t: "Deluxe King", v: 71 },
          { t: "Deluxe Twin", v: 64 },
        ].map((r) => (
          <div key={r.t}>
            <div className="mb-1 flex justify-between text-[12px]">
              <span className="text-text-secondary">{r.t}</span>
              <span className="font-mono text-text-primary">{r.v}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${r.v}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
export default OccupancyProgress;
