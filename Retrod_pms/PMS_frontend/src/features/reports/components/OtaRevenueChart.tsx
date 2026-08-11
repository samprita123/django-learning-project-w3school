import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardHeader } from "@/components/ui/Primitives";

interface OtaRevenueChartProps {
  otaBreakdown: { source: string; revenue: number }[];
  tooltipStyle: React.CSSProperties;
}

export function OtaRevenueChart({ otaBreakdown, tooltipStyle }: OtaRevenueChartProps) {
  return (
    <Card>
      <CardHeader title="Revenue by channel" />
      <div className="px-3 pb-4 pt-2">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={otaBreakdown} margin={{ left: 8, right: 16, top: 8 }}>
            <CartesianGrid
              stroke="var(--color-border-subtle)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="source"
              stroke="var(--color-text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--color-text-disabled)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
export default OtaRevenueChart;
