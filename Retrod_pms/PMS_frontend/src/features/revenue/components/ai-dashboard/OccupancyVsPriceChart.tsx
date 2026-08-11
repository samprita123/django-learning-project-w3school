import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OccupancyPricePoint } from "@/types/pms";
import { Card, CardHeader } from "@/components/ui/Primitives";

const tooltipStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
};

export function OccupancyVsPriceChart({ data }: { data: OccupancyPricePoint[] }) {
  return (
    <Card>
      <CardHeader title="Occupancy vs Price" hint="Correlated trend" />
      <div className="px-4 pb-5 pt-3">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
            <CartesianGrid
              stroke="var(--color-border-subtle)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="var(--color-text-disabled)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="price"
              stroke="var(--color-text-disabled)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="occ"
              orientation="right"
              stroke="var(--color-text-disabled)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="occ"
              type="monotone"
              dataKey="occupancyPct"
              stroke="var(--color-info)"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 4"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default OccupancyVsPriceChart;
