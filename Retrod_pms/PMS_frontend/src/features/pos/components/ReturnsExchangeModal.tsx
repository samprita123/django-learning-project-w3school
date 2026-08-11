import { useState } from "react";
import { X, Search, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export function ReturnsExchangeModal({
  invoiceId,
  onClose
}: {
  invoiceId: string;
  onClose: () => void;
}) {
  const [returnQty, setReturnQty] = useState<Record<string, number>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  
  const invoiceItems = [
    { id: "i1", name: "Butter Chicken", qty: 2, price: 450 },
    { id: "i2", name: "Garlic Naan", qty: 4, price: 60 },
  ];

  const handleQtyChange = (id: string, qty: number, max: number) => {
    if (qty >= 0 && qty <= max) {
      setReturnQty(prev => ({ ...prev, [id]: qty }));
    }
  };

  const totalRefund = invoiceItems.reduce((acc, item) => {
    return acc + (returnQty[item.id] || 0) * item.price;
  }, 0);

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-surface border border-border shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden flex flex-col items-center text-center p-8">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-5">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Refund Processed</h2>
          <p className="text-text-secondary mb-6">The refund of <span className="font-mono font-bold text-text-primary">₹{totalRefund.toFixed(2)}</span> was processed successfully for invoice {invoiceId}.</p>
          <Button variant="primary" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border shadow-e2 rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2/30">
          <div>
            <h2 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Process Return / Refund
            </h2>
            <p className="text-[12px] text-text-secondary mt-0.5">Invoice: {invoiceId}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-2 text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          <div className="bg-warning-tint/50 border border-warning/20 p-3 rounded-lg flex gap-3 text-warning-strong text-[13px]">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Processing a return will automatically adjust the inventory stock and generate a credit note.</p>
          </div>

          <div>
            <h3 className="text-[13px] font-medium text-text-primary mb-3">Select Items to Return</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-[13px]">
                <thead className="bg-surface-2 text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium text-text-secondary">Item</th>
                    <th className="px-4 py-2 font-medium text-text-secondary text-center">Purchased</th>
                    <th className="px-4 py-2 font-medium text-text-secondary text-right">Price</th>
                    <th className="px-4 py-2 font-medium text-text-secondary text-center">Return Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoiceItems.map(item => (
                    <tr key={item.id} className="hover:bg-surface-2/30">
                      <td className="px-4 py-3 text-text-primary font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-center text-text-secondary">{item.qty}</td>
                      <td className="px-4 py-3 text-right font-mono text-text-secondary">₹{item.price}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            className="w-6 h-6 flex items-center justify-center rounded border border-border bg-surface hover:bg-surface-2 disabled:opacity-50"
                            onClick={() => handleQtyChange(item.id, (returnQty[item.id] || 0) - 1, item.qty)}
                            disabled={!returnQty[item.id]}
                          >-</button>
                          <span className="w-4 text-center font-mono">{returnQty[item.id] || 0}</span>
                          <button 
                            className="w-6 h-6 flex items-center justify-center rounded border border-border bg-surface hover:bg-surface-2 disabled:opacity-50"
                            onClick={() => handleQtyChange(item.id, (returnQty[item.id] || 0) + 1, item.qty)}
                            disabled={(returnQty[item.id] || 0) >= item.qty}
                          >+</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[13px] font-medium text-text-primary">Reason for Return</h3>
            <select className="w-full h-10 border border-border rounded-lg px-3 text-[13px] bg-background">
              <option>Quality Issue</option>
              <option>Incorrect Item</option>
              <option>Customer Changed Mind</option>
              <option>Billing Error</option>
            </select>
          </div>

        </div>

        <div className="p-5 border-t border-border bg-surface-2/30 flex items-center justify-between">
          <div>
            <div className="text-[12px] text-text-secondary">Total Refund Amount</div>
            <div className="text-[20px] font-mono font-bold text-error">₹{totalRefund.toFixed(2)}</div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="danger" disabled={totalRefund === 0} onClick={() => setIsSuccess(true)}>
              Confirm Refund
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
