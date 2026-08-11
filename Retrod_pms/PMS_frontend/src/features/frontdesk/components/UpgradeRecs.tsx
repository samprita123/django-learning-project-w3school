import { ArrowUpCircle } from "lucide-react";
import { Card, CardHeader, Button } from "@/components/ui/Primitives";

export function UpgradeRecs() {
  return (
    <Card>
      <CardHeader
        title="Upgrade recommendations"
        hint="Loyalty + occupancy-driven · GM approval for comp"
      />
      <ul className="divide-y divide-border-subtle">
        {[
          {
            g: "Hiroshi Tanaka",
            cur: "Executive 108",
            up: "Premier Suite 312",
            reason: "Platinum loyalty · 6 stays",
            price: "Comp",
          },
          {
            g: "Sophie Laurent",
            cur: "Heritage Suite 405",
            up: "Presidential 501",
            reason: "VIP1 · 4-night stay",
            price: "Comp",
          },
          {
            g: "Marcus Weber",
            cur: "Deluxe Twin 215",
            up: "Deluxe King 211",
            reason: "Available · same-type cleaner",
            price: "₹0",
          },
        ].map((u, i) => (
          <li key={i} className="flex items-center gap-4 px-5 py-4">
            <ArrowUpCircle className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="text-[13px] font-medium text-text-primary">{u.g}</div>
              <div className="text-[11px] text-text-secondary">
                {u.cur} → <span className="text-text-primary">{u.up}</span> · {u.reason}
              </div>
            </div>
            <span className="font-mono text-[12px] text-primary">{u.price}</span>
            <Button size="sm">Apply upgrade</Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
export default UpgradeRecs;
