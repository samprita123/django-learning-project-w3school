import { RotateCcw } from "lucide-react";
import { Card, CardHeader, StatusBadge, Button } from "@/components/ui/Primitives";
import type { ComponentProps } from "react";

type BadgeTone = ComponentProps<typeof StatusBadge>["tone"];

export function RefundView() {
  return (
    <Card>
      <CardHeader
        title="Refunds · dual approval workflow"
        hint="Above ₹10,000 requires Finance Manager"
      />
      <ul className="divide-y divide-border-subtle">
        {[
          {
            g: "Hiroshi Tanaka",
            inv: "INV-3082",
            amt: 4800,
            type: "Card reversal · Visa **8821",
            s: "Pending GM",
            tone: "warning",
          },
          {
            g: "Marcus Weber",
            inv: "INV-3079",
            amt: 2200,
            type: "Cash refund",
            s: "Approved",
            tone: "success",
          },
          {
            g: "Aisha Khan",
            inv: "INV-3061",
            amt: 12000,
            type: "Credit note",
            s: "Pending Finance",
            tone: "warning",
          },
        ].map((r, i) => (
          <li key={i} className="flex items-center gap-3 px-5 py-3.5">
            <RotateCcw className="h-4 w-4 text-[var(--color-error)]" />
            <div className="flex-1">
              <div className="text-[13px] font-medium text-text-primary">
                {r.g} · {r.inv}
              </div>
              <div className="text-[11px] text-text-secondary">{r.type}</div>
            </div>
            <span className="font-mono text-[13px] text-text-primary">
              ₹{r.amt.toLocaleString()}
            </span>
            <StatusBadge tone={r.tone as BadgeTone}>{r.s}</StatusBadge>
            <Button size="sm" variant="outline">
              Review
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
