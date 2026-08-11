import { DollarSign, Download, ArrowUpRight, CheckCircle2, Clock, Calendar } from "lucide-react";
import { Card, CardHeader, Button, StatusBadge, KpiCard } from "@/components/ui/Primitives";

export function AgentCommissions() {
  const commissions = [
    { id: "INV-2026-004", period: "April 2026", amount: "₹45,200", status: "Paid", date: "05 May 2026", tone: "success", icon: CheckCircle2 },
    { id: "INV-2026-003", period: "March 2026", amount: "₹38,500", status: "Paid", date: "04 Apr 2026", tone: "success", icon: CheckCircle2 },
    { id: "INV-2026-002", period: "February 2026", amount: "₹41,100", status: "Paid", date: "05 Mar 2026", tone: "success", icon: CheckCircle2 },
    { id: "INV-2026-001", period: "January 2026", amount: "₹29,800", status: "Paid", date: "06 Feb 2026", tone: "success", icon: CheckCircle2 },
  ];

  const pendingCommissions = [
    { ref: "RES-9983", guest: "John Doe", checkout: "26 May 2026", amount: "₹14,450", comm: "₹2,550", status: "Pending (May)" },
    { ref: "RES-9979", guest: "Priya Sharma", checkout: "30 May 2026", amount: "₹38,000", comm: "₹5,700", status: "Pending (May)" },
    { ref: "RES-9970", guest: "Anita Desai", checkout: "05 Jun 2026", amount: "₹28,500", comm: "₹4,275", status: "Pending (June)" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Commission Management</h2>
        <p className="text-[13px] text-text-secondary mt-1">Track your earnings, pending payouts, and download invoices.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Pending Payment (May)" value="₹1,12,400" delta="Due by 05 Jun" deltaTone="neutral" accent="brand" />
        <KpiCard label="Total Earned (YTD)" value="₹1,54,600" delta="↑ 12% YoY" deltaTone="success" accent="success" />
        <KpiCard label="Avg. Commission %" value="15.8%" delta="Across all bookings" deltaTone="neutral" accent="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Pending Commissions" hint="Unpaid bookings" />
            <div className="p-4 border-b border-border-subtle bg-surface-2/30 flex justify-between items-center">
              <div className="text-[13px] font-medium text-text-primary">Accrued Unpaid: <span className="text-brand font-bold">₹12,525</span></div>
              <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
            </div>
            <div className="table-scroll-shadow overflow-x-auto">
              <table className="w-full text-[13px] text-left">
                <thead className="bg-surface-2/50 text-[10px] uppercase tracking-wider text-text-secondary border-b border-border-subtle">
                  <tr>
                    <th className="p-4 font-medium">Booking Ref</th>
                    <th className="p-4 font-medium">Guest</th>
                    <th className="p-4 font-medium">Checkout Date</th>
                    <th className="p-4 font-medium">Net Value</th>
                    <th className="p-4 font-medium">Commission</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {pendingCommissions.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-2/30 transition-colors">
                      <td className="p-4 font-mono text-[12px] text-brand font-medium">{row.ref}</td>
                      <td className="p-4">{row.guest}</td>
                      <td className="p-4">{row.checkout}</td>
                      <td className="p-4 text-text-secondary">{row.amount}</td>
                      <td className="p-4 font-medium text-text-primary">{row.comm}</td>
                      <td className="p-4 text-[12px] text-warning flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" /> {row.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Payout Invoices" hint="Monthly settlement" />
            <div className="p-4 space-y-4">
              {commissions.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:border-brand/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                      <inv.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-text-primary">{inv.period}</div>
                      <div className="text-[11px] text-text-secondary">{inv.id} • Paid on {inv.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-bold text-text-primary">{inv.amount}</div>
                    <button className="text-[11px] font-medium text-brand hover:underline flex items-center justify-end gap-1 mt-1">
                      PDF <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border-subtle bg-surface-2/30">
              <Button variant="outline" className="w-full justify-center">View All Past Invoices</Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Bank Details" />
            <div className="p-4 space-y-4">
              <div className="p-3 rounded-lg bg-surface-2 border border-border">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[13px] font-medium text-text-primary">HDFC Bank Ltd.</div>
                  <StatusBadge tone="success" className="text-[10px]">Verified</StatusBadge>
                </div>
                <div className="text-[12px] text-text-secondary space-y-1 font-mono">
                  <div>XXXX XXXX XXXX 4921</div>
                  <div>IFSC: HDFC0001234</div>
                </div>
              </div>
              <Button variant="outline" className="w-full justify-center">Update Bank Details</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
