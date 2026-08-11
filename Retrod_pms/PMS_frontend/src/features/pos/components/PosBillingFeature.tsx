import { useState } from "react";
import { PageHeader, Card, KpiCard, StatusBadge, Button } from "@/components/ui/Primitives";
import { Search, Filter, Printer, RotateCcw, FileText, Banknote } from "lucide-react";
import { ReturnsExchangeModal } from "./ReturnsExchangeModal";
import { PaymentModal } from "./PaymentModal";
import { toast } from "sonner";

type Bill = {
  id: string;
  table: string;
  amount: number;
  method: string;
  status: "Settled" | "Pending" | "Refunded";
  date: string;
};

const initialBills: Bill[] = [
  { id: "POS-INV-2201", table: "T-12", amount: 4860, method: "Room charge · 312", status: "Settled", date: "Today 14:30" },
  { id: "POS-INV-2200", table: "T-08", amount: 1640, method: "UPI", status: "Pending", date: "Today 14:15" },
  { id: "POS-INV-2199", table: "Walk-in", amount: 2200, method: "Cash", status: "Settled", date: "Today 13:45" },
  { id: "POS-INV-2198", table: "Takeaway", amount: 850, method: "Card", status: "Refunded", date: "Yesterday 20:10" },
];

export function PosBillingFeature() {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [refundInvoice, setRefundInvoice] = useState<string | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<string | null>(null);

  const handlePrint = (id: string) => {
    toast(`Printing Invoice ${id}...`, { icon: <Printer className="h-4 w-4" /> });
  };

  const handleView = (id: string) => {
    toast(`Opening Invoice ${id}...`, { icon: <FileText className="h-4 w-4" /> });
  };

  const handleCollectPayment = (id: string) => {
    setPaymentInvoice(id);
  };

  const openChecks = bills.filter(b => b.status === "Pending").length;
  
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <PageHeader
        eyebrow="Outlet Billing"
        title="Checks & Settlements"
        description="Split bills, room posting, tender reconciliation, and sales history."
      />
      
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Open checks" value={String(openChecks)} accent="warning" />
          <KpiCard label="Settled · today" value="₹24,500" accent="success" />
          <KpiCard label="Room charges" value="12" accent="info" />
          <KpiCard label="Refunds" value="₹850" accent="error" deltaTone="error" />
        </div>
        
        <Card className="flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-border bg-surface-2/30 flex flex-wrap gap-3 items-center justify-between">
            <h2 className="text-[15px] font-semibold text-text-primary">Sales History</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled" />
                <input
                  type="text"
                  placeholder="Search invoice, table, amount..."
                  className="w-full h-8 bg-background border border-border rounded-md pl-8 pr-3 text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-[13px] whitespace-nowrap">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["Invoice", "Date / Time", "Table", "Amount", "Tender", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-2/30 group">
                    <td className="px-4 py-3 font-mono text-[12px] font-medium text-text-primary">{b.id}</td>
                    <td className="px-4 py-3 text-text-secondary">{b.date}</td>
                    <td className="px-4 py-3">{b.table}</td>
                    <td className="px-4 py-3 font-mono font-medium">₹{b.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-text-secondary">{b.method}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={b.status === "Settled" ? "success" : b.status === "Refunded" ? "error" : "warning"}>
                        {b.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleView(b.id)} className="p-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-text-primary" title="View Invoice">
                          <FileText className="h-4 w-4" />
                        </button>
                        <button onClick={() => handlePrint(b.id)} className="p-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-text-primary" title="Print">
                          <Printer className="h-4 w-4" />
                        </button>
                        {b.status === "Pending" && (
                          <button 
                            onClick={() => handleCollectPayment(b.id)} 
                            className="p-1.5 rounded hover:bg-success-tint text-text-secondary hover:text-success" 
                            title="Collect Payment"
                          >
                            <Banknote className="h-4 w-4" />
                          </button>
                        )}
                        {b.status === "Settled" && (
                          <button 
                            className="p-1.5 rounded hover:bg-error-tint text-text-secondary hover:text-error" 
                            title="Refund"
                            onClick={() => setRefundInvoice(b.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {refundInvoice && (
        <ReturnsExchangeModal 
          invoiceId={refundInvoice} 
          onClose={() => setRefundInvoice(null)} 
        />
      )}

      {paymentInvoice && (
        <PaymentModal
          total={bills.find(b => b.id === paymentInvoice)?.amount || 0}
          onClose={() => setPaymentInvoice(null)}
          onSuccess={() => {
            setBills(prev => prev.map(b => b.id === paymentInvoice ? { ...b, status: "Settled" } : b));
            setPaymentInvoice(null);
            toast.success(`Payment collected successfully for ${paymentInvoice}`);
          }}
        />
      )}
    </div>
  );
}
