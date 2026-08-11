import { useState } from "react";
import { Card, CardHeader, Button, StatusBadge } from "@/components/ui/Primitives";
import { Search, Filter, Plus, FileDown, MoreHorizontal, LayoutGrid, List } from "lucide-react";
import { AddInventoryItemModal } from "./AddInventoryItemModal";

// Mock Data
const inventoryItems = [
  { id: "RAW-001", name: "Basmati Rice (25kg)", category: "Dry Goods", type: "Raw Material", uom: "Bag", cost: 3500, stock: 4, par: 6, status: "Low", value: 14000 },
  { id: "RAW-014", name: "Butter (500g)", category: "Dairy", type: "Raw Material", uom: "Pkt", cost: 240, stock: 18, par: 12, status: "OK", value: 4320 },
  { id: "RAW-022", name: "Fresh Cream (1L)", category: "Dairy", type: "Raw Material", uom: "Pkt", cost: 180, stock: 2, par: 8, status: "Critical", value: 360 },
  { id: "RAW-045", name: "Mushrooms", category: "Vegetables", type: "Raw Material", uom: "kg", cost: 120, stock: 1.5, par: 5, status: "Low", value: 180 },
  { id: "RAW-088", name: "Saffron", category: "Spices", type: "Raw Material", uom: "g", cost: 350, stock: 100, par: 50, status: "OK", value: 35000 },
  { id: "RAW-092", name: "Chicken (Whole)", category: "Meat", type: "Raw Material", uom: "kg", cost: 200, stock: 45, par: 30, status: "OK", value: 9000 },
  { id: "PKG-001", name: "Pizza Box (10\")", category: "Packaging", type: "Consumable", uom: "Pcs", cost: 12, stock: 850, par: 1000, status: "Low", value: 10200 },
  { id: "PKG-002", name: "Takeaway Containers", category: "Packaging", type: "Consumable", uom: "Pcs", cost: 5, stock: 150, par: 500, status: "Critical", value: 750 },
  { id: "FIN-001", name: "Chocolate Cake (1kg)", category: "Bakery", type: "Finished Good", uom: "Pcs", cost: 350, stock: 4, par: 5, status: "Low", value: 1400 },
];

export function MasterInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All Items");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredItems = inventoryItems.filter(item => 
    (activeTab === "All Items" || item.type === activeTab || (activeTab === "Critical" && (item.status === "Critical" || item.status === "Low"))) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input 
              type="text"
              placeholder="Search SKU or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-md text-[13px] focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
          <Button variant="outline" size="sm" className="shrink-0 h-[38px]">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="h-[38px] flex-1 sm:flex-none">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" size="sm" className="h-[38px] flex-1 sm:flex-none" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border px-1">
        {["All Items", "Raw Material", "Finished Good", "Packaging", "Critical"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-[13px] font-medium transition-colors border-b-2 ${
              activeTab === tab 
                ? "border-brand text-brand" 
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab}
            {tab === "Critical" && (
              <span className="ml-2 bg-error/10 text-error px-1.5 py-0.5 rounded text-[10px]">3</span>
            )}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface-2/40 text-left">
                <th className="px-4 py-3 font-medium text-text-secondary">SKU</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Item Name</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Category</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Type</th>
                <th className="px-4 py-3 font-medium text-text-secondary text-right">Unit Cost</th>
                <th className="px-4 py-3 font-medium text-text-secondary text-right">In Stock</th>
                <th className="px-4 py-3 font-medium text-text-secondary text-right">Par Level</th>
                <th className="px-4 py-3 font-medium text-text-secondary text-right">Total Value</th>
                <th className="px-4 py-3 font-medium text-text-secondary text-center">Status</th>
                <th className="px-4 py-3 font-medium text-text-secondary text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-border-subtle hover:bg-surface-2/40 group">
                  <td className="px-4 py-3 font-mono text-[12px] text-text-secondary">{item.id}</td>
                  <td className="px-4 py-3 font-medium text-text-primary">{item.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{item.category}</td>
                  <td className="px-4 py-3">
                    <span className="bg-surface-2 text-text-secondary px-2 py-0.5 rounded-full text-[11px] border border-border">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-right">₹{item.cost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono font-bold ${item.status === 'Critical' ? 'text-error' : item.status === 'Low' ? 'text-warning' : ''}`}>
                      {item.stock} {item.uom}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-text-secondary text-right">{item.par} {item.uom}</td>
                  <td className="px-4 py-3 font-mono font-medium text-right">₹{item.value.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge tone={item.status === 'Critical' ? 'error' : item.status === 'Low' ? 'warning' : 'success'}>
                      {item.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-text-secondary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-text-disabled">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 opacity-20" />
                      <p>No inventory items found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="border-t border-border p-4 flex items-center justify-between text-[13px] text-text-secondary bg-surface-2/30">
          <div>Showing {filteredItems.length} of {inventoryItems.length} items</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>1</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">2</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">3</Button>
            <span className="px-2 py-1">...</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">12</Button>
          </div>
        </div>
      </Card>
      
      {isAddModalOpen && <AddInventoryItemModal onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
}
