import { useMemo, useState } from "react";
import { PageHeader, Button } from "@/components/ui/Primitives";
import { useAIRevenueDashboardQuery } from "@/services/mock/queries";
import type { PricingOverrideSettings } from "@/types/pms";
import { AIDemandFunnelCard } from "./ai-dashboard/AIDemandFunnelCard";
import { AIDemandScoreCardGrid } from "./ai-dashboard/AIDemandScoreCardGrid";
import { DynamicPriceForecastChart } from "./ai-dashboard/DynamicPriceForecastChart";
import { OccupancyVsPriceChart } from "./ai-dashboard/OccupancyVsPriceChart";
import { RevenueForecastPanel } from "./ai-dashboard/RevenueForecastPanel";
import { CompetitorRateIntelligence } from "./ai-dashboard/CompetitorRateIntelligence";
import { AIInsightsPanel } from "./ai-dashboard/AIInsightsPanel";
import { ManualOverrideControls } from "./ai-dashboard/ManualOverrideControls";

export function AIRevenueDashboardFeature() {
  const { data, isFetching } = useAIRevenueDashboardQuery();
  const [overrides, setOverrides] = useState<PricingOverrideSettings | null>(null);

  const effectiveOverrides = overrides ?? data?.overrides ?? null;
  const guardrailError = useMemo(() => {
    if (!effectiveOverrides) return null;
    if (effectiveOverrides.minPrice > effectiveOverrides.maxPrice) {
      return "Min Price cannot be higher than Max Price.";
    }
    if (effectiveOverrides.surgeCapPct < 0 || effectiveOverrides.surgeCapPct > 100) {
      return "Surge cap must be between 0 and 100.";
    }
    return null;
  }, [effectiveOverrides]);

  if (!data) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-border bg-surface p-4 text-[13px] text-text-secondary">
          Loading AI revenue dashboard...
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="AI Revenue Dashboard"
        description="Real-time AI pricing intelligence to maximize occupancy and revenue."
        actions={
          <Button variant="outline" size="sm">
            {isFetching ? "Refreshing..." : `Live · ${data.asOf}`}
          </Button>
        }
      />

      <div className="space-y-6 p-6">
        <AIDemandScoreCardGrid snapshot={data.demandSnapshot} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
          <AIDemandFunnelCard points={data.demandFunnel} />
          <DynamicPriceForecastChart data={data.priceForecast} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <OccupancyVsPriceChart data={data.occupancyVsPrice} />
          <RevenueForecastPanel forecast={data.revenueForecast} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
          <CompetitorRateIntelligence competitors={data.competitors} />
          <AIInsightsPanel insights={data.insights} />
        </div>

        {effectiveOverrides && (
          <>
            <ManualOverrideControls
              settings={effectiveOverrides}
              onChange={(patch) => {
                setOverrides((prev) => ({ ...(prev ?? data.overrides), ...patch }));
              }}
            />
            {guardrailError && (
              <div className="rounded-md border border-error/30 bg-error-tint px-4 py-3 text-[12px] text-error">
                {guardrailError}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AIRevenueDashboardFeature;
