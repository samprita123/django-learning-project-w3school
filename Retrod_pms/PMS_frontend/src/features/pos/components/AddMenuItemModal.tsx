import { useState } from "react";
import { X, CheckCircle2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export type MenuItem = {
  code: string;
  name: string;
  category: string;
  price: number;
  status: string;
  gstApplies?: boolean;
};

export function AddMenuItemModal({
  onClose,
  onSave,
  itemToEdit
}: {
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  itemToEdit?: MenuItem;
}) {
  const generateCode = (category: string) => {
    const prefix = category.split(' ').map(w => w[0].toUpperCase()).join('').substring(0, 2);
    const suffix = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${suffix}`;
  };

  const [formData, setFormData] = useState<Partial<MenuItem>>(
    itemToEdit || {
      code: generateCode("Main Course"),
      name: "",
      category: "Main Course",
      price: 0,
      status: "Active",
      gstApplies: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.code && formData.name && formData.price) {
      onSave(formData as MenuItem);
    } else {
      alert("Please fill in all required fields.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border-l border-border shadow-2xl w-full max-w-md flex flex-col h-full animate-in slide-in-from-right-full duration-300">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2/30">
          <div>
            <h2 className="text-[16px] font-semibold text-text-primary">
              {itemToEdit ? "Edit Menu Item" : "Add Menu Item"}
            </h2>
            <p className="text-[12px] text-text-secondary mt-0.5">
              {itemToEdit ? "Update existing item details." : "Create a new item in the POS menu."}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-2 text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[13px] font-medium text-text-primary">Item Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. M-105"
                className="w-full h-9 border border-border rounded-md px-3 text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-medium text-text-primary">Price (₹) *</label>
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="w-full h-9 border border-border rounded-md px-3 text-[13px] font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-medium text-text-primary">Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Paneer Tikka"
              className="w-full h-9 border border-border rounded-md px-3 text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-medium text-text-primary">Item Image</label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-surface-2/50 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-surface-2 rounded-full flex items-center justify-center mb-2">
                <ImagePlus className="h-5 w-5 text-text-secondary" />
              </div>
              <p className="text-[13px] font-medium text-text-primary">Click to upload image</p>
              <p className="text-[11px] text-text-secondary mt-1">SVG, PNG, JPG or GIF (max. 2MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[13px] font-medium text-text-primary">Category</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  setFormData({ ...formData, category: newCategory, code: generateCode(newCategory) });
                }}
                className="w-full h-9 border border-border rounded-md px-3 text-[13px] bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option>Main Course</option>
                <option>Starters</option>
                <option>Breakfast</option>
                <option>Beverages</option>
                <option>Desserts</option>
                <option>Special</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-medium text-text-primary">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-9 border border-border rounded-md px-3 text-[13px] bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option>Active</option>
                <option>86'd</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="gstApplies"
              checked={formData.gstApplies !== false} // defaults to true
              onChange={(e) => setFormData({ ...formData, gstApplies: e.target.checked })}
              className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
            />
            <label htmlFor="gstApplies" className="text-[13px] font-medium text-text-primary cursor-pointer">
              GST Applies to this item
            </label>
          </div>

          <div className="pt-4 border-t border-border mt-auto flex justify-end gap-3 pb-6 sm:pb-0">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              {itemToEdit ? "Update Item" : "Save Item"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
