import type { RevenueForecast } from "@/types/pms";
import { Card, CardHeader } from "@/components/ui/Primitives";

export function RevenueForecastPanel({ forecast }: { forecast: RevenueForecast }) {
  return (
    <Card>
      <CardHeader title="Revenue Forecast" hint="AI projection" />
      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 lg:gap-4 lg:p-6">
        <div className="rounded-lg border border-border-subtle bg-surface-2/50 p-4">
          <div className="label-uppercase">Expected Revenue Today</div>
          <div className="mt-1 font-mono text-[26px] font-semibold text-text-primary">
            ₹{forecast.today.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-success">↑ 18% vs yesterday</div>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface-2/50 p-4">
          <div className="label-uppercase">Expected Revenue (Next 7 Days)</div>
          <div className="mt-1 font-mono text-[26px] font-semibold text-text-primary">
            ₹{forecast.next7Days.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-info">↑ 22% vs last 7 days</div>
        </div>
        <div className="md:col-span-2 rounded-lg border border-primary/25 bg-primary-tint/40 p-4">
          <div className="label-uppercase text-primary-pressed">Revenue Opportunity Score</div>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-mono text-[30px] font-semibold leading-none text-primary">
              {forecast.opportunityScore}
            </span>
            <span className="pb-0.5 text-[12px] text-text-secondary">/100</span>
          </div>
          <div className="mt-1 text-[12px] text-text-secondary">
            Opportunity status:{" "}
            <span className="font-medium text-success">
              {forecast.opportunityScore >= 80
                ? "High"
                : forecast.opportunityScore >= 60
                  ? "Good"
                  : "Moderate"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default RevenueForecastPanel;
