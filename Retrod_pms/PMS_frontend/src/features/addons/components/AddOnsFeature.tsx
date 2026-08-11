import { Plus } from "lucide-react";
import { PageHeader, KpiCard, Button, Card, CardHeader } from "@/components/ui/Primitives";
import { useAddOnProductsQuery } from "@/services/mock/queries";

export function AddOnsFeature() {
  const { data: addOnProducts = [] } = useAddOnProductsQuery();
  const pricingModes = ["Fixed Amount", "Percentage", "Per Day", "Per Guest"];

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Add-On Services"
        description="Sellable extras posted to guest folios."
        actions={
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Add product
          </Button>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Attach rate" value="26%" accent="brand" />
          <KpiCard label="Revenue · MTD" value="₹8.4L" accent="success" />
          <KpiCard label="Top SKU" value="Breakfast" accent="info" />
          <KpiCard label="Pending fulfillment" value="5" accent="warning" />
        </div>
        <Card>
          <CardHeader title="Product catalog" />
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface-2/40 text-left">
                {["Product", "Category", "Price", "Department", "Attach rate"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {addOnProducts.map((p) => (
                <tr key={p.id} className="border-b border-border-subtle hover:bg-surface-2/50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.category}</td>
                  <td className="px-4 py-3 font-mono">₹{p.price.toLocaleString()}</td>
                  <td className="px-4 py-3">{p.department}</td>
                  <td className="px-4 py-3 font-mono text-[var(--color-success)]">
                    {p.attachRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <CardHeader title="Add-on pricing modes" hint="Reservation level charging strategy" />
          <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
            {pricingModes.map((mode) => (
              <div
                key={mode}
                className="rounded-md border border-border-subtle bg-surface-2/30 px-3 py-2 text-[12px] text-text-primary"
              >
                {mode}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
export default AddOnsFeature;
