import { Card, CardHeader } from "@/components/ui/Primitives";

interface RevenueKpiItem {
  label: string;
  today: number;
  budget: number;
  sty: number;
}

interface RevenueKpisProps {
  fmtINR: (n: number) => string;
  revenueKpis: RevenueKpiItem[];
}

export function RevenueKpis({ fmtINR, revenueKpis }: RevenueKpisProps) {
  return (
    <Card>
      <CardHeader
        title="Revenue · Today vs Budget vs STLY"
        hint="Visible to GM, Revenue, Finance"
      />
      <div className="grid grid-cols-2 gap-px bg-border-subtle md:grid-cols-4">
        {revenueKpis.map((k) => {
          const vBudget = k.budget > 0 ? ((k.today - k.budget) / k.budget) * 100 : 0;
          const vSTLY = k.sty > 0 ? ((k.today - k.sty) / k.sty) * 100 : 0;
          const okB = vBudget >= 0;
          const okS = vSTLY >= 0;
          return (
            <div key={k.label} className="bg-surface px-4 py-4">
              <div className="label-uppercase">{k.label}</div>
              <div className="mt-1 text-[20px] font-semibold tracking-tight text-text-primary">
                {fmtINR(k.today)}
              </div>
              <div className="mt-2 space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-text-disabled">vs Budget</span>
                  <span
                    className={okB ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}
                  >
                    {okB ? "↑" : "↓"} {Math.abs(vBudget).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-disabled">vs STLY</span>
                  <span
                    className={okS ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}
                  >
                    {okS ? "↑" : "↓"} {Math.abs(vSTLY).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
