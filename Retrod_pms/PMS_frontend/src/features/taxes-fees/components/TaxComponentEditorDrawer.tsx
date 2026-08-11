import { useEffect, useState } from "react";
import { PageHeader, Button, Card, CardHeader, StatusBadge } from "@/components/ui/Primitives";
import type { TaxCalculationBase, TaxComponent, TaxComponentType } from "@/types/pms";
import {
  CALCULATION_BASE_LABEL,
  TAX_COMPONENT_TYPE_LABEL,
  TAX_COMPONENT_TYPES,
} from "@/features/taxes-fees/lib/constants";

interface TaxComponentEditorDrawerProps {
  open: boolean;
  component: TaxComponent | null;
  onClose: () => void;
  onSave: (component: TaxComponent) => void;
  readOnly?: boolean;
}

const emptyComponent = (): TaxComponent => ({
  id: `tax-${Date.now()}`,
  code: "",
  name: "",
  type: "gst",
  ratePercent: 0,
  calculationBase: "folio_subtotal",
  inclusive: false,
  status: "Active",
});

export function TaxComponentEditorDrawer({
  open,
  component,
  onClose,
  onSave,
  readOnly,
}: TaxComponentEditorDrawerProps) {
  const [draft, setDraft] = useState<TaxComponent>(() => emptyComponent());

  useEffect(() => {
    if (component) setDraft(component);
    else if (open) setDraft(emptyComponent());
  }, [component, open]);

  if (!open) return null;

  const inputCls =
    "h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-e3">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="label-uppercase text-text-secondary">Tax component</div>
            <div className="font-display text-lg font-semibold text-text-primary">
              {component ? "Edit component" : "New component"}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-text-secondary">Code</span>
            <input
              disabled={readOnly}
              className={inputCls}
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-text-secondary">Name</span>
            <input
              disabled={readOnly}
              className={inputCls}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-text-secondary">Type</span>
            <select
              disabled={readOnly}
              className={inputCls}
              value={draft.type}
              onChange={(e) => setDraft({ ...draft, type: e.target.value as TaxComponentType })}
            >
              {TAX_COMPONENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TAX_COMPONENT_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-text-secondary">Rate %</span>
            <input
              disabled={readOnly}
              type="number"
              step="0.1"
              className={inputCls}
              value={draft.ratePercent}
              onChange={(e) => setDraft({ ...draft, ratePercent: Number(e.target.value) })}
            />
          </label>

          {/* Tariff Range / GST Slab Inputs */}
          <div className="rounded-md border border-primary/20 bg-primary-tint/10 p-3 space-y-3">
            <div className="text-[11px] font-bold uppercase text-primary tracking-wider">
              Tariff Range / Slab (Optional)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-text-secondary">Min Tariff (₹)</span>
                <input
                  disabled={readOnly}
                  type="number"
                  placeholder="0"
                  className={inputCls}
                  value={draft.gstSlabMin ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      gstSlabMin: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-text-secondary">Max Tariff (₹)</span>
                <input
                  disabled={readOnly}
                  type="number"
                  placeholder="7500 (blank = unlimited)"
                  className={inputCls}
                  value={draft.gstSlabMax ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      gstSlabMax: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </label>
            </div>
            <div className="text-[10px] text-text-secondary">
              Example: ₹0 to ₹7,500 ➔ 2.5% CGST/SGST | ₹7,500 to Above ➔ 9.0% CGST/SGST.
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-text-secondary">
              Flat amount (optional)
            </span>
            <input
              disabled={readOnly}
              type="number"
              className={inputCls}
              value={draft.flatAmount ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  flatAmount: e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-text-secondary">Calculation base</span>
            <select
              disabled={readOnly}
              className={inputCls}
              value={draft.calculationBase}
              onChange={(e) =>
                setDraft({ ...draft, calculationBase: e.target.value as TaxCalculationBase })
              }
            >
              {Object.entries(CALCULATION_BASE_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-[13px]">
            <input
              disabled={readOnly}
              type="checkbox"
              checked={draft.inclusive}
              onChange={(e) => setDraft({ ...draft, inclusive: e.target.checked })}
            />
            Tax inclusive pricing
          </label>
          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-text-secondary">Status</span>
            <select
              disabled={readOnly}
              className={inputCls}
              value={draft.status}
              onChange={(e) =>
                setDraft({ ...draft, status: e.target.value as TaxComponent["status"] })
              }
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          {!readOnly && (
            <Button
              size="sm"
              onClick={() => {
                if (!draft.code.trim() || !draft.name.trim()) return;
                onSave({ ...draft, code: draft.code.trim(), name: draft.name.trim() });
                onClose();
              }}
            >
              Save component
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
