import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export function ModifierModal({
  productName,
  basePrice,
  onClose,
  onSave
}: {
  productName: string;
  basePrice: number;
  onClose: () => void;
  onSave: (variant: string, modifiersPrice: number) => void;
}) {
  const [size, setSize] = useState("Regular");
  const [addons, setAddons] = useState<string[]>([]);
  
  const sizes = [
    { name: "Regular", price: 0 },
    { name: "Large", price: 50 },
  ];
  
  const availableAddons = [
    { name: "Extra Cheese", price: 30 },
    { name: "Extra Sauce", price: 15 },
    { name: "Jalapenos", price: 25 },
  ];

  const sizePrice = sizes.find(s => s.name === size)?.price || 0;
  const addonsPrice = addons.reduce((sum, addon) => {
    return sum + (availableAddons.find(a => a.name === addon)?.price || 0);
  }, 0);

  const totalPrice = basePrice + sizePrice + addonsPrice;

  const toggleAddon = (name: string) => {
    setAddons(prev => 
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border shadow-e2 rounded-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2/30">
          <div>
            <h2 className="text-[16px] font-semibold text-text-primary">{productName}</h2>
            <p className="text-[12px] text-text-secondary">Customize your item</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-2 text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          {/* Size Selection */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-medium text-text-primary">Size / Variant</h3>
            <div className="grid grid-cols-2 gap-3">
              {sizes.map(s => (
                <button
                  key={s.name}
                  onClick={() => setSize(s.name)}
                  className={`p-3 rounded-lg border text-left flex justify-between items-center transition-colors ${
                    size === s.name
                      ? "border-primary bg-primary-tint ring-1 ring-primary/20 text-primary-pressed"
                      : "border-border bg-surface hover:bg-surface-2"
                  }`}
                >
                  <span className="text-[13px] font-medium">{s.name}</span>
                  <span className="text-[12px] font-mono opacity-80">
                    {s.price > 0 ? `+₹${s.price}` : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons Selection */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-medium text-text-primary">Add-ons</h3>
            <div className="space-y-2">
              {availableAddons.map(a => {
                const isActive = addons.includes(a.name);
                return (
                  <button
                    key={a.name}
                    onClick={() => toggleAddon(a.name)}
                    className={`w-full p-3 rounded-lg border text-left flex justify-between items-center transition-colors ${
                      isActive
                        ? "border-primary bg-primary-tint ring-1 ring-primary/20"
                        : "border-border bg-surface hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isActive ? 'bg-primary border-primary text-primary-foreground' : 'border-border-strong'}`}>
                        {isActive && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <span className={`text-[13px] ${isActive ? 'font-medium text-primary-pressed' : 'text-text-primary'}`}>
                        {a.name}
                      </span>
                    </div>
                    <span className="text-[12px] font-mono text-text-secondary">
                      +₹{a.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-border bg-surface-2/30">
          <Button 
            variant="primary" 
            className="w-full h-12 text-[15px]"
            onClick={() => onSave(
              `${size}${addons.length > 0 ? ` + ${addons.join(', ')}` : ''}`,
              sizePrice + addonsPrice
            )}
          >
            Save to Cart • ₹{totalPrice}
          </Button>
        </div>

      </div>
    </div>
  );
}
