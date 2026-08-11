import { Card, CardHeader, StatusBadge } from "@/components/ui/Primitives";
import { type Reservation } from "@/types/pms";
import { Link } from "@tanstack/react-router";

interface TableViewProps {
  filtered: Reservation[];
  sourceColor: Record<string, string>;
  statusTone: (
    s: string,
  ) => "success" | "warning" | "error" | "info" | "neutral" | "brand" | "dark";
}

export function TableView({ filtered, sourceColor, statusTone }: TableViewProps) {
  // Keep latest reservations on top (sort by check-in date descending)
  const sorted = [...filtered].sort((a, b) => b.ci.localeCompare(a.ci));

  return (
    <Card>
      <CardHeader title="All reservations" hint={`${sorted.length} records`} />
      <div className="space-y-2 p-3 sm:p-4 md:hidden">
        {sorted.map((r) => (
          <div key={r.id} className="rounded-md border border-border-subtle bg-surface p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[11px] text-text-secondary font-medium">#{r.room}</span>
              <StatusBadge tone={statusTone(r.status)}>{r.status}</StatusBadge>
            </div>
            <Link to={"/reservations/" + r.id} className="text-[13px] font-semibold text-text-primary hover:text-primary">{r.guest}</Link>
            <div className="text-[11px] text-text-secondary">
              {r.room.includes("Unassigned") ? (
                <Link
                  to={"/reservations/" + r.id}
                  className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/20 transition"
                >
                  Assign Room
                </Link>
              ) : (
                <span>{r.room}</span>
              )}{" "}
              · {r.type}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div className="text-text-disabled">Check-in</div>
                <div className="text-text-primary">{r.ci}</div>
              </div>
              <div>
                <div className="text-text-disabled">Check-out</div>
                <div className="text-text-primary">{r.co}</div>
              </div>
              <div>
                <div className="text-text-disabled">Amount</div>
                <div className="font-mono text-text-primary">₹{r.amount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-text-disabled">Balance</div>
                <div className="font-mono text-text-primary">
                  {r.balance ? `₹${r.balance.toLocaleString()}` : "—"}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ background: sourceColor[r.source] || "var(--color-text-disabled)" }}
                />
                {r.source}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-2/40 text-left">
              {[
                "Guest",
                "Room",
                "Check-in",
                "Check-out",
                "Source",
                "Amount",
                "Balance",
                "Status",
              ].map((h) => (
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
            {sorted.map((r) => (
              <tr key={r.id} className="border-b border-border-subtle hover:bg-surface-2/50">
                <td className="px-4 py-3 font-medium text-text-primary">
                  <Link to={"/reservations/" + r.id} className="hover:text-primary">{r.guest}</Link>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {r.room.includes("Unassigned") ? (
                    <Link
                      to={"/reservations/" + r.id}
                      className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/20 transition"
                    >
                      Assign Room
                    </Link>
                  ) : (
                    <span>{r.room}</span>
                  )}{" "}
                  · <span className="text-text-disabled">{r.type}</span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{r.ci}</td>
                <td className="px-4 py-3 text-text-secondary">{r.co}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-text-secondary">
                    <span
                      className="h-2 w-2 rounded-sm"
                      style={{ background: sourceColor[r.source] || "var(--color-text-disabled)" }}
                    />
                    {r.source}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-text-primary">
                  ₹{r.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono">
                  {r.balance ? (
                    <span className="text-[var(--color-error)]">₹{r.balance.toLocaleString()}</span>
                  ) : (
                    <span className="text-text-disabled">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge tone={statusTone(r.status)}>{r.status}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
export default TableView;
