import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export function LocationSelectionModal({
  type,
  currentValue,
  onClose,
  onSave
}: {
  type: "Dine-in" | "Room Service";
  currentValue: string;
  onClose: () => void;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(currentValue);

  // Mock data
  const tables = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "Outdoor-1", "Outdoor-2"];
  const rooms = ["101", "102", "103", "104", "201", "202", "203", "301", "302", "Suite-1"];

  const options = type === "Dine-in" ? tables : rooms;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border shadow-2xl rounded-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2/30">
          <div>
            <h2 className="text-[16px] font-semibold text-text-primary">
              {type === "Dine-in" ? "Select Table" : "Select Room"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-2 text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-3 gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => setValue(opt)}
                className={`h-12 flex items-center justify-center rounded-lg border font-medium text-[13px] transition-colors ${
                  value === opt 
                    ? "bg-primary border-primary text-primary-contrast" 
                    : "bg-surface border-border text-text-primary hover:border-primary-tint"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 px-5 border-t border-border flex justify-end gap-3 pb-5 bg-surface-2/30">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={() => onSave(value)} disabled={!value}>
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
