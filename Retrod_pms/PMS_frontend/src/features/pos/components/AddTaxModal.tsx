import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export type TaxRate = {
  id: number;
  name: string;
  rate: number;
  appliesTo: string;
};

export function AddTaxModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (tax: TaxRate) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    rate: "",
    appliesTo: "All Food Items",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.rate) {
      onSave({
        id: Date.now(),
        name: formData.name,
        rate: parseFloat(formData.rate) || 0,
        appliesTo: formData.appliesTo,
      });
    } else {
      alert("Please provide both a name and a rate.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border shadow-2xl rounded-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2/30">
          <div>
            <h2 className="text-[16px] font-semibold text-text-primary">Add Tax Rate</h2>
            <p className="text-[12px] text-text-secondary mt-0.5">Create a new tax or fee.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-2 text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-[13px] font-medium text-text-primary">Tax Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. VAT, Service Charge"
              className="w-full h-9 border border-border rounded-md px-3 text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-medium text-text-primary">Rate (%) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              placeholder="0.00"
              className="w-full h-9 border border-border rounded-md px-3 text-[13px] font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-medium text-text-primary">Applies To</label>
            <select
              value={formData.appliesTo}
              onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value })}
              className="w-full h-9 border border-border rounded-md px-3 text-[13px] bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option>All Food Items</option>
              <option>Beverages</option>
              <option>Dine-in Only</option>
              <option>Delivery Only</option>
              <option>All Items</option>
            </select>
          </div>

          <div className="pt-4 border-t border-border mt-6 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Save Tax
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
