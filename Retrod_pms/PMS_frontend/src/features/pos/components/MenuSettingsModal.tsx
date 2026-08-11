import { useState } from "react";
import { X, CheckCircle2, Calculator, Plus, Clock, Tags } from "lucide-react";
import { Button } from "@/components/ui/Primitives";
import { AddTaxModal, TaxRate } from "./AddTaxModal";
import { AddModifierGroupModal, ModifierGroup } from "./AddModifierGroupModal";

const initialTaxes: TaxRate[] = [
  { id: 1, name: "GST", rate: 5.0, appliesTo: "All Food Items" },
  { id: 2, name: "Liquor Tax", rate: 10.0, appliesTo: "Beverages" },
];

const initialModifiers: ModifierGroup[] = [
  {
    id: 1,
    name: "Spice Level",
    isRequired: true,
    selectionType: "Choose 1",
    options: [{ name: "Mild", price: 0 }, { name: "Medium", price: 0 }, { name: "Hot", price: 0 }]
  },
  {
    id: 2,
    name: "Add-ons",
    isRequired: false,
    selectionType: "Choose Multiple",
    options: [{ name: "Extra Cheese", price: 50 }, { name: "Bacon", price: 80 }]
  }
];

export function MenuSettingsModal({
  onClose
}: {
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState("taxes");
  const [taxes, setTaxes] = useState<TaxRate[]>(initialTaxes);
  const [modifiers, setModifiers] = useState<ModifierGroup[]>(initialModifiers);
  const [isAddTaxModalOpen, setIsAddTaxModalOpen] = useState(false);
  const [isAddModifierModalOpen, setIsAddModifierModalOpen] = useState(false);
  const [isBreakfastActive, setIsBreakfastActive] = useState(true);
  const [isLateNightActive, setIsLateNightActive] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border-l border-border shadow-2xl w-full max-w-2xl flex flex-col h-full animate-in slide-in-from-right-full duration-300">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/30">
          <div>
            <h2 className="text-[18px] font-semibold text-text-primary">Menu Settings</h2>
            <p className="text-[13px] text-text-secondary mt-0.5">Configure global menu behaviors.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-2 text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Settings Sidebar */}
          <div className="w-52 border-r border-border bg-surface/50 p-4 space-y-1">
            <button
              onClick={() => setActiveTab("taxes")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                activeTab === "taxes" ? "bg-primary-tint text-primary-pressed font-medium" : "text-text-primary hover:bg-surface-2"
              }`}
            >
              <Calculator className="h-4 w-4" />
              Taxes & Fees
            </button>
            <button
              onClick={() => setActiveTab("modifiers")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                activeTab === "modifiers" ? "bg-primary-tint text-primary-pressed font-medium" : "text-text-primary hover:bg-surface-2"
              }`}
            >
              <Tags className="h-4 w-4" />
              Global Modifiers
            </button>
            <button
              onClick={() => setActiveTab("timings")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                activeTab === "timings" ? "bg-primary-tint text-primary-pressed font-medium" : "text-text-primary hover:bg-surface-2"
              }`}
            >
              <Clock className="h-4 w-4" />
              Menu Timings
            </button>
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "taxes" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-[14px] font-semibold">Configured Taxes</h3>
                  <Button variant="outline" size="sm" onClick={() => setIsAddTaxModalOpen(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Tax
                  </Button>
                </div>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead className="bg-surface-2/40 border-b border-border text-left">
                      <tr>
                        <th className="px-4 py-2 font-medium text-text-secondary">Name</th>
                        <th className="px-4 py-2 font-medium text-text-secondary">Rate</th>
                        <th className="px-4 py-2 font-medium text-text-secondary">Applies To</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {taxes.map(tax => (
                        <tr key={tax.id}>
                          <td className="px-4 py-3 font-medium">{tax.name}</td>
                          <td className="px-4 py-3 text-text-secondary">{tax.rate.toFixed(2)}%</td>
                          <td className="px-4 py-3 text-text-secondary">{tax.appliesTo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "modifiers" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-[14px] font-semibold">Modifier Groups</h3>
                  <Button variant="outline" size="sm" onClick={() => setIsAddModifierModalOpen(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Create Group
                  </Button>
                </div>
                <div className="space-y-3">
                  {modifiers.map(mod => (
                    <div key={mod.id} className="p-4 border border-border rounded-lg bg-surface">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-[13px] font-medium text-text-primary">{mod.name}</h4>
                          <p className="text-[12px] text-text-secondary">{mod.isRequired ? "Required" : "Optional"}, {mod.selectionType}</p>
                        </div>
                        <span className="text-[11px] font-medium text-text-secondary bg-surface-2 px-2 py-1 rounded">{mod.options.length} Options</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {mod.options.map((opt, i) => (
                          <span key={i} className="text-[12px] text-text-secondary bg-surface-2 px-2 py-1 rounded-md border border-border-subtle">
                            {opt.name} (+₹{opt.price})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "timings" && (
              <div className="space-y-6">
                <h3 className="text-[14px] font-semibold">Daypart Menus</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="text-[13px] font-medium text-text-primary">Breakfast Menu</h4>
                      <p className="text-[12px] text-text-secondary mt-0.5">Active daily from 06:00 AM to 11:00 AM</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsBreakfastActive(!isBreakfastActive)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isBreakfastActive ? 'bg-brand' : 'bg-surface-2 border-border'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isBreakfastActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="text-[13px] font-medium text-text-primary">Late Night Menu</h4>
                      <p className="text-[12px] text-text-secondary mt-0.5">Active Friday & Saturday from 11:00 PM to 02:00 AM</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsLateNightActive(!isLateNightActive)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isLateNightActive ? 'bg-brand' : 'bg-surface-2 border-border'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isLateNightActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 px-6 border-t border-border mt-auto flex justify-end gap-3 pb-6 sm:pb-4 bg-surface-2/30">
          <Button variant="primary" type="button" onClick={onClose}>
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Save Configuration
          </Button>
        </div>

      </div>

      {isAddTaxModalOpen && (
        <AddTaxModal
          onClose={() => setIsAddTaxModalOpen(false)}
          onSave={(newTax) => {
            setTaxes([...taxes, newTax]);
            setIsAddTaxModalOpen(false);
          }}
        />
      )}

      {isAddModifierModalOpen && (
        <AddModifierGroupModal
          onClose={() => setIsAddModifierModalOpen(false)}
          onSave={(newMod) => {
            setModifiers([...modifiers, newMod]);
            setIsAddModifierModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
