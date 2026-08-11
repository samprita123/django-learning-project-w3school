import { useState } from "react";
import { X, Search, UserPlus, Phone, Mail, Award } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export function CustomerManagementModal({
  onClose,
  onSelect
}: {
  onClose: () => void;
  onSelect: (customer: { id: string; name: string }) => void;
}) {
  const [search, setSearch] = useState("");
  
  const mockCustomers = [
    { id: "c1", name: "Rahul Sharma", phone: "9876543210", email: "rahul@example.com", points: 150 },
    { id: "c2", name: "Neha Gupta", phone: "9876543211", email: "neha@example.com", points: 420 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border shadow-e2 rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[18px] font-semibold text-text-primary flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Select Customer
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-2 text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled" />
              <input
                type="text"
                placeholder="Search by name or mobile..."
                className="w-full h-10 bg-background border border-border rounded-md pl-9 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="primary">Add New</Button>
          </div>

          <div className="space-y-3">
            <div className="text-[12px] font-medium text-text-secondary mb-2 label-uppercase">Recent Customers</div>
            {mockCustomers.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 border border-border-subtle rounded-lg hover:border-border hover:bg-surface-2/30 transition-colors">
                <div>
                  <div className="font-semibold text-[14px] text-text-primary">{c.name}</div>
                  <div className="flex gap-4 mt-1 text-[12px] text-text-secondary">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3"/> {c.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3"/> {c.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[11px] text-text-secondary">Loyalty Points</div>
                    <div className="text-[13px] font-semibold text-brand flex items-center gap-1 justify-end">
                      <Award className="h-3 w-3" /> {c.points}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onSelect(c)}>Select</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
