import { useState } from "react";
import { Plus, Folder, MoreHorizontal, Settings2, Edit2 } from "lucide-react";
import { PageHeader, Button, Card, CardHeader, StatusBadge } from "@/components/ui/Primitives";
import { AddMenuItemModal, MenuItem } from "./AddMenuItemModal";
import { AddCategoryModal, MenuCategory } from "./AddCategoryModal";
import { MenuSettingsModal } from "./MenuSettingsModal";

const initialMenuItems: MenuItem[] = [
  { code: "M-101", name: "Butter Chicken", category: "Main Course", price: 680, status: "Active" },
  { code: "M-102", name: "Dal Makhani", category: "Main Course", price: 420, status: "Active" },
  {
    code: "M-201",
    name: "Continental Breakfast",
    category: "Breakfast",
    price: 820,
    status: "Active",
  },
  { code: "M-301", name: "Chef's Tasting Menu", category: "Special", price: 3600, status: "86'd" },
];

const mockCategories = [
  { id: 1, name: "Main Course", count: 24, status: "Active" },
  { id: 2, name: "Starters", count: 18, status: "Active" },
  { id: 3, name: "Breakfast", count: 12, status: "Active" },
  { id: 4, name: "Beverages", count: 35, status: "Active" },
  { id: 5, name: "Desserts", count: 8, status: "Active" },
  { id: 6, name: "Special", count: 4, status: "Inactive" },
];

export function PosMenuFeature() {
  const [items, setItems] = useState<MenuItem[]>(initialMenuItems);
  const [categories, setCategories] = useState<MenuCategory[]>(mockCategories);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Main Course");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <PageHeader
        eyebrow="Menu Management"
        title="Menu & Categories"
        description="Manage outlet-specific menus, pricing, and category structures."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsSettingsModalOpen(true)}>
              <Settings2 className="h-3.5 w-3.5 mr-1.5" />
              Settings
            </Button>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Item
            </Button>
          </div>
        }
      />
      
      <div className="p-6 flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Column: Categories */}
        <Card className="w-full lg:w-72 flex-shrink-0 flex flex-col overflow-hidden">
          <CardHeader 
            title="Categories" 
            action={
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setIsAddCategoryModalOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            } 
          />
          <div className="p-3 flex-1 overflow-y-auto space-y-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-[13px] transition-colors ${
                  activeCategory === cat.name 
                    ? "bg-primary-tint text-primary-pressed font-medium" 
                    : "text-text-primary hover:bg-surface-2"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Folder className={`h-4 w-4 ${activeCategory === cat.name ? 'text-primary' : 'text-text-secondary'}`} />
                  {cat.name}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] ${activeCategory === cat.name ? 'text-primary' : 'text-text-secondary'}`}>
                    {cat.count}
                  </span>
                  {cat.status === "Inactive" && <div className="w-1.5 h-1.5 rounded-full bg-error" title="Inactive" />}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Right Column: Menu Items */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader title={`${activeCategory} Items`} hint={`${items.length} total`} />
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left sticky top-0 backdrop-blur z-10">
                  {["Code", "Item", "Category", "Price", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {items.map((item) => (
                  <tr key={item.code} className="hover:bg-surface-2/40 group">
                    <td className="px-4 py-3 font-mono text-[12px]">{item.code}</td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{item.category}</td>
                    <td className="px-4 py-3 font-mono font-medium">₹{item.price}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={item.status === "Active" ? "success" : "warning"}>
                        {item.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        className="p-1.5 rounded hover:bg-surface-2 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setEditingItem(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {isAddModalOpen && (
        <AddMenuItemModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={(newItem) => {
            setItems([newItem, ...items]);
            setIsAddModalOpen(false);
          }}
        />
      )}

      {editingItem && (
        <AddMenuItemModal
          itemToEdit={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(updatedItem) => {
            setItems(items.map(i => i.code === updatedItem.code ? updatedItem : i));
            setEditingItem(null);
          }}
        />
      )}

      {isAddCategoryModalOpen && (
        <AddCategoryModal
          onClose={() => setIsAddCategoryModalOpen(false)}
          onSave={(newCategory) => {
            setCategories([...categories, newCategory]);
            setIsAddCategoryModalOpen(false);
          }}
        />
      )}

      {isSettingsModalOpen && (
        <MenuSettingsModal onClose={() => setIsSettingsModalOpen(false)} />
      )}
    </div>
  );
}
