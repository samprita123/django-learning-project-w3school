import { useState } from "react";
import { X, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/Primitives";
import { toast } from "sonner";

export function AddInventoryItemModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Raw Material",
    type: "Dry Goods",
    uom: "kg",
    parLevel: "",
    cost: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.parLevel || !formData.cost) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      toast.success(`Successfully added ${formData.name} to inventory!`);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/30">
          <div className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold text-text-primary">Add Inventory Item</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-[13px]">
          
          <div className="space-y-1.5">
            <label className="font-medium text-text-primary">Item Name <span className="text-error">*</span></label>
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Basmati Rice (25kg)"
              className="w-full p-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-medium text-text-primary">Category <span className="text-error">*</span></label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full p-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option>Raw Material</option>
                <option>Finished Good</option>
                <option>Packaging</option>
                <option>Consumable</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-medium text-text-primary">Sub Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full p-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option>Dry Goods</option>
                <option>Vegetables</option>
                <option>Dairy</option>
                <option>Meat</option>
                <option>Spices</option>
                <option>Beverages</option>
                <option>Bakery</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-medium text-text-primary">Unit of Measure</label>
              <select 
                value={formData.uom}
                onChange={(e) => setFormData({...formData, uom: e.target.value})}
                className="w-full p-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option>kg</option>
                <option>g</option>
                <option>L</option>
                <option>ml</option>
                <option>Bag</option>
                <option>Pcs</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-medium text-text-primary">Par Level <span className="text-error">*</span></label>
              <input 
                type="number"
                min="0"
                value={formData.parLevel}
                onChange={(e) => setFormData({...formData, parLevel: e.target.value})}
                placeholder="e.g. 10"
                className="w-full p-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-medium text-text-primary">Unit Cost (₹) <span className="text-error">*</span></label>
              <input 
                type="number"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
                placeholder="e.g. 120"
                className="w-full p-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-border flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit">Create Item</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
