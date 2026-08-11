import { Card, CardHeader, Button } from "@/components/ui/Primitives";

export function AIPricingRecs() {
  return (
    <Card>
      <CardHeader title="Smart pricing recommendations" hint="Next 7 days" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-2/40 text-left">
              {["Room type", "Current rate", "Suggested", "Δ", "Demand", ""].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { t: "Heritage Suite", c: 35000, s: 42000, d: "Very high" },
              { t: "Premier Suite", c: 22000, s: 25800, d: "High" },
              { t: "Executive", c: 14400, s: 15200, d: "Moderate" },
              { t: "Deluxe King", c: 12000, s: 13800, d: "High" },
              { t: "Deluxe Twin", c: 9800, s: 10200, d: "Moderate" },
            ].map((r) => {
              const delta = Math.round(((r.s - r.c) / r.c) * 100);
              return (
                <tr key={r.t} className="border-b border-border-subtle">
                  <td className="truncate px-3 py-3 font-medium text-text-primary">{r.t}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-text-secondary">
                    ₹{r.c.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-text-primary">
                    ₹{r.s.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-[var(--color-success)]">
                    +{delta}%
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-text-secondary">{r.d}</td>
                  <td className="px-3 py-3 text-right">
                    <Button variant="outline" size="sm">
                      Apply
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
export default AIPricingRecs;
