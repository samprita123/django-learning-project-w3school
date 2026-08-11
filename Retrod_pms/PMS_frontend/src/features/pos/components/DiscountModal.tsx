import { useState } from "react";
import { X, Percent, Banknote } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export type DiscountInfo = {
  type: "percentage" | "flat";
  value: number;
};

export function DiscountModal({
  currentDiscount,
  subtotal,
  onClose,
  onApply,
  onRemove
}: {
  currentDiscount: DiscountInfo | null;
  subtotal: number;
  onClose: () => void;
  onApply: (discount: DiscountInfo) => void;
  onRemove: () => void;
}) {
  const [type, setType] = useState<"percentage" | "flat">(currentDiscount?.type || "percentage");
  const [value, setValue] = useState<number | "">(currentDiscount?.value || "");

  const handleApply = () => {
    if (value !== "" && value > 0) {
      // Validate percentage
      if (type === "percentage" && value > 100) {
        alert("Percentage cannot exceed 100%");
        return;
      }
      // Validate flat
      if (type === "flat" && value > subtotal) {
        alert("Flat discount cannot exceed subtotal");
        return;
      }
      onApply({ type, value: Number(value) });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border shadow-e2 rounded-xl w-full max-w-sm overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2/30">
          <div>
            <h2 className="text-[16px] font-semibold text-text-primary">Apply Discount</h2>
            <p className="text-[12px] text-text-secondary mt-0.5">Subtotal: ₹{subtotal.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-2 text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 flex-1 space-y-5">
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-2 rounded-lg border border-border-subtle">
            <button 
              className={`flex items-center justify-center gap-1.5 py-1.5 text-[13px] font-medium rounded-md transition-colors ${type === 'percentage' ? 'bg-surface shadow-sm text-text-primary border border-border' : 'text-text-secondary hover:text-text-primary'}`}
              onClick={() => setType("percentage")}
            >
              <Percent className="h-3.5 w-3.5" /> % Off
            </button>
            <button 
              className={`flex items-center justify-center gap-1.5 py-1.5 text-[13px] font-medium rounded-md transition-colors ${type === 'flat' ? 'bg-surface shadow-sm text-text-primary border border-border' : 'text-text-secondary hover:text-text-primary'}`}
              onClick={() => setType("flat")}
            >
              <Banknote className="h-3.5 w-3.5" /> ₹ Off
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-medium text-text-primary">Discount Value</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-mono">
                {type === "flat" ? "₹" : "%"}
              </span>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value) || "")}
                placeholder="0"
                className="w-full h-10 border border-border rounded-lg pl-8 pr-3 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

        </div>

        <div className="p-5 border-t border-border bg-surface-2/30 flex gap-3">
          {currentDiscount && (
            <Button variant="danger" className="w-1/3 h-10" onClick={onRemove}>
              Remove
            </Button>
          )}
          <Button 
            variant="primary" 
            className={`${currentDiscount ? 'w-2/3' : 'w-full'} h-10`}
            disabled={value === "" || value <= 0}
            onClick={handleApply}
          >
            Apply Discount
          </Button>
        </div>

      </div>
    </div>
  );
}
