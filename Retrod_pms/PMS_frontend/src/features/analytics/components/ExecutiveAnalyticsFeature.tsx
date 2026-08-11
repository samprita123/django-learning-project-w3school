import { Download, FileText } from "lucide-react";
import { PageHeader, KpiCard, Button } from "@/components/ui/Primitives";
import { useRevenueTrendQuery, useOtaBreakdownQuery } from "@/services/mock/queries";
import { RevenueTrendChart } from "@/features/reports/components/RevenueTrendChart";
import { OtaRevenueChart } from "@/features/reports/components/OtaRevenueChart";

const tooltipStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
};

export function ExecutiveAnalyticsFeature() {
  const { data: revenueTrend = [] } = useRevenueTrendQuery();
  const { data: otaBreakdown = [] } = useOtaBreakdownQuery();

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Executive Analytics"
        description="Board-level performance vs budget — portfolio summary for The Grand Palace."
        actions={
          <>
            <Button variant="outline" size="sm">
              <FileText className="h-3.5 w-3.5" />
              PDF pack
            </Button>
            <Button size="sm">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </>
        }
      />

      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            label="Revenue · MTD"
            value="₹1.42 Cr"
            delta="↑ 12.4% vs budget"
            accent="brand"
          />
          <KpiCard label="GOPPAR" value="₹6,840" delta="↑ 4.1%" accent="success" />
          <KpiCard label="Occupancy" value="78.4%" delta="↑ 2.1 pts" accent="info" />
          <KpiCard label="ADR" value="₹11,820" accent="success" />
          <KpiCard label="Labor cost %" value="28.2%" deltaTone="error" accent="warning" />
          <KpiCard label="Guest satisfaction" value="NPS 72" accent="success" />
        </div>

        <RevenueTrendChart revenueTrend={revenueTrend} tooltipStyle={tooltipStyle} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <OtaRevenueChart otaBreakdown={otaBreakdown} tooltipStyle={tooltipStyle} />
          <div className="rounded-lg border border-border bg-surface p-5 shadow-e1">
            <h3 className="text-[14px] font-semibold text-text-primary">Budget vs actual · May</h3>
            <p className="mt-1 text-[12px] text-text-secondary">
              Rooms revenue tracking 6.2% above budget YTD.
            </p>
            <div className="mt-4 space-y-3">
              {[
                { label: "Rooms", pct: 106 },
                { label: "F&B", pct: 94 },
                { label: "Spa", pct: 112 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex justify-between text-[12px]">
                    <span className="text-text-secondary">{row.label}</span>
                    <span className="font-mono font-medium text-text-primary">{row.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, row.pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ExecutiveAnalyticsFeature;
