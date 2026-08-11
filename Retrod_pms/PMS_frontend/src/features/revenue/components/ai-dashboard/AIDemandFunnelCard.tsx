import type { AIDemandFunnelPoint } from "@/types/pms";
import { Card, CardHeader } from "@/components/ui/Primitives";

const demandTone = {
  Low: "from-success/85 to-success",
  Medium: "from-warning-tint to-warning",
  High: "from-warning to-orange-500",
  Peak: "from-error to-error/80",
} as const;

export function AIDemandFunnelCard({ points }: { points: AIDemandFunnelPoint[] }) {
  const sortedPoints = [...points].sort((a, b) => a.ts.localeCompare(b.ts));
  const nowIndex = sortedPoints.findIndex((p) => p.stageType === "Actual");
  const currentStage = nowIndex >= 0 ? nowIndex : 0;
  const totalRooms = sortedPoints[0]?.totalRooms ?? 0;

  const expectedRevenue = (point: AIDemandFunnelPoint) => {
    return Math.round(point.rooms * point.price * (point.sellProbability / 100));
  };

  return (
    <Card>
      <CardHeader
        title="AI Demand Funnel"
        hint="As inventory decreases, demand and price accelerate"
      />
      <div className="grid grid-cols-1 gap-8 p-5 lg:grid-cols-[280px_1fr] lg:p-7">
        <div className="space-y-2">
          <div className="rounded-md border border-border-subtle bg-surface-2/50 px-3 py-2 text-center">
            <div className="label-uppercase text-[9px]">Total Inventory</div>
            <div className="font-mono text-[20px] font-semibold text-text-primary">
              {totalRooms}
            </div>
            <div className="text-[10px] text-text-secondary">Total Rooms</div>
          </div>

          {sortedPoints.map((point, idx) => {
            const widthPct = Math.max(16, Math.round((point.rooms / point.totalRooms) * 100));
            const nextWidthPct = sortedPoints[idx + 1]
              ? Math.max(
                  16,
                  Math.round(
                    (sortedPoints[idx + 1].rooms / sortedPoints[idx + 1].totalRooms) * 100,
                  ),
                )
              : Math.max(16, widthPct - 12);

            return (
              <div
                key={`${point.ts}-${point.rooms}`}
                className="flex h-16 items-center justify-center lg:h-20"
              >
                <div
                  className={`relative flex h-full items-center justify-center bg-gradient-to-r text-white transition-all duration-500 ease-out ${demandTone[point.demandBand]}`}
                  style={{
                    width: `${widthPct}%`,
                    clipPath:
                      idx === sortedPoints.length - 1
                        ? "polygon(10% 0, 90% 0, 100% 100%, 0 100%)"
                        : `polygon(${Math.max(0, 50 - nextWidthPct / 2)}% 100%, ${Math.min(100, 50 + nextWidthPct / 2)}% 100%, 100% 0, 0 0)`,
                  }}
                >
                  <div className="text-center">
                    <div className="text-2xl font-semibold leading-tight lg:text-[30px]">
                      {point.rooms}
                    </div>
                    <div className="text-[11px] uppercase tracking-wider opacity-90">Rooms</div>
                    <div className="mt-0.5 text-[11px] font-medium opacity-90">{point.ts}</div>
                  </div>
                  <div
                    className={`absolute right-1 top-1 rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                      point.stageType === "Actual"
                        ? "bg-white/20 text-white"
                        : "border border-white/35 text-white/90"
                    }`}
                  >
                    {point.stageType}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="rounded-md border border-border-subtle bg-surface-2/50 px-3 py-2 text-[11px] text-text-secondary">
            <span className="font-medium text-text-primary">Now:</span>{" "}
            {sortedPoints[currentStage]?.ts} · {sortedPoints[currentStage]?.occupancyPct}% occupancy
            · {sortedPoints[currentStage]?.soldByTime}/{sortedPoints[currentStage]?.totalRooms} sold
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-surface-2/40 text-left">
                {[
                  "Time",
                  "Stage",
                  "Sold / Total",
                  "Live / Pred. Occupancy",
                  "Rooms Left",
                  "Recommended Price",
                  "Sell Probability",
                  "Expected Revenue",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedPoints.map((point) => {
                return (
                  <tr key={`${point.ts}-${point.price}`} className="border-b border-border-subtle">
                    <td className="px-3 py-2.5 font-mono text-text-secondary">{point.ts}</td>
                    <td className="px-3 py-2.5 text-text-secondary">{point.stageType}</td>
                    <td className="px-3 py-2.5 text-text-secondary">
                      {point.soldByTime}/{point.totalRooms}
                    </td>
                    <td className="px-3 py-2.5 text-text-secondary">{point.occupancyPct}%</td>
                    <td className="px-3 py-2.5 font-medium text-text-primary">{point.rooms}</td>
                    <td className="px-3 py-2 font-mono text-text-primary">
                      ₹{point.price.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-text-secondary">{point.sellProbability}%</td>
                    <td className="px-3 py-2.5 font-mono text-text-secondary">
                      ₹{expectedRevenue(point).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="border-t border-border-subtle px-5 py-3 lg:px-7">
        <div className="grid grid-cols-4 items-center gap-3 text-[11px] font-medium text-text-primary">
          {[
            { label: "Low Demand", color: "var(--color-success)" },
            { label: "Medium Demand", color: "var(--color-warning)" },
            { label: "High Demand", color: "var(--color-warning)" },
            { label: "Peak Demand", color: "var(--color-error)" },
          ].map((item) => (
            <div key={item.label} className="flex min-w-0 items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-border-subtle"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default AIDemandFunnelCard;
