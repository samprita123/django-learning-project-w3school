import { useState, useEffect } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import {
  PageHeader,
  KpiCard,
  Button,
  Card,
  CardHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import { fetchApi } from "@/services/api/core";
import { CorporateDetail } from "./CorporateDetail";

export function CorporateFeature() {
  const [corporateAccounts, setCorporateAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form fields
  const [companyName, setCompanyName] = useState("");
  const [rateCode, setRateCode] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchAccounts = () => {
    setLoading(true);
    fetchApi<any>("/api/reservations/corporate-accounts/")
      .then((res) => {
        const results = res.results || res || [];
        setCorporateAccounts(results);
      })
      .catch((err) => console.error("Failed to load corporate accounts", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAccounts();

    // Check if redirect query parameter demands opening the drawer
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "new") {
      setIsDrawerOpen(true);
    }
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !rateCode.trim()) {
      setFormError("Company name and rate code are required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await fetchApi("/api/reservations/corporate-accounts/", {
        method: "POST",
        body: JSON.stringify({
          company_name: companyName,
          negotiated_rate_code: rateCode,
          credit_limit: parseFloat(creditLimit) || 0,
          contact_person: contactPerson,
          is_active: true,
        }),
      });

      // Reset form
      setCompanyName("");
      setRateCode("");
      setCreditLimit("");
      setContactPerson("");
      setIsDrawerOpen(false);
      
      // Reload list
      fetchAccounts();
    } catch (err: any) {
      setFormError(err.message || "Failed to create corporate account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map to the shape expected by CorporateDetail and UI components
  const mappedAccounts = corporateAccounts.map((a: any) => ({
    id: a.id,
    company: a.company_name,
    rateCode: a.negotiated_rate_code,
    creditLimit: Number(a.credit_limit),
    contact: a.contact_person,
    is_active: a.is_active,
    roomNightsMtd: a.room_nights_mtd || 0,
    revenueMtd: Number(a.revenue_mtd || 0),
    openInvoices: a.open_invoices_count || 0,
    currentBalance: Number(a.credit_limit) - Number(a.available_credit || 0),
    taxId: a.tax_id || "",
    address: a.address || "",
    phone: a.phone || "",
    email: a.email || "",
    annualRoomNightTarget: 100,
    ytdRoomNights: 48,
  }));

  if (selectedId) {
    const selected = mappedAccounts.find((a) => a.id === selectedId);
    if (selected) {
      return <CorporateDetail account={selected as any} onBack={() => setSelectedId(null)} />;
    }
  }

  const revenueMtd = mappedAccounts.reduce((a, c) => a + c.revenueMtd, 0);
  const nightsMtd = mappedAccounts.reduce((a, c) => a + c.roomNightsMtd, 0);

  return (
    <div className="relative min-h-screen">
      <PageHeader
        eyebrow="Commercial"
        title="Corporate Accounts"
        description="Negotiated rates, direct billing, and B2B reservation management."
        actions={
          <Button size="sm" onClick={() => setIsDrawerOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            New account
          </Button>
        }
      />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard
            label="Active accounts"
            value={String(mappedAccounts.length)}
            accent="brand"
          />
          <KpiCard label="Room nights · MTD" value={String(nightsMtd)} accent="info" />
          <KpiCard
            label="Revenue · MTD"
            value={`₹${(revenueMtd / 100000).toFixed(1)}L`}
            accent="success"
          />
          <KpiCard label="Open invoices" value="3" accent="warning" />
        </div>

        <Card>
          <CardHeader title="Corporate accounts directory" hint={`${mappedAccounts.length} accounts`} />
          {loading ? (
            <div className="p-10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    {["Company", "Rate code", "Nights (MTD)", "Revenue (MTD)", "Invoices", "Balance"].map((h) => (
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
                  {mappedAccounts.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedId(a.id)}
                      className="cursor-pointer border-b border-border-subtle hover:bg-surface-2/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">{a.company}</td>
                      <td className="px-4 py-3 font-mono text-text-secondary">{a.rateCode}</td>
                      <td className="px-4 py-3 font-mono">{a.roomNightsMtd}</td>
                      <td className="px-4 py-3 font-mono">₹{(a.revenueMtd / 1000).toFixed(0)}k</td>
                      <td className="px-4 py-3">
                        {a.openInvoices > 0 ? (
                          <StatusBadge tone="warning">{a.openInvoices} open</StatusBadge>
                        ) : (
                          <StatusBadge tone="success">Clear</StatusBadge>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {a.creditLimit > 0 ? (
                          <span className="font-medium text-text-primary">₹{a.creditLimit.toLocaleString()}</span>
                        ) : (
                          <span className="text-text-disabled">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Slide-over Drawer Modal from right */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end">
          <div className="w-full max-w-md bg-surface h-full shadow-xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-text-primary">Create Corporate Account</h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-error-subtle text-error text-[13px] rounded-md font-medium">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-text-secondary">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infosys Ltd."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-text-secondary">Negotiated Rate Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INF-CORP-24"
                  value={rateCode}
                  onChange={(e) => setRateCode(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-text-secondary">Credit Limit (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 500000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-text-secondary">Primary Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Save Account"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CorporateFeature;
