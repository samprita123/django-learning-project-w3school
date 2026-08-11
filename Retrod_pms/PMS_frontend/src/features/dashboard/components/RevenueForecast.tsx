import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardHeader } from "@/components/ui/Primitives";
import { useForecast7dQuery } from "@/services/mock/queries";

interface RevenueForecastProps {
  fmtINR: (n: number) => string;
  tooltipStyle: React.CSSProperties;
}

export function RevenueForecast({ fmtINR, tooltipStyle }: RevenueForecastProps) {
  const { data: forecast7d = [] } = useForecast7dQuery();

  const totalForecast = forecast7d.reduce((a, b) => a + b.revenue, 0);

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="7-Day Revenue Forecast"
        hint="On-books + historical pickup curve"
        action={
          <span className="text-[11px] text-text-secondary">
            Total: <span className="font-mono text-text-primary">{fmtINR(totalForecast)}</span>
          </span>
        }
      />
      <div className="px-3 pb-4 pt-2">
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={forecast7d} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
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
              tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: any, n: any) =>
                n === "revenue" ? [fmtINR(v), "Revenue"] : [`${v}%`, "Occupancy"]
              }
            />
            <Bar dataKey="revenue" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 grid grid-cols-7 gap-1 px-2">
          {forecast7d.map((f) => (
            <div key={f.day} className="text-center">
              <div className="text-[10px] text-text-disabled">Occ</div>
              <div className="font-mono text-[11px] font-medium text-text-primary">{f.occ}%</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
