import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Search, MoreVertical, Building2, Globe, ShieldAlert, CreditCard, Sparkles, Puzzle } from "lucide-react";
import { Button, Card } from "@/components/ui/Primitives";
import { tenantApi, type Tenant, type TenantSubscription } from "@/services/api/tenant";
import { subscriptionApi, type SubscriptionPlan, type Product, type ProductFeature } from "@/services/api/subscription";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function TenantListFeature() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dropdown & Action states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Edit Tenant state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Tenant | null>(null);
  const [editFields, setEditFields] = useState<Partial<Tenant>>({});
  
  // Subscription management state inside edit modal
  const [tenantSubscriptions, setTenantSubscriptions] = useState<TenantSubscription[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [subLoading, setSubLoading] = useState(false);

  // Custom Subscription Mode state inside edit modal
  const [products, setProducts] = useState<Product[]>([]);
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [customSubName, setCustomSubName] = useState("");
  const [customBillingCycle, setCustomBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [customCurrency, setCustomCurrency] = useState("USD");
  const [selectedCustomFeatures, setSelectedCustomFeatures] = useState<Record<string, number>>({});

  const fetchInitialData = async () => {
    try {
      const [tenantData, planData, prodData, featData] = await Promise.all([
        tenantApi.getTenants(),
        subscriptionApi.getPlans(),
        subscriptionApi.getProducts().catch(() => []),
        subscriptionApi.getFeatures().catch(() => []),
      ]);
      setTenants(tenantData);
      setPlans(planData);
      setProducts(prodData);
      setFeatures(featData);
    } catch (error: any) {
      toast.error("Failed to load platform data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleStartEdit = async (tenant: Tenant) => {
    setEditTarget(tenant);
    setEditFields({
      name: tenant.name,
      schema_name: tenant.schema_name,
      domain_url: tenant.domain_url,
      status: tenant.status,
      // Default to empty strings if the backend fields are not mapped yet to avoid uncontrolled inputs
      country: (tenant as any).country || "",
      currency: (tenant as any).currency || "",
      timezone: (tenant as any).timezone || "",
    });
    
    // Load subscription info
    setSubLoading(true);
    setSelectedPlanId("");
    setTenantSubscriptions([]);
    setEditModalOpen(true);
    setActiveDropdown(null);

    try {
      const subs = await tenantApi.getTenantSubscriptions(tenant.id);
      setTenantSubscriptions(subs);
      const activeSub = subs.find((s: any) => s.status === "ACTIVE");
      if (activeSub) {
        if (activeSub.is_custom) {
          setSelectedPlanId("CUSTOM");
          setIsCustomSelected(true);
          setCustomSubName(activeSub.custom_name || `Custom Tier - ${tenant.name}`);
          setCustomBillingCycle((activeSub.billing_cycle as any) || "MONTHLY");
          setCustomCurrency(activeSub.currency || "USD");
          const featMap: Record<string, number> = {};
          if (activeSub.features) {
            activeSub.features.forEach((f: any) => {
              featMap[f.product_feature] = Number(f.price || 0);
            });
          }
          setSelectedCustomFeatures(featMap);
        } else {
          setSelectedPlanId(activeSub.plan);
          setIsCustomSelected(false);
        }
      } else {
        setSelectedPlanId("");
        setIsCustomSelected(false);
        setSelectedCustomFeatures({});
      }
    } catch (err: any) {
      console.error("Failed to fetch subscriptions:", err);
    } finally {
      setSubLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    try {
      // 1. Update Tenant Info
      await tenantApi.updateTenant(editTarget.id, editFields);

      // 2. Update Subscription Plan if changed
      const activeSub = tenantSubscriptions.find(s => s.status === "ACTIVE");
      if (selectedPlanId === "CUSTOM") {
        const featureIds = Object.keys(selectedCustomFeatures);
        if (featureIds.length === 0) {
          toast.error("Please select at least one feature for the custom subscription.");
          return;
        }

        const payloadFeatures = featureIds.map((id) => ({
          feature_id: id,
          price: Number(selectedCustomFeatures[id] || 0),
        }));

        const calculatedTotal = Object.values(selectedCustomFeatures).reduce(
          (sum, val) => sum + Number(val || 0),
          0
        );

        await subscriptionApi.assignCustomSubscription({
          tenant_id: editTarget.id,
          custom_name: customSubName || `Custom Tier - ${editTarget.name}`,
          billing_cycle: customBillingCycle,
          price: calculatedTotal,
          currency: customCurrency || "USD",
          features: payloadFeatures,
        });
      } else if (selectedPlanId && (!activeSub || activeSub.plan !== selectedPlanId)) {
        await tenantApi.createTenantSubscription({
          tenant: editTarget.id,
          plan: selectedPlanId,
          status: "ACTIVE"
        });
      }

      toast.success("Tenant and subscription updated successfully.");
      setEditModalOpen(false);
      setEditTarget(null);
      fetchInitialData();
    } catch (error: any) {
      toast.error("Failed to save changes: " + error.message);
    }
  };

  const handleUpdateStatus = async (id: string, status: "active" | "suspended" | "terminated") => {
    try {
      await tenantApi.updateTenant(id, { status });
      toast.success(`Tenant status updated to ${status}.`);
      setActiveDropdown(null);
      fetchInitialData();
    } catch (error: any) {
      toast.error("Failed to update status: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await tenantApi.deleteTenant(deleteTarget);
      toast.success("Tenant deleted successfully.");
      setDeleteTarget(null);
      fetchInitialData();
    } catch (error: any) {
      toast.error("Failed to delete tenant: " + error.message);
    }
  };

  const filteredTenants = tenants
    .filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      (t.created_by_name || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success";
      case "suspended":
        return "bg-warning/10 text-warning";
      case "terminated":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const activeSubForTenant = tenantSubscriptions.find(s => s.status === "ACTIVE");

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hospitality Partners</h1>
          <p className="text-sm text-muted-foreground">Manage platform hospitality partners and their subscriptions</p>
        </div>
        <Link to="/superadmin/tenants/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Partner
          </Button>
        </Link>
      </div>

      <Card className="p-4 overflow-visible">
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search tenants..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-surface px-3 pl-9 text-[13px] text-text-primary placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[340px] pb-32">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 font-medium text-muted-foreground">Partner Name</th>
                <th className="p-3 font-medium text-muted-foreground">Domain</th>
                <th className="p-3 font-medium text-muted-foreground">Status</th>
                <th className="p-3 font-medium text-muted-foreground">Created At</th>
                <th className="p-3 font-medium text-muted-foreground">Created By</th>
                <th className="w-10 p-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Loading partners...
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No partners found.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant, idx) => {
                  const openUpward = filteredTenants.length > 2 && idx >= filteredTenants.length - 2 && idx >= 2;
                  return (
                    <tr key={tenant.id} className={`border-b transition-colors hover:bg-muted/50 relative ${activeDropdown === tenant.id ? "z-30" : "z-0"}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-foreground">{tenant.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{tenant.domain_url || "N/A"}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(
                            tenant.status
                          )}`}
                        >
                          {getStatusLabel(tenant.status)}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-muted-foreground">{tenant.created_by_name || "System Admin"}</td>
                      <td className="p-3">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === tenant.id ? null : tenant.id);
                            }}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          {activeDropdown === tenant.id && (
                            <>
                              {/* Backdrop zone */}
                              <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdown(null);
                                }}
                              />
                              {/* Floating Actions Panel */}
                              <div className={`absolute right-0 ${openUpward ? "bottom-full mb-1" : "top-full mt-1"} w-44 rounded-md border border-border bg-surface py-1 shadow-2xl z-50 text-[13px] flex flex-col align-start`}>
                                <button
                                  onClick={() => handleStartEdit(tenant)}
                                  className="w-full text-left px-3 py-2 text-text-primary hover:bg-surface-2 transition"
                                >
                                  Edit Details & Plan
                                </button>
                                <div className="border-t border-border-subtle my-1" />
                                <button
                                  onClick={() => handleUpdateStatus(tenant.id, "active")}
                                  className="w-full text-left px-3 py-2 text-text-primary hover:bg-surface-2 transition disabled:opacity-50"
                                  disabled={tenant.status === "active"}
                                >
                                  Activate Status
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(tenant.id, "suspended")}
                                  className="w-full text-left px-3 py-2 text-text-primary hover:bg-surface-2 transition disabled:opacity-50"
                                  disabled={tenant.status === "suspended"}
                                >
                                  Suspend Tenant
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(tenant.id, "terminated")}
                                  className="w-full text-left px-3 py-2 text-text-primary hover:bg-surface-2 transition disabled:opacity-50"
                                  disabled={tenant.status === "terminated"}
                                >
                                  Terminate Tenant
                                </button>
                                <div className="border-t border-border-subtle my-1" />
                                <button
                                  onClick={() => {
                                    setDeleteTarget(tenant.id);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-error hover:bg-error-tint transition font-medium"
                                >
                                  Delete Tenant
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Comprehensive Edit Dialog */}
      <AlertDialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Edit Tenant Configuration
            </AlertDialogTitle>
            <AlertDialogDescription>
              Configure organizational metadata, localization properties, and active subscriptions.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-6 py-4">
            {/* Section 1: Basic Profiles */}
            <div className="space-y-3">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary border-b border-border pb-1">
                Profile details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-text-secondary">Company Name</label>
                  <input
                    className="h-9 rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                    value={editFields.name || ""}
                    onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-text-secondary">Subdomain</label>
                  <input
                    className="h-9 rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                    value={editFields.domain_url || ""}
                    onChange={(e) => setEditFields({ ...editFields, domain_url: e.target.value })}
                    placeholder="e.g. hotelname"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-text-secondary">Tenant Status</label>
                  <select
                    className="h-9 rounded-md border border-border bg-surface px-2.5 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                    value={editFields.status || "active"}
                    onChange={(e) => setEditFields({ ...editFields, status: e.target.value as any })}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Localization */}
            <div className="space-y-3">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary border-b border-border pb-1">
                Localization & Standards
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-text-secondary">Country</label>
                  <input
                    className="h-9 rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                    value={(editFields as any).country || ""}
                    onChange={(e) => setEditFields({ ...editFields, country: e.target.value } as any)}
                    placeholder="e.g. India"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-text-secondary">Currency</label>
                  <input
                    className="h-9 rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                    value={(editFields as any).currency || ""}
                    onChange={(e) => setEditFields({ ...editFields, currency: e.target.value } as any)}
                    placeholder="e.g. INR"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-text-secondary">Timezone</label>
                  <input
                    className="h-9 rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                    value={(editFields as any).timezone || ""}
                    onChange={(e) => setEditFields({ ...editFields, timezone: e.target.value } as any)}
                    placeholder="e.g. Asia/Kolkata"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Subscriptions */}
            <div className="space-y-3">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary border-b border-border pb-1 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" />
                Active Subscription Plan
              </h4>

              {subLoading ? (
                <div className="text-[12.5px] text-text-secondary">Loading subscriptions...</div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg border border-border bg-surface-2/40 flex items-center justify-between text-[13px]">
                    <div>
                      <div className="font-semibold text-text-primary">
                        {activeSubForTenant ? `Plan: ${activeSubForTenant.plan_name}` : "No Active Subscription"}
                      </div>
                      {activeSubForTenant && (
                        <div className="text-[11px] text-text-secondary mt-1">
                          Billing cycle runs from <span className="font-semibold font-mono">{activeSubForTenant.start_date}</span> to <span className="font-semibold font-mono">{activeSubForTenant.end_date}</span>
                        </div>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold uppercase ${
                        activeSubForTenant ? "bg-success-tint text-primary-pressed" : "bg-warning-tint text-warning"
                      }`}
                    >
                      {activeSubForTenant ? "Active" : "Trial/Unsubscribed"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-text-secondary">Change Subscription Plan</label>
                    <select
                      className="h-9 rounded-md border border-border bg-surface px-2.5 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                      value={selectedPlanId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedPlanId(val);
                        setIsCustomSelected(val === "CUSTOM");
                      }}
                    >
                      <option value="">— Unassign Plan / None —</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.currency} {Number(p.price).toFixed(2)} / {p.billing_cycle.toLowerCase()})
                        </option>
                      ))}
                      <option value="CUSTOM">★ Custom Feature-Wise Subscription ★</option>
                    </select>
                  </div>

                  {isCustomSelected && (
                    <div className="mt-3 p-3.5 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-primary/20">
                        <span className="text-[12px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" /> Custom Feature-Wise Subscription Builder
                        </span>
                        <span className="text-[12px] font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                          Total: {customCurrency === "INR" ? "₹" : "$"}
                          {Object.values(selectedCustomFeatures).reduce((sum, v) => sum + Number(v || 0), 0).toFixed(2)}
                          /{customBillingCycle.toLowerCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-text-secondary mb-1 block">Custom Tier Name</label>
                          <input
                            className="h-8 w-full rounded border border-border bg-surface px-2 text-[12px] text-text-primary focus:border-primary focus:outline-none"
                            placeholder="e.g. Special Corporate Tier"
                            value={customSubName}
                            onChange={(e) => setCustomSubName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-text-secondary mb-1 block">Billing Cycle</label>
                          <select
                            className="h-8 w-full rounded border border-border bg-surface px-2 text-[12px] text-text-primary focus:border-primary focus:outline-none"
                            value={customBillingCycle}
                            onChange={(e) => setCustomBillingCycle(e.target.value as any)}
                          >
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-text-secondary mb-1 block">Currency</label>
                          <select
                            className="h-8 w-full rounded border border-border bg-surface px-2 text-[12px] text-text-primary focus:border-primary focus:outline-none"
                            value={customCurrency}
                            onChange={(e) => setCustomCurrency(e.target.value)}
                          >
                            <option value="USD">USD ($)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">
                          Select Features & Custom Pricing:
                        </span>
                        {products.map((prod) => {
                          const prodFeats = features.filter((f) => f.product === prod.id);
                          if (prodFeats.length === 0) return null;
                          return (
                            <div key={prod.id} className="rounded-md border border-border bg-surface p-2.5 space-y-1.5">
                              <div className="text-[11px] font-bold text-text-secondary flex items-center gap-1">
                                <Puzzle className="h-3 w-3 text-primary" /> {prod.name}
                              </div>
                              <div className="grid grid-cols-1 gap-1.5">
                                {prodFeats.map((feat) => {
                                  const isSelected = selectedCustomFeatures[feat.id] !== undefined;
                                  const currentPrice = selectedCustomFeatures[feat.id] ?? Number(feat.price || 0);

                                  return (
                                    <div
                                      key={feat.id}
                                      className={`flex items-center justify-between gap-2 p-1.5 rounded border text-[11.5px] transition ${
                                        isSelected ? "border-primary/40 bg-primary/5" : "border-border/60 bg-surface"
                                      }`}
                                    >
                                      <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 select-none">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => {
                                            setSelectedCustomFeatures((prev) => {
                                              const next = { ...prev };
                                              if (next[feat.id] !== undefined) {
                                                delete next[feat.id];
                                              } else {
                                                next[feat.id] = Number(feat.price || 0);
                                              }
                                              return next;
                                            });
                                          }}
                                        />
                                        <span className="font-medium text-text-primary truncate">{feat.name}</span>
                                        <span className="font-mono text-[9px] text-text-secondary px-1 py-0.5 rounded bg-surface border border-border shrink-0">
                                          {feat.code}
                                        </span>
                                      </label>
                                      {isSelected ? (
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className="text-[10px] text-text-secondary">Price:</span>
                                          <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="h-6 w-20 rounded border border-border bg-surface px-1.5 font-mono text-[11px] text-text-primary focus:border-primary focus:outline-none"
                                            value={currentPrice}
                                            onChange={(e) => {
                                              const val = parseFloat(e.target.value) || 0;
                                              setSelectedCustomFeatures((prev) => ({
                                                ...prev,
                                                [feat.id]: val,
                                              }));
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <span className="text-[10px] font-mono text-text-secondary shrink-0">
                                          Base: ${Number(feat.price || 0).toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <AlertDialogFooter className="border-t border-border-subtle pt-4">
            <AlertDialogCancel onClick={() => setEditTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveEdit}>Save Configuration</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tenant? This action will permanently delete it and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
