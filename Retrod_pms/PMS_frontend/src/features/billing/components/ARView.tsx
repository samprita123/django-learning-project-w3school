import { Card, CardHeader, Button } from "@/components/ui/Primitives";

export function ARView() {
  return (
    <Card>
      <CardHeader title="City Ledger / AR aging" hint="Corporate accounts" />
      <div className="grid grid-cols-2 gap-px bg-border-subtle sm:grid-cols-3 lg:grid-cols-5">
        {[
          { l: "Current", v: "₹18,42,000", c: "text-text-primary" },
          { l: "0–30 d", v: "₹6,82,000", c: "text-[var(--color-success)]" },
          { l: "31–60 d", v: "₹2,14,000", c: "text-[var(--color-info)]" },
          { l: "61–90 d", v: "₹84,000", c: "text-[var(--color-warning)]" },
          { l: "90+ d", v: "₹42,000", c: "text-[var(--color-error)]" },
        ].map((b) => (
          <div key={b.l} className="bg-surface px-4 py-4">
            <div className="label-uppercase">{b.l}</div>
            <div className={`mt-1 font-mono text-[16px] font-semibold ${b.c}`}>{b.v}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2 p-3 md:hidden">
        {[
          { c: "Infosys Ltd.", i: 8, o: 484000, oldest: "12 d", lim: 1000000 },
          { c: "HSBC India", i: 4, o: 218000, oldest: "32 d", lim: 800000 },
          { c: "Tata Steel", i: 12, o: 642000, oldest: "55 d", lim: 1500000 },
          { c: "Reliance Jio", i: 2, o: 98000, oldest: "92 d", lim: 500000 },
        ].map((r) => (
          <div key={r.c} className="rounded-md border border-border-subtle bg-surface p-3">
            <div className="text-[13px] font-semibold text-text-primary">{r.c}</div>
            <div className="mt-1 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div className="text-text-disabled">Invoices</div>
                <div className="font-mono text-text-primary">{r.i}</div>
              </div>
              <div>
                <div className="text-text-disabled">Outstanding</div>
                <div className="font-mono text-text-primary">₹{r.o.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-text-disabled">Oldest</div>
                <div className="text-text-primary">{r.oldest}</div>
              </div>
              <div>
                <div className="text-text-disabled">Credit limit</div>
                <div className="font-mono text-text-secondary">₹{r.lim.toLocaleString()}</div>
              </div>
            </div>
            <Button size="sm" variant="outline" className="mt-2 w-full">
              Statement
            </Button>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-2/40 text-left">
            <tr className="border-b border-border bg-surface-2/40 text-left">
              {["Company", "Invoices", "Outstanding", "Oldest", "Credit limit", "Action"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {[
              { c: "Infosys Ltd.", i: 8, o: 484000, oldest: "12 d", lim: 1000000 },
              { c: "HSBC India", i: 4, o: 218000, oldest: "32 d", lim: 800000 },
              { c: "Tata Steel", i: 12, o: 642000, oldest: "55 d", lim: 1500000 },
              { c: "Reliance Jio", i: 2, o: 98000, oldest: "92 d", lim: 500000 },
            ].map((r, i) => (
              <tr key={i} className="border-t border-border-subtle">
                <td className="px-4 py-3 font-medium text-text-primary">{r.c}</td>
                <td className="px-4 py-3 font-mono">{r.i}</td>
                <td className="px-4 py-3 font-mono text-text-primary">₹{r.o.toLocaleString()}</td>
                <td className="px-4 py-3 text-text-secondary">{r.oldest}</td>
                <td className="px-4 py-3 font-mono text-text-secondary">
                  ₹{r.lim.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline">
                    Statement
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
