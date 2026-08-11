import { useState, useEffect } from "react";
import { X, CreditCard, Banknote, Smartphone, CheckCircle2, Plus, Trash2, Bed, Gift, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Primitives";
import QRCode from "react-qr-code";
import { toast } from "sonner";

export function PaymentModal({
  total,
  onClose,
  onSuccess
}: {
  total: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [payments, setPayments] = useState<{id: string, method: string, amount: number, ref: string}[]>([]);
  const [method, setMethod] = useState<string>("Cash");
  const [currentAmount, setCurrentAmount] = useState<number>(total);
  const [currentRef, setCurrentRef] = useState<string>("");

  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);
  const change = Math.max(0, totalPaid - total);
  const isSufficient = totalPaid >= total;

  useEffect(() => {
    setCurrentAmount(remaining);
  }, [remaining]);

  // Sync to customer display
  useEffect(() => {
    try {
      const data = localStorage.getItem("pos_customer_display_state");
      if (data) {
        const state = JSON.parse(data);
        if (method === "UPI" || method === "QR Code Payment") {
          localStorage.setItem("pos_customer_display_state", JSON.stringify({ ...state, paymentMode: "upi", upiAmount: currentAmount }));
        } else {
          localStorage.setItem("pos_customer_display_state", JSON.stringify({ ...state, paymentMode: "idle" }));
        }
        window.dispatchEvent(new Event("pos_display_sync"));
      }
    } catch (e) {
      // ignore
    }
  }, [method, currentAmount]);

  const handleAddPayment = (autoAmount?: number) => {
    const amt = autoAmount || currentAmount;
    if (amt <= 0) return;
    
    setPayments([...payments, {
      id: Math.random().toString(36).substr(2, 9),
      method,
      amount: amt,
      ref: currentRef
    }]);
    setCurrentRef("");
  };

  const removePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const handleComplete = () => {
    try {
      const data = localStorage.getItem("pos_customer_display_state");
      if (data) {
        const state = JSON.parse(data);
        localStorage.setItem("pos_customer_display_state", JSON.stringify({ ...state, paymentMode: "success" }));
        window.dispatchEvent(new Event("pos_display_sync"));
      }
    } catch {}
    
    // Simulate printing
    toast("Generating and Printing Invoice...", { icon: <CheckCircle2 className="h-4 w-4 text-success" /> });
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  const methods = [
    { label: "Cash", icon: <Banknote className="h-5 w-5" /> },
    { label: "Credit Card", icon: <CreditCard className="h-5 w-5" /> },
    { label: "Debit Card", icon: <CreditCard className="h-5 w-5" /> },
    { label: "UPI", icon: <Smartphone className="h-5 w-5" /> },
    { label: "Room Charge", icon: <Bed className="h-5 w-5" /> },
    { label: "Digital Wallet", icon: <Wallet className="h-5 w-5" /> },
    { label: "Gift Card", icon: <Gift className="h-5 w-5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border shadow-2xl rounded-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface-2/30">
          <div>
            <h2 className="text-[20px] font-semibold text-text-primary">Checkout</h2>
            <p className="text-[13px] text-text-secondary mt-0.5">Split payments and digital QR</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 text-text-secondary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left: Payment Methods */}
          <div className="w-full lg:w-1/3 border-r border-border bg-surface-2/10 p-5 overflow-y-auto">
            <div className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-3">Select Method</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {methods.map(m => (
                <button
                  key={m.label}
                  onClick={() => setMethod(m.label)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    method === m.label 
                      ? "border-primary bg-primary-tint text-primary-pressed ring-2 ring-primary/20 shadow-sm" 
                      : "border-border bg-surface text-text-secondary hover:bg-surface-2 hover:border-border-strong hover:text-text-primary shadow-sm"
                  }`}
                >
                  <div className={method === m.label ? "text-primary" : "text-text-disabled"}>{m.icon}</div>
                  <span className="text-[14px] font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Middle: Entry & QR */}
          <div className="flex-1 p-6 flex flex-col border-r border-border overflow-y-auto">
            <div className="text-[18px] font-semibold text-text-primary mb-6 flex items-center gap-2">
              {methods.find(m => m.label === method)?.icon}
              {method} Payment
            </div>

            {method === "UPI" || method === "QR Code Payment" ? (
              <div className="flex flex-col items-center justify-center flex-1 space-y-6">
                <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
                  <QRCode
                    value={`upi://pay?pa=retrod@upi&pn=Retrod%20Hotel&am=${currentAmount.toFixed(2)}&cu=INR`}
                    size={200}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-medium text-text-primary">Scan with any UPI App</p>
                  <p className="text-[13px] text-text-secondary mt-1">Amount: <span className="font-mono font-bold text-text-primary">₹{currentAmount.toFixed(2)}</span></p>
                </div>
                
                {/* Mock Payment Simulation */}
                <Button 
                  variant="outline" 
                  className="mt-4 border-brand text-brand hover:bg-brand-tint w-full"
                  onClick={() => {
                    toast.success("Simulated Payment Received via UPI!");
                    handleAddPayment(currentAmount);
                  }}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Simulate Payment Received
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-text-primary">Amount to Pay</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-mono text-lg">₹</span>
                    <input 
                      type="number" 
                      className="w-full h-12 bg-surface border border-border rounded-lg pl-9 pr-4 font-mono text-[18px] font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                      value={currentAmount || ""}
                      onChange={(e) => setCurrentAmount(parseFloat(e.target.value) || 0)}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-text-primary">Reference / Notes (Optional)</label>
                  <input 
                    type="text" 
                    placeholder={method === "Room Charge" ? "Room Number e.g., 302" : "Txn ID or Remarks"}
                    className="w-full h-10 bg-surface border border-border rounded-lg px-4 text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                    value={currentRef}
                    onChange={(e) => setCurrentRef(e.target.value)}
                  />
                </div>

                <Button variant="secondary" className="w-full h-10 mt-2" onClick={() => handleAddPayment()}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Payment
                </Button>

                {method === "Cash" && (
                  <div className="grid grid-cols-4 gap-2 pt-4">
                    {[100, 500, 1000, 2000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setCurrentAmount(amt)}
                        className="h-9 rounded-lg border border-border bg-surface-2/50 text-[13px] font-mono hover:bg-surface-2 hover:border-border-strong transition-colors"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Summary & Cart */}
          <div className="w-full lg:w-[320px] bg-surface-2/30 p-5 flex flex-col">
            <div className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-4">Transaction Summary</div>
            
            <div className="bg-surface rounded-xl p-4 border border-border shadow-sm mb-6 space-y-3">
              <div className="flex justify-between text-[14px]">
                <span className="text-text-secondary">Total Due</span>
                <span className="font-mono font-bold text-text-primary text-[16px]">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-text-secondary">Total Paid</span>
                <span className="font-mono font-bold text-success text-[16px]">₹{totalPaid.toFixed(2)}</span>
              </div>
              <div className="border-t border-border-subtle pt-3 mt-1 flex justify-between items-center">
                <span className="text-[13px] font-medium text-text-primary">Remaining</span>
                <span className={`font-mono font-bold text-[20px] ${remaining > 0 ? 'text-error' : 'text-text-disabled'}`}>
                  ₹{remaining.toFixed(2)}
                </span>
              </div>
              {change > 0 && (
                <div className="flex justify-between text-[14px] bg-success-tint/50 p-2 rounded text-success mt-2">
                  <span className="font-medium">Change Due</span>
                  <span className="font-mono font-bold">₹{change.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
              <div className="text-[12px] font-medium text-text-secondary mb-2">Applied Payments</div>
              {payments.length === 0 ? (
                <div className="text-[13px] text-text-disabled italic text-center py-4 border border-dashed border-border rounded-lg">
                  No payments added yet
                </div>
              ) : (
                payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-surface border border-border-subtle rounded-lg shadow-sm group">
                    <div>
                      <div className="text-[13px] font-medium text-text-primary">{p.method}</div>
                      {p.ref && <div className="text-[11px] text-text-secondary mt-0.5">{p.ref}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[14px] font-bold text-success">₹{p.amount.toFixed(2)}</span>
                      <button onClick={() => removePayment(p.id)} className="text-text-disabled hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button 
              variant="primary" 
              className="w-full h-12 text-[15px] shadow-md shadow-primary/20"
              disabled={!isSufficient}
              onClick={handleComplete}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Complete Transaction
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
