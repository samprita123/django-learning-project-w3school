import { StatusBadge } from "@/components/ui/Primitives";
import { type OnboardingState } from "@/lib/onboarding-store";

interface RatesStepProps {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  disabled: boolean;
}

const inputCls =
  "h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:opacity-60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  );
}

export function RatesStep({ state, setState, disabled }: RatesStepProps) {
  const setTax = (patch: Partial<OnboardingState["tax"]>) =>
    setState((s) => ({ ...s, tax: { ...s.tax, ...patch } }));
  const setRatePlans = (
    updater: (prev: OnboardingState["ratePlans"]) => OnboardingState["ratePlans"],
  ) => setState((s) => ({ ...s, ratePlans: updater(s.ratePlans) }));
  const setMealPlans = (
    updater: (prev: OnboardingState["mealPlans"]) => OnboardingState["mealPlans"],
  ) => setState((s) => ({ ...s, mealPlans: updater(s.mealPlans) }));

  return (
    <div className="space-y-6">
      <div>
        <div className="label-uppercase mb-2">Meal plans</div>
        <div className="space-y-2">
          {state.mealPlans.map((meal) => (
            <div
              key={meal.id}
              className="grid grid-cols-1 gap-2 rounded-md border border-border bg-surface-2/30 px-3 py-2 md:grid-cols-[90px_1fr_140px_140px_auto]"
            >
              <input
                disabled={disabled}
                className={inputCls}
                value={meal.code}
                onChange={(e) =>
                  setMealPlans((prev) =>
                    prev.map((item) =>
                      item.id === meal.id
                        ? {
                            ...item,
                            code: e.target.value as OnboardingState["mealPlans"][number]["code"],
                          }
                        : item,
                    ),
                  )
                }
              />
              <input
                disabled={disabled}
                className={inputCls}
                value={meal.name}
                onChange={(e) =>
                  setMealPlans((prev) =>
                    prev.map((item) =>
                      item.id === meal.id ? { ...item, name: e.target.value } : item,
                    ),
                  )
                }
              />
              <input
                disabled={disabled}
                className={inputCls}
                value={meal.includedMeals}
                onChange={(e) =>
                  setMealPlans((prev) =>
                    prev.map((item) =>
                      item.id === meal.id ? { ...item, includedMeals: e.target.value } : item,
                    ),
                  )
                }
              />
              <input
                disabled={disabled}
                type="number"
                className={inputCls}
                value={meal.priceAdjustment}
                onChange={(e) =>
                  setMealPlans((prev) =>
                    prev.map((item) =>
                      item.id === meal.id
                        ? { ...item, priceAdjustment: Number(e.target.value) }
                        : item,
                    ),
                  )
                }
              />
              <label className="flex items-center gap-2 text-[12px] text-text-primary">
                <input
                  disabled={disabled}
                  type="checkbox"
                  checked={meal.active}
                  onChange={(e) =>
                    setMealPlans((prev) =>
                      prev.map((item) =>
                        item.id === meal.id ? { ...item, active: e.target.checked } : item,
                      ),
                    )
                  }
                />
                Active
              </label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="label-uppercase mb-2">Rate plans</div>
        <div className="space-y-2">
          {state.ratePlans.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-md border border-border bg-surface-2/30 px-3 py-2"
            >
              <div>
                <div className="text-[13px] font-medium text-text-primary">{p.name}</div>
                <div className="text-[11px] text-text-secondary">
                  {p.category.replace(/_/g, " ")} · Discount {p.discountPercent}%
                </div>
              </div>
              <label className="flex items-center gap-2 text-[12px] text-text-primary">
                <input
                  disabled={disabled}
                  type="checkbox"
                  checked={p.active}
                  onChange={(e) =>
                    setRatePlans((prev) =>
                      prev.map((item) =>
                        item.id === p.id ? { ...item, active: e.target.checked } : item,
                      ),
                    )
                  }
                />
                Active
              </label>
              <StatusBadge tone={p.active ? "success" : "neutral"}>
                {p.active ? "Active" : "Inactive"}
              </StatusBadge>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="label-uppercase mb-2">GST tax structure (India)</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="CGST %">
            <input
              disabled={disabled}
              type="number"
              className={inputCls}
              value={state.tax.gst}
              onChange={(e) => setTax({ gst: Number(e.target.value) })}
            />
          </Field>
          <Field label="VAT %">
            <input
              disabled={disabled}
              type="number"
              className={inputCls}
              value={state.tax.vat}
              onChange={(e) => setTax({ vat: Number(e.target.value) })}
            />
          </Field>
          <Field label="City tax %">
            <input
              disabled={disabled}
              type="number"
              className={inputCls}
              value={state.tax.cityTax}
              onChange={(e) => setTax({ cityTax: Number(e.target.value) })}
            />
          </Field>
          <Field label="Service charge %">
            <input
              disabled={disabled}
              type="number"
              className={inputCls}
              value={state.tax.serviceCharge}
              onChange={(e) => setTax({ serviceCharge: Number(e.target.value) })}
            />
          </Field>
          <Field label="Luxury tax %">
            <input
              disabled={disabled}
              type="number"
              className={inputCls}
              value={state.tax.luxuryTax}
              onChange={(e) => setTax({ luxuryTax: Number(e.target.value) })}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
export default RatesStep;
