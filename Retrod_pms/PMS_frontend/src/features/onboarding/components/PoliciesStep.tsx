import { type OnboardingState } from "@/lib/onboarding-store";

interface PoliciesStepProps {
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

export function PoliciesStep({ state, setState, disabled }: PoliciesStepProps) {
  const setReservationSettings = (patch: Partial<OnboardingState["reservationSettings"]>) =>
    setState((s) => ({
      ...s,
      reservationSettings: { ...s.reservationSettings, ...patch },
    }));
  const setBookingEngine = (patch: Partial<OnboardingState["bookingEngine"]>) =>
    setState((s) => ({ ...s, bookingEngine: { ...s.bookingEngine, ...patch } }));
  const setCRM = (patch: Partial<OnboardingState["crm"]>) =>
    setState((s) => ({ ...s, crm: { ...s.crm, ...patch } }));
  const p = state.reservationSettings;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field label="Standard check-in time">
        <input
          disabled={disabled}
          type="time"
          className={inputCls}
          value={p.checkIn}
          onChange={(e) => setReservationSettings({ checkIn: e.target.value })}
        />
      </Field>
      <Field label="Standard check-out time">
        <input
          disabled={disabled}
          type="time"
          className={inputCls}
          value={p.checkOut}
          onChange={(e) => setReservationSettings({ checkOut: e.target.value })}
        />
      </Field>
      <Field label="Cancellation policy">
        <textarea
          disabled={disabled}
          className={`${inputCls} h-20 py-2`}
          value={p.cancellationPolicy}
          onChange={(e) => setReservationSettings({ cancellationPolicy: e.target.value })}
        />
      </Field>
      <Field label="No-show policy">
        <textarea
          disabled={disabled}
          className={`${inputCls} h-20 py-2`}
          value={p.noShowPolicy}
          onChange={(e) => setReservationSettings({ noShowPolicy: e.target.value })}
        />
      </Field>
      <Field label="Booking engine cancellation rules">
        <textarea
          disabled={disabled}
          className={`${inputCls} h-20 py-2`}
          value={state.bookingEngine.cancellationRules}
          onChange={(e) => setBookingEngine({ cancellationRules: e.target.value })}
        />
      </Field>
      <Field label="Required ID documents (comma-separated)">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.idRequired.join(", ")}
          onChange={(e) =>
            setReservationSettings({
              idRequired: e.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
          placeholder="Passport, Government ID"
        />
      </Field>
      <div className="flex items-end gap-6">
        <label className="flex items-center gap-2 text-[13px] text-text-primary">
          <input
            disabled={disabled}
            type="checkbox"
            checked={state.crm.loyaltyConfigured}
            onChange={(e) => setCRM({ loyaltyConfigured: e.target.checked })}
          />
          Loyalty program configured
        </label>
        <label className="flex items-center gap-2 text-[13px] text-text-primary">
          <input
            disabled={disabled}
            type="checkbox"
            checked={state.crm.smsTemplatesConfigured}
            onChange={(e) => setCRM({ smsTemplatesConfigured: e.target.checked })}
          />
          SMS templates configured
        </label>
      </div>
    </div>
  );
}
export default PoliciesStep;
