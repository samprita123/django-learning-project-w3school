import { PageHeader, Card, CardHeader, Button } from "@/components/ui/Primitives";

export function PropertyFeature() {
  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Property Configuration"
        description="Brand identity, taxes, policies, and operational hours."
      />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Property identity" />
          <div className="space-y-4 p-5">
            <Field label="Property name" value="The Grand Palace" />
            <Field label="Brand group" value="Retrod Hospitality Collection" />
            <Field label="Star rating" value="5-star · Luxury" />
            <Field label="Address" value="Connaught Place, New Delhi 110001, India" />
            <Field label="Currency" value="INR · ₹" />
            <Field label="Time zone" value="Asia/Kolkata · GMT+5:30" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Tax configuration · India" />
          <div className="space-y-4 p-5">
            <Field label="GSTIN" value="07AABCT1234M1Z5" mono />
            <Field label="CGST" value="9%" />
            <Field label="SGST" value="9%" />
            <Field label="IGST (interstate)" value="18%" />
            <Field label="Service charge" value="None" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Operational hours" />
          <div className="space-y-3 p-5 text-[13px]">
            <Row label="Check-in" value="From 14:00" />
            <Row label="Check-out" value="By 11:00" />
            <Row label="Front desk" value="24 / 7" />
            <Row label="Restaurant" value="07:00 → 23:00" />
            <Row label="Spa" value="09:00 → 21:00" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Policies" />
          <div className="space-y-3 p-5 text-[13px] text-text-secondary leading-relaxed">
            <p>
              Cancellation up to 48 hours before arrival is complimentary. Within 48 hours, one
              night is charged.
            </p>
            <p>
              Children under 12 stay free with existing bedding. Extra bed available at ₹2,500 /
              night.
            </p>
            <p>Pet-friendly suites available with a non-refundable cleaning fee of ₹3,000.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="label-uppercase text-[10px]">{label}</div>
      <div className={`mt-1 text-[13px] text-text-primary ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border-subtle pb-2 last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary">{value}</span>
    </div>
  );
}
export default PropertyFeature;
