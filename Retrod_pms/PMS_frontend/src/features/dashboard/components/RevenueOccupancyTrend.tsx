import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardHeader } from "@/components/ui/Primitives";
import { useRevenueTrendQuery } from "@/services/mock/queries";

interface RevenueOccupancyTrendProps {
  tooltipStyle: React.CSSProperties;
  timeFilter: string;
}

export function RevenueOccupancyTrend({ tooltipStyle, timeFilter }: RevenueOccupancyTrendProps) {
  const { data: revenueTrend = [] } = useRevenueTrendQuery();

  const filteredData = useMemo(() => {
    switch (timeFilter) {
      case "today":
        return revenueTrend.slice(-1);
      case "7days":
        return revenueTrend.slice(-7);
      case "month":
      case "year":
        return revenueTrend; // Fallback to all mock data for month/year for now
      default:
        return revenueTrend.slice(-7);
    }
  }, [revenueTrend, timeFilter]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Revenue & Occupancy"
        action={
          <div className="flex items-center gap-3 text-[11px] text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-info)]" />
              Occupancy
            </span>
          </div>
        }
      />
      <div className="px-3 pb-4 pt-2">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={filteredData} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
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
              yAxisId="r"
              stroke="var(--color-text-disabled)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="o"
              orientation="right"
              stroke="var(--color-text-disabled)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar
              yAxisId="r"
              dataKey="revenue"
              fill="var(--color-primary)"
              radius={[2, 2, 0, 0]}
              barSize={timeFilter === "today" ? 40 : 12}
            />
            <Bar
              yAxisId="o"
              dataKey="occupancy"
              fill="var(--color-info)"
              radius={[2, 2, 0, 0]}
              barSize={timeFilter === "today" ? 40 : 12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
