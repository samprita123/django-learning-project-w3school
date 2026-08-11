import type { CompetitorRateCard } from "@/types/pms";
import { Card, CardHeader, StatusBadge } from "@/components/ui/Primitives";

function toneFor(
  position: CompetitorRateCard["position"],
): React.ComponentProps<typeof StatusBadge>["tone"] {
  if (position === "Higher") return "warning";
  if (position === "Lower") return "success";
  return "info";
}

export function CompetitorRateIntelligence({ competitors }: { competitors: CompetitorRateCard[] }) {
  return (
    <Card>
      <CardHeader title="Competitor Rate Intelligence" hint="Nearby compset" />
      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 lg:gap-4 lg:p-6">
        {competitors.map((competitor) => (
          <div
            key={competitor.hotel}
            className="rounded-lg border border-border-subtle bg-surface-2/40 p-3.5"
          >
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-medium text-text-primary">{competitor.hotel}</div>
              <StatusBadge tone={toneFor(competitor.position)}>{competitor.position}</StatusBadge>
            </div>
            <div className="mt-2 flex items-center justify-between text-[12px] text-text-secondary">
              <span>{competitor.distanceKm.toFixed(1)} km</span>
              <span className="font-mono text-text-primary">
                ₹{competitor.rate.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-text-secondary">
              Delta vs ours: {competitor.deltaPct > 0 ? "+" : ""}
              {competitor.deltaPct}%
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default CompetitorRateIntelligence;
