import { useState } from "react";
import { UtensilsCrossed, ShoppingBag, Truck, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export function OrderTypeSelector({
  currentType,
  onSelect
}: {
  currentType: string;
  onSelect: (type: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const types = [
    { id: "Dine-in", icon: <UtensilsCrossed className="h-4 w-4" /> },
    { id: "Takeaway", icon: <ShoppingBag className="h-4 w-4" /> },
    { id: "Delivery", icon: <Truck className="h-4 w-4" /> },
    { id: "Room Service", icon: <MapPin className="h-4 w-4" /> },
  ];

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="w-full justify-start h-7 text-[12px]">
        {types.find(t => t.id === currentType)?.icon}
        <span className="ml-1.5">{currentType}</span>
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-48 bg-surface border border-border shadow-e2 rounded-lg py-1 z-50">
            {types.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  onSelect(t.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-2 text-left text-[13px] text-text-primary"
              >
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">{t.icon}</span>
                  {t.id}
                </div>
                {currentType === t.id && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
