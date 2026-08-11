import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardHeader } from "@/components/ui/Primitives";

interface RevenueTrendChartProps {
  revenueTrend: { day: string; revenue: number }[];
  tooltipStyle: React.CSSProperties;
}

export function RevenueTrendChart({ revenueTrend, tooltipStyle }: RevenueTrendChartProps) {
  return (
    <Card>
      <CardHeader title="Revenue · Last 30 days" hint="All sources" />
      <div className="px-3 pb-4 pt-2">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueTrend} margin={{ left: 8, right: 16, top: 8 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--color-border-subtle)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke="var(--color-text-disabled)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--color-text-disabled)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#rev)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
export default RevenueTrendChart;
