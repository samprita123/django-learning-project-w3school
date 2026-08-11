import { Banknote, CreditCard, Smartphone } from "lucide-react";
import { Card, CardHeader, Button } from "@/components/ui/Primitives";

export function PaymentView() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader
          title="Multi-tender payment"
          hint="Split across cash · card · UPI · city ledger"
        />
        <div className="space-y-3 p-4 sm:p-5">
          {[
            { icon: Banknote, name: "Cash", val: "₹2,000", ref: "Cashier · Sunil" },
            { icon: CreditCard, name: "Card · Visa **4421", val: "₹15,326", ref: "APRV-882910" },
            { icon: Smartphone, name: "UPI · GPay", val: "₹20,000", ref: "UPI/2026/77361" },
          ].map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface px-3 py-3 sm:flex-nowrap sm:gap-3 sm:px-4"
              >
                <Icon className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-text-primary">{p.name}</div>
                  <div className="font-mono text-[11px] text-text-disabled">{p.ref}</div>
                </div>
                <span className="font-mono text-[14px] font-semibold text-text-primary">
                  {p.val}
                </span>
                <button className="text-[11px] text-[var(--color-error)] hover:underline">
                  Remove
                </button>
              </div>
            );
          })}
          <Button variant="outline" size="sm">
            + Add tender
          </Button>
        </div>
        <div className="border-t border-border bg-surface-2/40 p-4 text-right sm:p-5">
          <div className="text-[12px] text-text-secondary">
            Total tendered{" "}
            <span className="ml-2 font-mono text-[18px] font-semibold text-text-primary">
              ₹37,326
            </span>
          </div>
          <Button className="mt-2" size="sm">
            Post payment
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Tender mix · MTD" />
        <ul className="space-y-3 p-4 text-[12px] sm:p-5">
          {[
            { n: "Card", pct: 58 },
            { n: "UPI", pct: 22 },
            { n: "Cash", pct: 11 },
            { n: "City Ledger", pct: 7 },
            { n: "Voucher", pct: 2 },
          ].map((t) => (
            <li key={t.n}>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t.n}</span>
                <span className="font-mono text-text-primary">{t.pct}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div className="h-full bg-primary" style={{ width: `${t.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
