import { Card, CardHeader, StatusBadge, Button } from "@/components/ui/Primitives";
import type { ComponentProps } from "react";

type BadgeTone = ComponentProps<typeof StatusBadge>["tone"];

export function OOOManagement() {
  return (
    <Card>
      <CardHeader
        title="Out of Order management"
        hint="Removed from inventory · auto work order"
        action={<Button size="sm">+ Mark room OOO</Button>}
      />
      <table className="w-full text-[13px]">
        <thead className="bg-surface-2/40 text-left">
          <tr className="border-b border-border bg-surface-2/40 text-left">
            {["Room", "Type", "Reason", "From", "Until", "Work order", "Status"].map((h) => (
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
            {
              r: "207",
              t: "Deluxe King",
              reason: "HVAC failure",
              f: "14 May",
              u: "16 May",
              wo: "WO-1102",
              s: "In progress",
              tone: "warning",
            },
            {
              r: "105",
              t: "Executive",
              reason: "Carpet replacement",
              f: "12 May",
              u: "20 May",
              wo: "WO-1098",
              s: "Scheduled",
              tone: "info",
            },
            {
              r: "318",
              t: "Premier Suite",
              reason: "Renovation",
              f: "01 Apr",
              u: "30 Jun",
              wo: "WO-1042",
              s: "Long-term",
              tone: "neutral",
            },
          ].map((x, i) => (
            <tr key={i} className="border-t border-border-subtle">
              <td className="px-4 py-3 font-mono font-semibold text-text-primary">{x.r}</td>
              <td className="px-4 py-3 text-text-secondary">{x.t}</td>
              <td className="px-4 py-3 text-text-primary">{x.reason}</td>
              <td className="px-4 py-3 text-text-secondary">{x.f}</td>
              <td className="px-4 py-3 text-text-secondary">{x.u}</td>
              <td className="px-4 py-3 font-mono text-text-secondary">{x.wo}</td>
              <td className="px-4 py-3">
                <StatusBadge tone={x.tone as BadgeTone}>{x.s}</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
export default OOOManagement;
