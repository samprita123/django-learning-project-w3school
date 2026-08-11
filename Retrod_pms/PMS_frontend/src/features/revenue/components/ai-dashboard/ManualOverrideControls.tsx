import { Card, CardHeader } from "@/components/ui/Primitives";
import type { PricingOverrideSettings } from "@/types/pms";

type Props = {
  settings: PricingOverrideSettings;
  onChange: (patch: Partial<PricingOverrideSettings>) => void;
  readOnly?: boolean;
};

export function ManualOverrideControls({ settings, onChange, readOnly = false }: Props) {
  return (
    <Card>
      <CardHeader title="Manual Override Controls" hint="Guardrails" />
      <div className="space-y-4 p-5">
        <label className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-2/40 px-3 py-2">
          <span className="text-[13px] text-text-primary">Auto Pricing</span>
          <button
            type="button"
            onClick={() => onChange({ autoPricing: !settings.autoPricing })}
            disabled={readOnly}
            className={`h-6 w-11 rounded-full transition ${
              settings.autoPricing ? "bg-primary" : "bg-border-strong"
            }`}
            aria-label="Toggle auto pricing"
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition ${
                settings.autoPricing ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>

        <div className="rounded-md border border-border-subtle bg-surface-2/30 px-3 py-2 text-[11px] text-text-secondary">
          Guardrail rule: <span className="font-medium text-text-primary">Min ≤ Max</span> and Surge
          cap between <span className="font-medium text-text-primary">0–100%</span>.
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="text-[11px] text-text-secondary">
            Min Price
            <input
              type="number"
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary"
              value={settings.minPrice}
              disabled={readOnly}
              onChange={(e) => onChange({ minPrice: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="text-[11px] text-text-secondary">
            Max Price
            <input
              type="number"
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary"
              value={settings.maxPrice}
              disabled={readOnly}
              onChange={(e) => onChange({ maxPrice: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="text-[11px] text-text-secondary">
            Surge Cap %
            <input
              type="number"
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary"
              value={settings.surgeCapPct}
              disabled={readOnly}
              onChange={(e) => onChange({ surgeCapPct: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
      </div>
    </Card>
  );
}

export default ManualOverrideControls;
