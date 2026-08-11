import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export type MenuCategory = {
  id: number;
  name: string;
  count: number;
  status: string;
};

export function AddCategoryModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (category: MenuCategory) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    status: "Active",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name) {
      onSave({
        id: Date.now(), // Unique temporary ID
        name: formData.name,
        count: 0, // Fresh categories have 0 items
        status: formData.status,
      });
    } else {
      alert("Please provide a category name.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border shadow-e2 rounded-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2/30">
          <div>
            <h2 className="text-[16px] font-semibold text-text-primary">Add Category</h2>
            <p className="text-[12px] text-text-secondary mt-0.5">Create a new menu category.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-2 text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-[13px] font-medium text-text-primary">Category Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Seafood, Vegan, Signature"
              className="w-full h-9 border border-border rounded-md px-3 text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-medium text-text-primary">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full h-9 border border-border rounded-md px-3 text-[13px] bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <div className="pt-4 border-t border-border mt-6 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Save Category
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
