import { useState } from "react";
import { X, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export type ModifierOption = {
  name: string;
  price: number;
};

export type ModifierGroup = {
  id: number;
  name: string;
  isRequired: boolean;
  selectionType: "Choose 1" | "Choose Multiple";
  options: ModifierOption[];
};

export function AddModifierGroupModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (group: ModifierGroup) => void;
}) {
  const [name, setName] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [selectionType, setSelectionType] = useState<"Choose 1" | "Choose Multiple">("Choose 1");
  const [options, setOptions] = useState<ModifierOption[]>([{ name: "", price: 0 }]);

  const handleAddOption = () => {
    setOptions([...options, { name: "", price: 0 }]);
  };

  const handleUpdateOption = (index: number, field: keyof ModifierOption, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty options
    const validOptions = options.filter(opt => opt.name.trim() !== "");
    
    if (name.trim() && validOptions.length > 0) {
      onSave({
        id: Date.now(),
        name,
        isRequired,
        selectionType,
        options: validOptions
      });
    } else {
      alert("Please provide a group name and at least one valid option.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border shadow-2xl rounded-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2/30">
          <div>
            <h2 className="text-[16px] font-semibold text-text-primary">Create Modifier Group</h2>
            <p className="text-[12px] text-text-secondary mt-0.5">Define add-ons or choices.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-2 text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form id="modifier-form" onSubmit={handleSubmit} className="p-5 space-y-6">
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[13px] font-medium text-text-primary">Group Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Spice Level, Extra Toppings"
                  className="w-full h-9 border border-border rounded-md px-3 text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-text-primary">Requirement</label>
                  <select
                    value={isRequired ? "Required" : "Optional"}
                    onChange={(e) => setIsRequired(e.target.value === "Required")}
                    className="w-full h-9 border border-border rounded-md px-3 text-[13px] bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option>Required</option>
                    <option>Optional</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-text-primary">Selection</label>
                  <select
                    value={selectionType}
                    onChange={(e) => setSelectionType(e.target.value as any)}
                    className="w-full h-9 border border-border rounded-md px-3 text-[13px] bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option>Choose 1</option>
                    <option>Choose Multiple</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <label className="text-[13px] font-medium text-text-primary">Options</label>
                <Button variant="ghost" size="sm" type="button" onClick={handleAddOption} className="h-7 px-2">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>

              <div className="space-y-2">
                {options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => handleUpdateOption(index, 'name', e.target.value)}
                      placeholder="Option Name"
                      className="flex-1 h-9 border border-border rounded-md px-3 text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                    <div className="relative w-24">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[12px]">₹</span>
                      <input
                        type="number"
                        value={opt.price}
                        onChange={(e) => handleUpdateOption(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full h-9 border border-border rounded-md pl-6 pr-2 text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveOption(index)}
                      className="p-1.5 text-text-secondary hover:text-error hover:bg-error-tint rounded transition-colors"
                      disabled={options.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        <div className="pt-4 px-5 border-t border-border flex justify-end gap-3 pb-5 bg-surface-2/30">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="modifier-form">
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Save Group
          </Button>
        </div>

      </div>
    </div>
  );
}
