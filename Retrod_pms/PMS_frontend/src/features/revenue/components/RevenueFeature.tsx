import { useState } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { PageHeader, KpiCard, Button, SectionDivider } from "@/components/ui/Primitives";
import { RevenueCalendar } from "./RevenueCalendar";
import {
  useAIRevenueDashboardQuery,
  useForecast7dQuery,
  useOccupancyByTypeQuery,
} from "@/services/mock/queries";
import { AIDemandFunnelCard } from "./ai-dashboard/AIDemandFunnelCard";
import { DynamicPriceForecastChart } from "./ai-dashboard/DynamicPriceForecastChart";
import { OccupancyVsPriceChart } from "./ai-dashboard/OccupancyVsPriceChart";
import { RevenueForecastPanel } from "./ai-dashboard/RevenueForecastPanel";
import { CompetitorRateIntelligence } from "./ai-dashboard/CompetitorRateIntelligence";
import { AIDemandScoreCardGrid } from "./ai-dashboard/AIDemandScoreCardGrid";
import { ManualOverrideControls } from "./ai-dashboard/ManualOverrideControls";
import { AIInsightsPanel } from "./ai-dashboard/AIInsightsPanel";

const days = Array.from({ length: 21 }, (_, i) => i + 15);
const types = ["Heritage", "Premier", "Executive", "Deluxe K", "Deluxe T"];
const baseRate: Record<string, number> = {
  Heritage: 35000,
  Premier: 22000,
  Executive: 14400,
  "Deluxe K": 12000,
  "Deluxe T": 9800,
};

export function RevenueFeature() {
  const { data: forecast7d = [] } = useForecast7dQuery();
  const { data: occupancyByType = [] } = useOccupancyByTypeQuery();
  const { data: aiRevenueDashboard } = useAIRevenueDashboardQuery();

  const [roomFilter, setRoomFilter] = useState<string>("All");

  const totalRooms = occupancyByType.reduce((a, b) => a + b.total, 0);
  const occupied = occupancyByType.reduce((a, b) => a + b.occupied, 0);
  const occPct = Math.round((occupied / totalRooms) * 1000) / 10;
  const pickup7d = forecast7d[6]?.occ ?? 0;
  const revpar = "₹10,440";
  const adr = "₹12,400";

  const filteredTypes =
    roomFilter === "All"
      ? types
      : roomFilter === "Deluxe"
        ? types.filter((t) => t.startsWith("Deluxe"))
        : types.filter((t) => t.startsWith(roomFilter));

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Revenue Management"
        description="Calendar-based pricing strategy across room types."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5" />
              Bulk edit
            </Button>
            <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5">
              <button
                type="button"
                className="rounded p-1 text-text-secondary hover:bg-surface-2 transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 text-[12px] font-medium text-text-primary">15 May → 4 Jun</span>
              <button
                type="button"
                className="rounded p-1 text-text-secondary hover:bg-surface-2 transition"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        }
      />

      <div className="responsive-page-x mx-auto max-w-[1520px] space-y-7 py-4 sm:space-y-8 sm:py-5 lg:space-y-10 lg:py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <KpiCard label="RevPAR · MTD" value={revpar} delta="↑ 5.4% vs LM" accent="brand" />
          <KpiCard label="ADR today" value={adr} delta="↑ ₹800 vs LW" accent="success" />
          <KpiCard label="Occupancy forecast" value={`${occPct}%`} accent="info" />
          <KpiCard label="Pickup (7d)" value={`${pickup7d}%`} accent="warning" />
          <KpiCard label="Compression index" value="1.12" accent="success" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface px-4 py-3">
          <div className="text-[12px] font-medium text-text-primary">
            AI Pricing Workspace
            <span className="ml-2 text-[11px] font-normal text-text-secondary">
              Live demand signals and recommended rates
            </span>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-surface px-2 text-[12px] sm:w-auto sm:min-w-[150px]"
            >
              {["All", "Heritage", "Premier", "Executive", "Deluxe"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <Button size="sm">Apply AI Recommendations</Button>
          </div>
        </div>

        {aiRevenueDashboard && (
          <>
            <SectionDivider>AI Demand Overview</SectionDivider>
            <section className="space-y-4">
              <AIDemandScoreCardGrid snapshot={aiRevenueDashboard.demandSnapshot} />
            </section>

            <SectionDivider>Live Decision Zone</SectionDivider>
            <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.35fr_0.9fr]">
              <AIDemandFunnelCard points={aiRevenueDashboard.demandFunnel} />
              <DynamicPriceForecastChart data={aiRevenueDashboard.priceForecast} />
            </section>

            <SectionDivider>Validation Zone</SectionDivider>
            <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1fr_1fr]">
              <OccupancyVsPriceChart data={aiRevenueDashboard.occupancyVsPrice} />
              <RevenueForecastPanel forecast={aiRevenueDashboard.revenueForecast} />
            </section>

            <SectionDivider>Market + Control</SectionDivider>
            <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1fr_1fr]">
              <CompetitorRateIntelligence competitors={aiRevenueDashboard.competitors} />
              <ManualOverrideControls
                settings={aiRevenueDashboard.overrides}
                readOnly
                onChange={() => {}}
              />
            </section>

            <SectionDivider>Top AI Actions</SectionDivider>
            <section>
              <AIInsightsPanel insights={aiRevenueDashboard.insights.slice(0, 3)} />
            </section>
          </>
        )}

        <SectionDivider>Advanced Calendar Controls</SectionDivider>
        <section className="rounded-xl border border-border-subtle bg-surface p-3 md:p-4">
          <RevenueCalendar days={days} types={filteredTypes} baseRate={baseRate} />
        </section>
      </div>
    </div>
  );
}
export default RevenueFeature;
