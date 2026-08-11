import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { PageHeader, Card, Button } from "@/components/ui/Primitives";
import { TrendingUp, Users, CreditCard, Building2, Calendar, Filter } from "lucide-react";
import { tenantApi, type Tenant, type TenantSubscription } from "@/services/api/tenant";
import { subscriptionApi, type SubscriptionPlan } from "@/services/api/subscription";
import { propertyApi } from "@/services/api/property";
import { toast } from "sonner";

export const Route = createFileRoute("/superadmin/dashboard")({
  head: () => ({ meta: [{ title: "Superadmin Dashboard" }] }),
  component: SuperadminDashboardComponent,
});

function SuperadminDashboardComponent() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
  const [propertiesCount, setPropertiesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "today" | "monthly" | "yearly">("all");

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const currentMonthStr = useMemo(() => new Date().toISOString().substring(0, 7), []);
  const currentYearStr = useMemo(() => new Date().getFullYear().toString(), []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, pData, subData, propData] = await Promise.all([
        tenantApi.getTenants(),
        subscriptionApi.getPlans(),
        tenantApi.getAllTenantSubscriptions(),
        propertyApi.getSuperadminProperties(),
      ]);
      setTenants(tData);
      setPlans(pData);
      setSubscriptions(subData);
      setPropertiesCount(propData.length);
    } catch (err: any) {
      toast.error("Failed to load dashboard metrics: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map tenants to their active plan and price
  const mappedTenants = useMemo(() => {
    return tenants.map((t) => {
      const activeSub = subscriptions.find((sub) => sub.tenant === t.id && sub.status === "ACTIVE");
      const matchedPlan = activeSub ? plans.find((p) => p.id === activeSub.plan) : null;
      return {
        id: t.id,
        name: t.name,
        schema: t.schema_name,
        domain: t.domain_url,
        plan: matchedPlan ? matchedPlan.name : "None",
        planPrice: matchedPlan ? matchedPlan.price : 0,
        currency: matchedPlan ? matchedPlan.currency : "USD",
        onboardedDate: t.created_at ? new Date(t.created_at).toISOString().split("T")[0] : "—",
        status: t.status,
      };
    });
  }, [tenants, plans, subscriptions]);

  const filteredTenants = useMemo(() => {
    return mappedTenants.filter((t) => {
      if (filter === "today") return t.onboardedDate === todayStr;
      if (filter === "monthly") return t.onboardedDate.startsWith(currentMonthStr);
      if (filter === "yearly") return t.onboardedDate.startsWith(currentYearStr);
      return true;
    });
  }, [mappedTenants, filter, todayStr, currentMonthStr, currentYearStr]);

  // Compute metrics dynamically
  const todayCount = useMemo(() => mappedTenants.filter((t) => t.onboardedDate === todayStr).length, [mappedTenants, todayStr]);
  const monthCount = useMemo(() => mappedTenants.filter((t) => t.onboardedDate.startsWith(currentMonthStr)).length, [mappedTenants, currentMonthStr]);
  const totalCount = tenants.length;

  const totalMRRDetails = useMemo(() => {
    // Group MRR by currency
    const mrrByCurrency: Record<string, number> = {};
    mappedTenants.forEach((t) => {
      if (t.planPrice > 0) {
        const cur = t.currency.toUpperCase();
        mrrByCurrency[cur] = (mrrByCurrency[cur] || 0) + Number(t.planPrice);
      }
    });
    return mrrByCurrency;
  }, [mappedTenants]);

  const renderMRR = () => {
    const currencies = Object.keys(totalMRRDetails);
    if (currencies.length === 0) return "$0.00";
    
    return currencies
      .map((cur) => {
        const amt = totalMRRDetails[cur];
        const symbols: Record<string, string> = { USD: "$", INR: "₹", EUR: "€", GBP: "£" };
        const sym = symbols[cur] || `${cur} `;
        return `${sym}${Number(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      })
      .join(" + ");
  };

  const getStatusLabel = (status: string) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getPlanBadgeClasses = (plan: string) => {
    switch (plan) {
      case "Starter":
      case "Lite":
        return "bg-muted text-text-secondary";
      case "Growth":
      case "Standard":
        return "bg-primary-tint text-primary-pressed";
      case "Enterprise":
      case "Premium":
        return "bg-[oklch(0.62_0.17_150)]/15 text-[oklch(0.62_0.17_150)]";
      default:
        return "bg-surface-2 text-text-secondary border border-border";
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Platform Statistics"
        title="Superadmin Dashboard"
        description="Monitor system-wide metrics, tenant onboards, and global platform revenue."
      />

      <div className="responsive-page-x py-6 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-[13px] text-text-secondary">Loading dashboard stats...</div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Total Tenants</div>
                  <div className="mt-1 text-[26px] font-bold text-text-primary">{totalCount}</div>
                  <div className="mt-1 text-[11px] text-text-disabled">Across all regions</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
              </Card>

              <Card className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Onboarded Today</div>
                  <div className="mt-1 text-[26px] font-bold text-text-primary">{todayCount}</div>
                  <div className="mt-1 text-[11px] text-[var(--color-success)] font-medium">Active installations</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-[oklch(0.62_0.17_150)]/10 flex items-center justify-center text-[oklch(0.62_0.17_150)]">
                  <Calendar className="h-5 w-5" />
                </div>
              </Card>

              <Card className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">This Month</div>
                  <div className="mt-1 text-[26px] font-bold text-text-primary">{monthCount}</div>
                  <div className="mt-1 text-[11px] text-text-secondary">Onboarded this period</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-5 w-5" />
                </div>
              </Card>

              <Card className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Total Properties</div>
                  <div className="mt-1 text-[26px] font-bold text-text-primary">
                    {propertiesCount}
                  </div>
                  <div className="mt-1 text-[11px] text-text-secondary">Across all tenants</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
              </Card>
            </div>

            {/* Filter and Content Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-surface border border-border p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-text-secondary" />
                <span className="text-[13px] font-semibold text-text-primary">Filter Onboarding List:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "today", "monthly", "yearly"] as const).map((mode) => (
                  <Button
                    key={mode}
                    size="sm"
                    variant={filter === mode ? "primary" : "outline"}
                    onClick={() => setFilter(mode)}
                    className="capitalize"
                  >
                    {mode === "all" ? "All Time" : mode === "monthly" ? "This Month" : mode === "yearly" ? "This Year" : mode}
                  </Button>
                ))}
              </div>
            </div>

            {/* Onboarding List Table */}
            <Card className="overflow-hidden">
              <div className="border-b border-border bg-surface px-4 py-3 flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-text-primary">Onboarded Hotels & Tenants</h3>
                  <p className="text-[11px] text-text-secondary">Showing {filteredTenants.length} tenants matching filter</p>
                </div>
                <span className="text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                  Platform Logs
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border bg-surface-2/40">
                    <tr>
                      <th className="px-4 py-2.5 font-medium text-text-secondary text-[11px] uppercase tracking-wider">Tenant Name</th>
                      <th className="px-4 py-2.5 font-medium text-text-secondary text-[11px] uppercase tracking-wider">Schema Context</th>
                      <th className="px-4 py-2.5 font-medium text-text-secondary text-[11px] uppercase tracking-wider">Domain</th>
                      <th className="px-4 py-2.5 font-medium text-text-secondary text-[11px] uppercase tracking-wider">Subscription Plan</th>
                      <th className="px-4 py-2.5 font-medium text-text-secondary text-[11px] uppercase tracking-wider">Onboard Date</th>
                      <th className="px-4 py-2.5 font-medium text-text-secondary text-[11px] uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle bg-surface">
                    {filteredTenants.length > 0 ? (
                      filteredTenants.map((t) => (
                        <tr key={t.id} className="hover:bg-surface-2/30">
                          <td className="px-4 py-3 font-semibold text-text-primary">{t.name}</td>
                          <td className="px-4 py-3 text-text-secondary font-mono text-[12px]">{t.schema}</td>
                          <td className="px-4 py-3 text-text-secondary font-mono text-[12px]">{t.domain}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${getPlanBadgeClasses(t.plan)}`}>
                              {t.plan}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-text-secondary">{t.onboardedDate}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-medium bg-[oklch(0.62_0.17_150)]/10 text-[oklch(0.62_0.17_150)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.62_0.17_150)]" />
                              {getStatusLabel(t.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-text-disabled">
                          No onboardings found for the selected timeframe.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
