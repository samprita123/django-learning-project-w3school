import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PriceForecastPoint } from "@/types/pms";
import { Card, CardHeader } from "@/components/ui/Primitives";

const tooltipStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
};

export function DynamicPriceForecastChart({ data }: { data: PriceForecastPoint[] }) {
  return (
    <Card>
      <CardHeader title="Dynamic Price Forecast" hint="Predicted ADR by time" />
      <div className="px-4 pb-5 pt-3">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ left: 8, right: 16, top: 8 }}>
            <defs>
              <linearGradient id="ai-price" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              stroke="var(--color-text-disabled)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
            />
            <Area
              type="monotone"
              dataKey="predictedPrice"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#ai-price)"
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default DynamicPriceForecastChart;
