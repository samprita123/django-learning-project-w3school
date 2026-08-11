import { Card, CardHeader, StatusBadge, Button } from "@/components/ui/Primitives";

export function DepositView() {
  return (
    <Card>
      <CardHeader title="Advance deposits" action={<Button size="sm">+ Collect deposit</Button>} />
      <table className="w-full text-[13px]">
        <thead className="bg-surface-2/40 text-left">
          <tr className="border-b border-border bg-surface-2/40 text-left">
            {["Reservation", "Guest", "Collected", "Applied", "Outstanding", "Status"].map((h) => (
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
          {[
            { id: "RES-2048", g: "Sophie Laurent", c: 50000, a: 0, o: 50000, s: "Held" },
            { id: "RES-2044", g: "Elena Rodriguez", c: 25000, a: 25000, o: 0, s: "Applied" },
            { id: "RES-2046", g: "Aisha Khan", c: 12000, a: 0, o: 0, s: "Forfeited (no-show)" },
          ].map((r, i) => (
            <tr key={i} className="border-t border-border-subtle">
              <td className="px-4 py-3 font-mono text-text-primary">{r.id}</td>
              <td className="px-4 py-3 font-medium text-text-primary">{r.g}</td>
              <td className="px-4 py-3 font-mono">₹{r.c.toLocaleString()}</td>
              <td className="px-4 py-3 font-mono text-text-secondary">₹{r.a.toLocaleString()}</td>
              <td className="px-4 py-3 font-mono">
                {r.o ? (
                  <span className="text-[var(--color-warning)]">₹{r.o.toLocaleString()}</span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  tone={r.s === "Applied" ? "success" : r.s === "Held" ? "info" : "error"}
                >
                  {r.s}
                </StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
