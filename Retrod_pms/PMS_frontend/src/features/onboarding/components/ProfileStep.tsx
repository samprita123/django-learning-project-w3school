import { type OnboardingState } from "@/lib/onboarding-store";

interface ProfileStepProps {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  disabled: boolean;
}

const inputCls =
  "h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:opacity-60";
const selectCls = inputCls;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  );
}

export function ProfileStep({ state, setState, disabled }: ProfileStepProps) {
  const p = state.profile;
  const setProfile = (patch: Partial<OnboardingState["profile"]>) =>
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Field label="Property name">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.propertyName}
          onChange={(e) => setProfile({ propertyName: e.target.value })}
          placeholder="The Grand Palace"
        />
      </Field>
      <Field label="Property code">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.propertyCode}
          onChange={(e) => setProfile({ propertyCode: e.target.value.toUpperCase() })}
          placeholder="GP-DEL-001"
        />
      </Field>
      <Field label="Property type">
        <select
          disabled={disabled}
          className={selectCls}
          value={p.propertyType}
          onChange={(e) =>
            setProfile({
              propertyType: e.target.value as OnboardingState["profile"]["propertyType"],
            })
          }
        >
          <option value="hotel">Hotel</option>
          <option value="resort">Resort</option>
          <option value="boutique_hotel">Boutique Hotel</option>
          <option value="hotel_chain">Hotel Chain</option>
          <option value="serviced_apartment">Serviced Apartment</option>
          <option value="villa">Villa</option>
          <option value="homestay">Homestay</option>
        </select>
      </Field>
      <Field label="Property category">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.propertyCategory}
          onChange={(e) => setProfile({ propertyCategory: e.target.value })}
          placeholder="Luxury / Business / Midscale"
        />
      </Field>
      <Field label="Brand name">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.brandName}
          onChange={(e) => setProfile({ brandName: e.target.value })}
          placeholder="Retrod Hotels"
        />
      </Field>
      <Field label="Contact email">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.contactEmail}
          onChange={(e) => setProfile({ contactEmail: e.target.value })}
          placeholder="ops@retrod.com"
        />
      </Field>
      <Field label="Contact phone">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.contactPhone}
          onChange={(e) => setProfile({ contactPhone: e.target.value })}
          placeholder="+91 98xxxxxx20"
        />
      </Field>
      <Field label="Address line 1">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.addressLine1}
          onChange={(e) => setProfile({ addressLine1: e.target.value })}
        />
      </Field>
      <Field label="Address line 2">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.addressLine2}
          onChange={(e) => setProfile({ addressLine2: e.target.value })}
          placeholder="Area / landmark"
        />
      </Field>
      <Field label="City">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.city}
          onChange={(e) => setProfile({ city: e.target.value })}
        />
      </Field>
      <Field label="State">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.state}
          onChange={(e) => setProfile({ state: e.target.value })}
        />
      </Field>
      <Field label="Country">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.country}
          onChange={(e) => setProfile({ country: e.target.value })}
        />
      </Field>
      <Field label="Timezone">
        <select
          disabled={disabled}
          className={selectCls}
          value={p.timezone}
          onChange={(e) => setProfile({ timezone: e.target.value })}
        >
          {[
            "Asia/Kolkata",
            "Asia/Dubai",
            "Asia/Singapore",
            "Europe/London",
            "America/New_York",
          ].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Currency">
        <select
          disabled={disabled}
          className={selectCls}
          value={p.currency}
          onChange={(e) => setProfile({ currency: e.target.value })}
        >
          {["INR", "USD", "EUR", "GBP", "AED"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="GST / VAT number">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.gstVatNumber}
          onChange={(e) => setProfile({ gstVatNumber: e.target.value })}
          placeholder="07AAACR1234A1Z5"
        />
      </Field>
      <Field label="Logo URL">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.logoUrl ?? ""}
          onChange={(e) => setProfile({ logoUrl: e.target.value })}
          placeholder="https://..."
        />
      </Field>
      <Field label="Property image URLs (comma-separated)">
        <input
          disabled={disabled}
          className={inputCls}
          value={p.imageUrls.join(", ")}
          onChange={(e) =>
            setProfile({
              imageUrls: e.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
          placeholder="https://img1.jpg, https://img2.jpg"
        />
      </Field>
    </div>
  );
}
export default ProfileStep;
