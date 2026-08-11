import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { CheckCircle2, QrCode } from "lucide-react";

type DisplayState = {
  items: { name: string; qty: number; price: number; total: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMode: "idle" | "upi" | "success";
  upiAmount: number;
};

export function CustomerDisplayFeature() {
  const [state, setState] = useState<DisplayState>({
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    paymentMode: "idle",
    upiAmount: 0,
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const data = localStorage.getItem("pos_customer_display_state");
        if (data) setState(JSON.parse(data));
      } catch (e) {
        // ignore
      }
    };
    
    // Initial load
    handleStorage();

    // Listen to changes
    window.addEventListener("storage", handleStorage);
    window.addEventListener("pos_display_sync", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pos_display_sync", handleStorage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex text-text-primary">
      {/* Left Column: Invoice Details */}
      <div className="flex-1 p-12 flex flex-col max-w-4xl mx-auto">
        <div className="mb-12 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-brand/20">R</div>
          <div>
            <h1 className="text-2xl font-bold">Retrod Hotel & Resort</h1>
            <p className="text-text-secondary text-sm">Welcome! Please review your order.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-surface rounded-2xl border border-border shadow-sm p-8 flex flex-col">
          {state.items.length === 0 && state.paymentMode !== "success" ? (
            <div className="flex-1 flex flex-col items-center justify-center text-text-secondary">
              <QrCode className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg">Your items will appear here</p>
            </div>
          ) : state.paymentMode === "success" ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-text-secondary text-lg">Thank you for your visit. Have a wonderful day!</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                {state.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-lg">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 bg-surface-2 rounded-lg flex items-center justify-center font-bold text-brand">{item.qty}</div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono">₹{item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t-2 border-border border-dashed space-y-3">
                <div className="flex justify-between text-text-secondary text-lg">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{state.subtotal.toFixed(2)}</span>
                </div>
                {state.discount > 0 && (
                  <div className="flex justify-between text-error font-medium text-lg">
                    <span>Discount</span>
                    <span className="font-mono">-₹{state.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-secondary text-lg">
                  <span>Tax (5%)</span>
                  <span className="font-mono">₹{state.tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-end pt-6">
                  <span className="text-2xl font-bold">Total Amount</span>
                  <span className="text-4xl font-mono font-bold text-brand">₹{state.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Dynamic QR or Status */}
      <div className="w-[450px] bg-surface-2 border-l border-border p-12 flex flex-col justify-center">
        {state.paymentMode === "upi" ? (
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center animate-in slide-in-from-right duration-500">
            <h3 className="text-xl font-bold text-black mb-1">Scan to Pay</h3>
            <p className="text-gray-500 mb-8">Pay using any UPI App</p>
            
            <div className="bg-white p-4 rounded-xl border-2 border-brand/20 mb-8 w-64 h-64">
              <QRCode
                value={`upi://pay?pa=retrod@upi&pn=Retrod%20Hotel&am=${state.upiAmount.toFixed(2)}&cu=INR&tn=POS%20Payment`}
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
            </div>
            
            <div className="w-full bg-surface py-3 rounded-lg flex items-center justify-between px-4 border border-border">
              <span className="text-text-secondary">Amount to Pay</span>
              <span className="font-mono font-bold text-lg text-black">₹{state.upiAmount.toFixed(2)}</span>
            </div>
          </div>
        ) : state.paymentMode === "success" ? (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-brand">Paid</h3>
          </div>
        ) : (
          <div className="text-center opacity-50">
            <h3 className="text-xl font-medium">Awaiting Payment...</h3>
          </div>
        )}
      </div>
    </div>
  );
}
