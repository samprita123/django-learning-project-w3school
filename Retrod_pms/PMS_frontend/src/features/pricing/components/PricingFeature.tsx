import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  PageHeader,
  KpiCard,
  Button,
  Card,
  CardHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import {
  usePricingRulesQuery,
  useMealPlansQuery,
  useRatePlansQuery,
} from "@/services/mock/queries";
import { AIPricingRecs } from "@/features/revenue/components/AIPricingRecs";

export function PricingFeature() {
  const { data: pricingRules = [] } = usePricingRulesQuery();
  const { data: mealPlans = [] } = useMealPlansQuery();
  const { data: ratePlans = [] } = useRatePlansQuery();

  const [statusFilter, setStatusFilter] = useState("All");
  const active = pricingRules.filter((r) => r.status === "Active").length;
  const filtered =
    statusFilter === "All" ? pricingRules : pricingRules.filter((r) => r.status === statusFilter);

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Dynamic Pricing"
        description="Rules-based automation with AI recommendations and guardrails."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5" />
              Simulate
            </Button>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              Create rule
            </Button>
          </>
        }
      />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <KpiCard label="Rules active" value={String(active)} accent="brand" />
          <KpiCard label="Auto adjustments (7d)" value="142" accent="info" />
          <KpiCard label="Est. revenue uplift" value="₹2.4 L" delta="↑ 8.2%" accent="success" />
          <KpiCard label="Override count" value="6" accent="warning" />
          <KpiCard label="Confidence avg" value="87%" accent="success" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader title="Pricing rules" hint={`${filtered.length} rules`} />
            <div className="mb-3 px-5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-md border border-border bg-surface px-2 text-[12px]"
              >
                {["All", "Active", "Paused"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["Rule", "Trigger", "Adjustment", "Status", "Last run", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border-subtle hover:bg-surface-2/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{r.name}</div>
                      <div className="font-mono text-[11px] text-text-secondary">{r.id}</div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{r.trigger}</td>
                    <td className="px-4 py-3 font-mono text-text-primary">{r.adjustment}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={r.status === "Active" ? "success" : "neutral"}>
                        {r.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{r.lastRun}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="text-[12px] font-medium text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader
                title="Meal plan management"
                hint={`${mealPlans.filter((m) => m.status === "Active").length} active plans`}
              />
              <div className="space-y-2 p-4">
                {mealPlans.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-start justify-between rounded-md border border-border-subtle bg-surface-2/30 px-3 py-2"
                  >
                    <div>
                      <div className="text-[12px] font-semibold text-text-primary">
                        {meal.code} · {meal.name}
                      </div>
                      <div className="text-[11px] text-text-secondary">
                        {meal.includedMeals.length > 0
                          ? meal.includedMeals.join(", ")
                          : "Room only"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[11px] text-primary">
                        +₹{meal.priceAdjustment.toLocaleString()}
                      </div>
                      <StatusBadge tone={meal.status === "Active" ? "success" : "neutral"}>
                        {meal.status}
                      </StatusBadge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader
                title="Rate plan management"
                hint={`${ratePlans.length} configured plans`}
              />
              <div className="space-y-3 p-4">
                <p className="text-[12px] text-text-secondary">
                  Rate plan definitions live in the dedicated Rate Plans module.
                </p>
                <Link
                  to="/rate-plans"
                  className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-[12px] font-medium text-primary hover:bg-surface-2"
                >
                  View all rate plans
                </Link>
              </div>
            </Card>
            <Card className="border border-primary/20 bg-primary-tint/30 p-4">
              <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-primary-pressed">
                Simulation
              </div>
              <p className="mt-2 text-[13px] text-text-primary">
                Applying active rules this weekend projects <strong>+₹1.8L</strong> revenue at 91%
                forecast occupancy.
              </p>
              <Button size="sm" className="mt-3">
                Run simulation
              </Button>
            </Card>
            <AIPricingRecs />
          </div>
        </div>
      </div>
    </div>
  );
}
export default PricingFeature;
