import { Card, CardHeader, Button } from "@/components/ui/Primitives";

interface RevenueCalendarProps {
  days: number[];
  types: string[];
  baseRate: Record<string, number>;
}

export function RevenueCalendar({ days, types, baseRate }: RevenueCalendarProps) {
  return (
    <Card>
      <CardHeader title="Pricing calendar" hint="₹ per night · base rates with demand modifier" />
      <div className="overflow-x-auto">
        <div className="min-w-[1100px]">
          <div
            className="grid border-b border-border-subtle bg-surface-2/40"
            style={{ gridTemplateColumns: `140px repeat(${days.length}, 1fr)` }}
          >
            <div className="label-uppercase px-4 py-2.5">Room type</div>
            {days.map((d) => (
              <div
                key={d}
                className="border-l border-border-subtle py-2 text-center text-[11px] text-text-secondary"
              >
                {d}
              </div>
            ))}
          </div>
          {types.map((t) => (
            <div
              key={t}
              className="grid border-b border-border-subtle hover:bg-surface-2/40"
              style={{ gridTemplateColumns: `140px repeat(${days.length}, 1fr)` }}
            >
              <div className="px-4 py-3 text-[13px] font-medium text-text-primary">{t}</div>
              {days.map((d, i) => {
                const wkend = d % 7 === 6 || d % 7 === 0;
                const high = wkend ? 1.18 : 1;
                const rate = Math.round(baseRate[t] * high);
                return (
                  <div key={i} className="border-l border-border-subtle px-1 py-2">
                    <button
                      className={`w-full rounded px-1.5 py-1.5 text-center text-[11px] font-mono transition hover:bg-primary-tint ${
                        wkend
                          ? "bg-primary-tint/40 text-primary-pressed font-medium"
                          : "text-text-primary"
                      }`}
                    >
                      {(rate / 1000).toFixed(1)}k
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border-subtle px-4 py-3 text-[12px] text-text-secondary">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-border bg-surface-2" /> Standard
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-primary-tint" /> Weekend uplift
          </span>
        </span>
        <Button variant="outline" size="sm">
          Bulk update rates
        </Button>
      </div>
    </Card>
  );
}
export default RevenueCalendar;
