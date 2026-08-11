import { useState } from "react";
import { PageHeader } from "@/components/ui/Primitives";
import { LayoutDashboard, Package, ShoppingCart, ChefHat, ArrowLeftRight, FileBarChart2 } from "lucide-react";
import { InventoryDashboard } from "./inventory/InventoryDashboard";
import { MasterInventory } from "./inventory/MasterInventory";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "master", label: "Master Inventory", icon: Package },
  { id: "purchasing", label: "Purchasing & GRN", icon: ShoppingCart },
  { id: "recipes", label: "Recipes & Menus", icon: ChefHat },
  { id: "operations", label: "Stock Operations", icon: ArrowLeftRight },
  { id: "reports", label: "Reports", icon: FileBarChart2 },
];

export function PosInventoryFeature() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <InventoryDashboard />;
      case "master":
        return <MasterInventory />;
      case "purchasing":
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-text-disabled">
            <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
            <h2 className="text-lg font-medium text-text-secondary">Purchasing & GRN</h2>
            <p className="text-sm mt-2">Manage Purchase Orders and verify Goods Receipt Notes.</p>
            <div className="mt-4 bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-semibold">Coming in Phase 2</div>
          </div>
        );
      case "recipes":
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-text-disabled">
            <ChefHat className="h-12 w-12 mb-4 opacity-20" />
            <h2 className="text-lg font-medium text-text-secondary">Recipe Management</h2>
            <p className="text-sm mt-2">Link menu items to ingredients for automatic stock deduction.</p>
            <div className="mt-4 bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-semibold">Coming in Phase 2</div>
          </div>
        );
      case "operations":
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-text-disabled">
            <ArrowLeftRight className="h-12 w-12 mb-4 opacity-20" />
            <h2 className="text-lg font-medium text-text-secondary">Stock Operations</h2>
            <p className="text-sm mt-2">Handle Stock Transfers, Wastage, and Physical Audits.</p>
            <div className="mt-4 bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-semibold">Coming in Phase 3</div>
          </div>
        );
      case "reports":
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-text-disabled">
            <FileBarChart2 className="h-12 w-12 mb-4 opacity-20" />
            <h2 className="text-lg font-medium text-text-secondary">Inventory Reports</h2>
            <p className="text-sm mt-2">Food cost analysis, valuation, and vendor performance.</p>
            <div className="mt-4 bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-semibold">Coming in Phase 3</div>
          </div>
        );
      default:
        return <InventoryDashboard />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-surface-2 overflow-hidden">
      <div className="shrink-0 bg-surface border-b border-border">
        <PageHeader
          eyebrow="Inventory Management"
          title="Stock & ERP"
          description="Enterprise-grade control over purchasing, recipes, stock movements, and wastage."
        />
        
        {/* Horizontal Navigation */}
        <div className="px-6 flex gap-1 overflow-x-auto scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === item.id 
                  ? "border-brand text-brand bg-brand/5" 
                  : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-2/50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="max-w-[1600px] mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
