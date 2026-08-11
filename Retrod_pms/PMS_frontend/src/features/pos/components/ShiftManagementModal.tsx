import { useState } from "react";
import { X, Wallet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export function ShiftManagementModal({
  onClose
}: {
  onClose: () => void;
}) {
  const [shiftStatus, setShiftStatus] = useState<"Closed" | "Open">("Closed");
  const [amount, setAmount] = useState<number | "">("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border shadow-e2 rounded-xl w-full max-w-md overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2/30">
          <div>
            <h2 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Shift Management
            </h2>
            <p className="text-[12px] text-text-secondary mt-0.5">Current Status: <span className={shiftStatus === 'Open' ? 'text-success font-medium' : 'text-error font-medium'}>{shiftStatus}</span></p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-2 text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 flex-1 space-y-5">
          {shiftStatus === "Closed" ? (
            <>
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-text-primary">Opening Float / Cash in Drawer</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-mono">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || "")}
                    placeholder="0.00"
                    className="w-full h-10 border border-border rounded-lg pl-8 pr-3 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <p className="text-[11px] text-text-secondary">Enter the amount of cash you are starting the shift with.</p>
              </div>
              <Button 
                variant="primary" 
                className="w-full h-10" 
                disabled={amount === ""}
                onClick={() => {
                  setShiftStatus("Open");
                  setAmount("");
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Open Shift
              </Button>
            </>
          ) : (
             <>
               <div className="bg-surface-2/50 border border-border p-4 rounded-lg space-y-3">
                 <div className="flex justify-between text-[13px]">
                   <span className="text-text-secondary">Opening Float</span>
                   <span className="font-mono font-medium">₹2,000.00</span>
                 </div>
                 <div className="flex justify-between text-[13px]">
                   <span className="text-text-secondary">Cash Sales</span>
                   <span className="font-mono font-medium text-success">+ ₹8,400.00</span>
                 </div>
                 <div className="flex justify-between text-[13px]">
                   <span className="text-text-secondary">Refunds (Cash)</span>
                   <span className="font-mono font-medium text-error">- ₹450.00</span>
                 </div>
                 <div className="border-t border-border pt-2 flex justify-between font-bold text-[14px]">
                   <span>Expected Cash in Drawer</span>
                   <span className="font-mono text-brand">₹9,950.00</span>
                 </div>
               </div>

               <div className="space-y-2 mt-4">
                <label className="text-[13px] font-medium text-text-primary">Actual Cash in Drawer</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-mono">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || "")}
                    placeholder="0.00"
                    className="w-full h-10 border border-border rounded-lg pl-8 pr-3 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                {amount !== "" && (
                  <p className={`text-[11px] font-medium ${amount === 9950 ? 'text-success' : 'text-error'}`}>
                    Difference: ₹{((amount as number) - 9950).toFixed(2)}
                  </p>
                )}
              </div>
              <Button 
                variant="danger" 
                className="w-full h-10 mt-4" 
                disabled={amount === ""}
                onClick={() => {
                  alert("Shift Closed Successfully!");
                  onClose();
                }}
              >
                Close Shift
              </Button>
             </>
          )}
        </div>
      </div>
    </div>
  );
}
