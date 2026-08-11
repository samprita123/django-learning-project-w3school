import { useMemo, useState } from "react";
import { TrendingUp, AlertTriangle, Sparkles, ArrowUpRight } from "lucide-react";
import { PageHeader, Card, KpiCard } from "@/components/ui/Primitives";
import { AIPricingRecs } from "./AIPricingRecs";
import { DemandCalendar } from "./DemandCalendar";
import { AssistantPanel } from "./AssistantPanel";
import { type InsightCategory } from "@/types/pms";

const insights = [
  {
    category: "Pricing" as const,
    icon: TrendingUp,
    title: "Pricing opportunity · This weekend",
    body: "Forecast indicates 91% occupancy. A 12–18% rate uplift on Deluxe rooms is supported by competitor parity.",
    action: "Apply uplift",
  },
  {
    category: "Risk" as const,
    icon: AlertTriangle,
    title: "No-show risk · 3 reservations",
    body: "RES-2046, RES-2073, RES-2089 match historical no-show signals. Suggest sending pre-arrival confirmation now.",
    action: "Send confirmations",
  },
  {
    category: "Guest" as const,
    icon: Sparkles,
    title: "Loyalty cue · Sophie Laurent",
    body: "Returning Platinum guest arriving 16 May. Suggest upgrade to Heritage Suite (1 vacancy) and welcome amenity.",
    action: "Apply upgrade",
  },
  {
    category: "Operations" as const,
    icon: AlertTriangle,
    title: "HK pressure · Saturday",
    body: "24 arrivals vs 12 attendants on morning shift. Recommend pre-assigning VIP rooms by 10:00.",
    action: "View housekeeping",
  },
];

const heat = Array.from({ length: 30 }, (_, i) =>
  Math.round(40 + Math.sin(i / 3) * 30 + (i % 7 === 5 ? 20 : 0)),
);

const categories: InsightCategory[] = ["All", "Pricing", "Operations", "Guest", "Risk"];

export function AIInsightsFeature() {
  const [category, setCategory] = useState<InsightCategory>("All");

  const filtered = useMemo(
    () => (category === "All" ? insights : insights.filter((i) => i.category === category)),
    [category],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="AI Insights"
        description="Calm, analytical guidance — surfaced when it matters."
      />

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <KpiCard label="Active insights" value="4" accent="brand" />
            <KpiCard label="Applied (7d)" value="12" accent="success" />
            <KpiCard label="Est. revenue impact" value="₹3.1 L" accent="info" />
            <KpiCard label="Risk alerts" value="2" accent="error" />
            <KpiCard label="Confidence avg" value="84%" accent="success" />
          </div>

          <div className="flex flex-wrap gap-1 rounded-md border border-border bg-surface p-0.5 text-[12px] w-fit">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded px-3 py-1 transition ${
                  category === c
                    ? "bg-foreground text-background"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((i) => (
              <Card key={i.title} className="flex flex-col">
                <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-primary-pressed">
                  <i.icon className="h-3.5 w-3.5" />
                  Retrod AI · {i.category}
                </div>
                <div className="flex-1 p-5">
                  <h4 className="text-[14px] font-semibold text-text-primary">{i.title}</h4>
                  <p className="mt-1.5 text-[12px] leading-snug text-text-secondary">{i.body}</p>
                </div>
                <div className="border-t border-border-subtle px-5 py-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary-pressed transition"
                  >
                    {i.action} <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <AIPricingRecs />
          <DemandCalendar heat={heat} />
        </div>

        <AssistantPanel />
      </div>
    </div>
  );
}
export default AIInsightsFeature;
