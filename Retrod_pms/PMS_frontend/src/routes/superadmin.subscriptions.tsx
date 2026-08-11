import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, Card, Button, StatusBadge } from "@/components/ui/Primitives";
import { CreditCard, Plus, Edit2, Trash2, Check, X, Shield } from "lucide-react";
import { fetchApi } from "@/services/api/core";
import { toast } from "sonner";
import { subscriptionApi, type SubscriptionPlan, type Product, type ProductFeature } from "@/services/api/subscription";
import { tenantApi, type Tenant } from "@/services/api/tenant";
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

export const Route = createFileRoute("/superadmin/subscriptions")({
  head: () => ({ meta: [{ title: "Subscription Plans" }] }),
  component: SuperadminSubscriptionsComponent,
});

const inputCls =
  "h-9 rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";
const selectCls =
  "h-9 rounded-md border border-border bg-surface px-2 text-[13px] text-text-primary focus:border-primary focus:outline-none";

const formatPrice = (price: number, currency: string) => {
  const symbols: Record<string, string> = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£",
  };
  const sym = symbols[currency.toUpperCase()] || `${currency} `;
  return `${sym}${Number(price).toFixed(2)}`;
};

function SuperadminSubscriptionsComponent() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'plans' | 'requests'>('plans');
  const [loading, setLoading] = useState(true);

  // Modal / Draft states
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planDraft, setPlanDraft] = useState({
    id: "",
    name: "",
    billing_cycle: "MONTHLY",
    price: 0,
    currency: "USD",
    is_active: true,
    product_ids: [] as string[],
    feature_codes: [] as string[],
  });

  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState({
    tenant_id: "",
    custom_name: "",
    billing_cycle: "MONTHLY" as "MONTHLY" | "YEARLY",
    currency: "USD",
    selectedFeatures: {} as Record<string, number>, // feature_id -> price
  });

  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pData, prodData, featData, reqData, tData] = await Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getProducts(),
        subscriptionApi.getFeatures(),
        fetchApi<any[]>("/api/tenant/request-subscription/"),
        tenantApi.getTenants().catch(() => []),
      ]);
      setPlans(pData);
      setProducts(prodData);
      setFeatures(featData);
      setRequests(reqData || []);
      setTenants(tData || []);
    } catch (err: any) {
      toast.error("Failed to load subscription settings: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await fetchApi("/api/tenant/request-subscription/", {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      });
      toast.success(`Request ${status.toLowerCase()} successfully!`);
      loadData();
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePlan = async () => {
    if (!planDraft.name) {
      toast.error("Please provide a plan name.");
      return;
    }
    try {
      if (planDraft.id) {
        await subscriptionApi.updatePlan(planDraft.id, {
          name: planDraft.name,
          billing_cycle: planDraft.billing_cycle,
          price: Number(planDraft.price),
          currency: planDraft.currency,
          is_active: planDraft.is_active,
          product_ids: planDraft.product_ids,
          feature_codes: planDraft.feature_codes,
        });
        toast.success("Subscription Plan updated.");
      } else {
        await subscriptionApi.createPlan({
          name: planDraft.name,
          billing_cycle: planDraft.billing_cycle,
          price: Number(planDraft.price),
          currency: planDraft.currency,
          is_active: planDraft.is_active,
          product_ids: planDraft.product_ids,
          feature_codes: planDraft.feature_codes,
        });
        toast.success("Subscription Plan created.");
      }
      setPlanModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error("Error saving subscription plan: " + err.message);
    }
  };

  const handleDeletePlan = async () => {
    if (!deletePlanId) return;
    try {
      await subscriptionApi.deletePlan(deletePlanId);
      toast.success("Subscription Plan deleted.");
      setDeletePlanId(null);
      loadData();
    } catch (err: any) {
      toast.error("Error deleting plan: " + err.message);
    }
  };

  const toggleProductInDraft = (prodId: string) => {
    setPlanDraft((d) => {
      const exists = d.product_ids.includes(prodId);
      const nextIds = exists ? d.product_ids.filter((id) => id !== prodId) : [...d.product_ids, prodId];
      
      // Auto-toggle features under this product
      const productFeats = features.filter((f) => f.product === prodId).map((f) => f.code);
      let nextFeatures = [...d.feature_codes];
      if (exists) {
        // remove features of this product
        nextFeatures = nextFeatures.filter((code) => !productFeats.includes(code));
      } else {
        // add all features of this product by default
        nextFeatures = Array.from(new Set([...nextFeatures, ...productFeats]));
      }

      return { ...d, product_ids: nextIds, feature_codes: nextFeatures };
    });
  };

  const toggleFeatureInDraft = (featureCode: string) => {
    setPlanDraft((d) => {
      const exists = d.feature_codes.includes(featureCode);
      const nextFeatures = exists
        ? d.feature_codes.filter((c) => c !== featureCode)
        : [...d.feature_codes, featureCode];
      return { ...d, feature_codes: nextFeatures };
    });
  };

  const toggleCustomFeature = (feature: ProductFeature) => {
    setCustomDraft((prev) => {
      const next = { ...prev.selectedFeatures };
      if (next[feature.id] !== undefined) {
        delete next[feature.id];
      } else {
        next[feature.id] = Number(feature.price || 0);
      }
      return { ...prev, selectedFeatures: next };
    });
  };

  const setCustomFeaturePrice = (featureId: string, price: number) => {
    setCustomDraft((prev) => ({
      ...prev,
      selectedFeatures: {
        ...prev.selectedFeatures,
        [featureId]: price,
      },
    }));
  };

  const calculatedCustomTotal = Object.values(customDraft.selectedFeatures).reduce(
    (sum, val) => sum + Number(val || 0),
    0
  );

  const handleSaveCustomSubscription = async () => {
    if (!customDraft.tenant_id) {
      toast.error("Please select a tenant.");
      return;
    }
    const featureIds = Object.keys(customDraft.selectedFeatures);
    if (featureIds.length === 0) {
      toast.error("Please select at least one feature for the custom subscription.");
      return;
    }

    try {
      const payloadFeatures = featureIds.map((id) => ({
        feature_id: id,
        price: Number(customDraft.selectedFeatures[id] || 0),
      }));

      await subscriptionApi.assignCustomSubscription({
        tenant_id: customDraft.tenant_id,
        custom_name: customDraft.custom_name,
        billing_cycle: customDraft.billing_cycle,
        price: calculatedCustomTotal,
        currency: customDraft.currency,
        features: payloadFeatures,
      });

      toast.success("Custom Feature Subscription created and assigned successfully!");
      setCustomModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error("Error creating custom subscription: " + err.message);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Platform Tiers"
        title="Subscription Management"
        description="Configure pricing plans, limitation thresholds, and active products comparison matrix."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCustomDraft({
                  tenant_id: "",
                  custom_name: "",
                  billing_cycle: "MONTHLY",
                  currency: "USD",
                  selectedFeatures: {},
                });
                setCustomModalOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Custom Subscription
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setPlanDraft({
                  id: "",
                  name: "",
                  billing_cycle: "MONTHLY",
                  price: 0,
                  currency: "USD",
                  is_active: true,
                  product_ids: [],
                  feature_codes: [],
                });
                setPlanModalOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> New Plan
            </Button>
          </div>
        }
      />

      <div className="responsive-page-x py-6 space-y-6">
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'plans'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Subscription Plans ({plans.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
              activeTab === 'requests'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Subscription Requests ({requests.length})
            {requests.some(r => r.status === 'PENDING') && (
              <span className="absolute top-2 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[13px] text-text-secondary">Loading subscription data...</div>
        ) : activeTab === 'plans' ? (
          <div className="space-y-6">
            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((p) => (
                <Card key={p.id} className="relative overflow-hidden flex flex-col justify-between h-full border border-border bg-surface">
                  <div className="p-5 border-b border-border bg-surface-2/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {p.name} Plan
                      </span>
                      <div className="flex gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setPlanDraft({
                              id: p.id,
                              name: p.name,
                              billing_cycle: p.billing_cycle,
                              price: Number(p.price),
                              currency: p.currency,
                              is_active: p.is_active,
                              product_ids: p.products.map((pr) => pr.id),
                              feature_codes: p.feature_codes || [],
                            });
                            setPlanModalOpen(true);
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-error hover:bg-error/10 hover:text-error"
                          onClick={() => setDeletePlanId(p.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-baseline text-text-primary">
                      <span className="text-3xl font-display font-bold tracking-tight">
                        {formatPrice(p.price, p.currency)}
                      </span>
                      <span className="ml-1 text-[13px] text-text-secondary uppercase">
                        / {p.billing_cycle === 'MONTHLY' ? 'mo' : 'yr'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">Included Apps</div>
                      {p.products.length === 0 ? (
                        <div className="text-[12.5px] text-text-disabled">No products linked.</div>
                      ) : (
                        <ul className="space-y-1.5">
                          {p.products.map((prod) => (
                            <li key={prod.id} className="flex items-center gap-2 text-[13px] text-text-primary font-medium">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {prod.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">Active Entitlements</div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.feature_codes && p.feature_codes.length > 0 ? (
                          p.feature_codes.map((code) => (
                            <span key={code} className="text-[11px] bg-surface-2 px-2 py-0.5 border border-border rounded text-text-secondary font-mono">
                              {code}
                            </span>
                          ))
                        ) : (
                          <span className="text-[12px] text-text-disabled">Full feature set enabled.</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${p.is_active ? 'text-success' : 'text-text-disabled'}`}>
                        <span className={`h-2 w-2 rounded-full ${p.is_active ? 'bg-success' : 'bg-text-disabled'}`} />
                        {p.is_active ? "Actively Selling" : "Inactive Tier"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Matrix comparison */}
            <Card className="overflow-hidden border border-border bg-surface">
              <div className="p-5 border-b border-border">
                <h3 className="font-display text-[16px] font-semibold text-text-primary">Products Comparison Matrix</h3>
                <p className="text-[12px] text-text-secondary mt-0.5">Quick overview of apps enabled per subscription tier.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-2/35 text-left text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                      <th className="px-4 py-3">Product Name</th>
                      {plans.map((p) => (
                        <th key={p.id} className="px-4 py-3 text-center min-w-[120px]">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle bg-surface">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-surface-2/30 text-left">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-text-primary">{prod.name}</div>
                          <div className="text-[11px] text-text-secondary font-mono">({prod.code})</div>
                        </td>
                        {plans.map((p) => {
                          const hasProduct = p.products.some((x) => x.id === prod.id);
                          return (
                            <td key={p.id} className="px-4 py-3 text-center">
                              {hasProduct ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[oklch(0.62_0.17_150)]/15 text-[oklch(0.62_0.17_150)]">
                                  <Check className="h-4 w-4" />
                                </span>
                              ) : (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-error/10 text-error">
                                  <X className="h-4 w-4" />
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="overflow-hidden border border-border bg-surface">
            <div className="p-5 border-b border-border">
              <h3 className="font-display text-[16px] font-semibold text-text-primary">Incoming Partner Requests</h3>
              <p className="text-[12px] text-text-secondary mt-0.5">Manage subscription requests sent by tenant administrators.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border bg-surface-2/35 text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                    <th className="px-4 py-3">Tenant / Partner</th>
                    <th className="px-4 py-3">Requested App</th>
                    <th className="px-4 py-3">Requested By</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Comments</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle bg-surface">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[13px] text-text-secondary">
                        No subscription requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((r) => (
                      <tr key={r.id} className="hover:bg-surface-2/30">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-text-primary">{r.tenant_name}</div>
                          <div className="text-[11px] text-text-secondary font-mono">({r.tenant_subdomain})</div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-primary">
                          {r.product_name}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-text-primary">{r.contact_name}</div>
                          <div className="text-[11px] text-text-secondary">{r.contact_email}</div>
                        </td>
                        <td className="px-4 py-3.5 text-[12.5px] text-text-secondary">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5 max-w-[200px] truncate text-[12.5px] text-text-secondary" title={r.comments}>
                          {r.comments || <span className="text-text-disabled italic">No remarks</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge
                            tone={
                              r.status === 'APPROVED'
                                ? 'success'
                                : r.status === 'REJECTED'
                                ? 'error'
                                : 'warning'
                            }
                          >
                            {r.status}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {r.status === 'PENDING' && (
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[11px] hover:bg-success/10 hover:text-success hover:border-success/30"
                                onClick={() => handleRequestAction(r.id, 'APPROVED')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[11px] text-error hover:bg-error/10 hover:border-error/30"
                                onClick={() => handleRequestAction(r.id, 'REJECTED')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Card className="p-4 bg-primary-tint border border-primary/20 flex gap-3 rounded-lg">
          <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-[12.5px] text-text-primary">
            <div className="font-semibold text-primary-pressed">Global Tenant Sandboxing Policy</div>
            <p className="mt-1 text-text-secondary leading-relaxed font-normal">
              When tenants sign up or select a tier, the system matches their properties/rooms counts to the
              plan thresholds configured here. Limit changes apply globally to all current and future active
              subscriptions instantly.
            </p>
          </div>
        </Card>
      </div>

      {/* Plan Edit/Create Modal */}
      <AlertDialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <AlertDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>{planDraft.id ? "Edit Subscription Plan" : "Create Subscription Plan"}</AlertDialogTitle>
            <AlertDialogDescription>Specify plan parameters and assign accessible product modules.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2 flex flex-col">
            <input
              className={inputCls}
              placeholder="Plan Name (e.g. Growth)"
              value={planDraft.name}
              onChange={(e) => setPlanDraft({ ...planDraft, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                className={inputCls}
                placeholder="Price"
                value={planDraft.price}
                onChange={(e) => setPlanDraft({ ...planDraft, price: Number(e.target.value) })}
              />
              <select
                className={selectCls}
                value={planDraft.billing_cycle}
                onChange={(e) => setPlanDraft({ ...planDraft, billing_cycle: e.target.value })}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                className={selectCls}
                value={planDraft.currency}
                onChange={(e) => setPlanDraft({ ...planDraft, currency: e.target.value })}
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
              <label className="flex items-center gap-2 text-[12.5px] select-none text-text-primary">
                <input
                  type="checkbox"
                  checked={planDraft.is_active}
                  onChange={(e) => setPlanDraft({ ...planDraft, is_active: e.target.checked })}
                />
                Active Plan
              </label>
            </div>

            {/* Linked Products & Features Checklist */}
            <div className="border border-border rounded p-3 bg-surface-2/10 mt-2">
              <div className="text-[11.5px] font-bold text-text-primary mb-2 uppercase tracking-wide">Included Products & Features</div>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {products.map((p) => {
                  const productChecked = planDraft.product_ids.includes(p.id);
                  const productFeats = features.filter((f) => f.product === p.id);
                  
                  return (
                    <div key={p.id} className="space-y-1">
                      <label className="flex items-center gap-2 text-[12.5px] text-text-primary font-semibold select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productChecked}
                          onChange={() => toggleProductInDraft(p.id)}
                        />
                        <span>{p.name} ({p.code})</span>
                      </label>
                      
                      {/* Render nested features if product is checked */}
                      {productChecked && productFeats.length > 0 && (
                        <div className="pl-6 space-y-1.5 border-l border-border ml-2.5 my-1">
                          {productFeats.map((feat) => {
                            const featChecked = planDraft.feature_codes.includes(feat.code);
                            return (
                              <label key={feat.id} className="flex items-center gap-2 text-[11.5px] text-text-secondary select-none cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={featChecked}
                                  onChange={() => toggleFeatureInDraft(feat.code)}
                                />
                                <span>{feat.name} ({feat.code})</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSavePlan}>Save Plan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Custom Subscription Modal */}
      <AlertDialog open={customModalOpen} onOpenChange={setCustomModalOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Create Custom Feature-Wise Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Build a custom subscription tailored to an individual tenant with a-la-carte feature selections and pricing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-text-secondary mb-1 block">Target Tenant *</label>
                <select
                  className={selectCls + " w-full"}
                  value={customDraft.tenant_id}
                  onChange={(e) => setCustomDraft({ ...customDraft, tenant_id: e.target.value })}
                >
                  <option value="">Select Tenant...</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subdomain})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-medium text-text-secondary mb-1 block">Custom Subscription Name</label>
                <input
                  className={inputCls + " w-full"}
                  placeholder="e.g. Grand Palace Custom Tier"
                  value={customDraft.custom_name}
                  onChange={(e) => setCustomDraft({ ...customDraft, custom_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-text-secondary mb-1 block">Billing Cycle</label>
                <select
                  className={selectCls + " w-full"}
                  value={customDraft.billing_cycle}
                  onChange={(e) => setCustomDraft({ ...customDraft, billing_cycle: e.target.value as "MONTHLY" | "YEARLY" })}
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-medium text-text-secondary mb-1 block">Currency</label>
                <select
                  className={selectCls + " w-full"}
                  value={customDraft.currency}
                  onChange={(e) => setCustomDraft({ ...customDraft, currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-text-primary">Feature-Wise Selection & Pricing</span>
                <span className="text-[13px] font-bold text-primary font-mono bg-primary/10 px-2.5 py-1 rounded border border-primary/20">
                  Total: {formatPrice(calculatedCustomTotal, customDraft.currency)}/{customDraft.billing_cycle.toLowerCase()}
                </span>
              </div>

              <div className="space-y-4">
                {products.map((prod) => {
                  const prodFeats = features.filter((f) => f.product === prod.id);
                  if (prodFeats.length === 0) return null;
                  return (
                    <div key={prod.id} className="rounded-lg border border-border bg-surface-2/20 p-3 space-y-2">
                      <div className="text-[12px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-primary" /> {prod.name}
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {prodFeats.map((feat) => {
                          const isSelected = customDraft.selectedFeatures[feat.id] !== undefined;
                          const currentPrice = customDraft.selectedFeatures[feat.id] ?? Number(feat.price || 0);

                          return (
                            <div
                              key={feat.id}
                              className={`flex items-center justify-between gap-3 p-2 rounded-md border text-[12.5px] transition ${
                                isSelected ? "border-primary/40 bg-primary/5" : "border-border bg-surface"
                              }`}
                            >
                              <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 select-none">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleCustomFeature(feat)}
                                />
                                <span className="font-medium text-text-primary truncate">{feat.name}</span>
                                <span className="font-mono text-[10px] text-text-secondary px-1.5 py-0.5 rounded bg-surface border border-border shrink-0">
                                  {feat.code}
                                </span>
                              </label>
                              {isSelected ? (
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[11px] text-text-secondary">Price:</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="h-7 w-24 rounded border border-border bg-surface px-2 font-mono text-[12px] text-text-primary focus:border-primary focus:outline-none"
                                    value={currentPrice}
                                    onChange={(e) => setCustomFeaturePrice(feat.id, parseFloat(e.target.value) || 0)}
                                  />
                                </div>
                              ) : (
                                <span className="text-[11px] font-mono text-text-secondary shrink-0">
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
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveCustomSubscription}>
              Assign Custom Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deletePlanId} onOpenChange={(open) => !open && setDeletePlanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this subscription plan. Tenants assigned to this plan might lose system access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
export default SuperadminSubscriptionsComponent;
