import { useMemo, useState } from "react";
import { Plus, Filter, RefreshCw } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  PageHeader,
  KpiCard,
  Button,
  Card,
  CardHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import { GuardedRoute } from "@/features/auth/components/GuardedRoute";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { RatePlanEditorDrawer } from "@/features/rate-plans/components/RatePlanEditorDrawer";
import { RATE_PLAN_CATEGORY_LABEL, SYNC_STATUS_LABEL } from "@/features/rate-plans/lib/constants";
import {
  cloneRatePlan,
  createEmptyRatePlan,
  summarizePlanChanges,
} from "@/features/rate-plans/lib/form";
import {
  pushRatePlanToSu,
  queueRatePlanSuSync,
  simulateSuSyncJobCompletion,
} from "@/features/rate-plans/lib/su-sync";
import { countBlockingValidationIssues } from "@/features/rate-plans/lib/validation";
import { listSuRatePlanSyncJobs } from "@/services/su/rate-plan-store";
import type { SuRatePlanSyncJob } from "@/types/channel-manager";
import {
  useAppendRatePlanVersionMutation,
  useHotelPackagesQuery,
  useMealPlansQuery,
  useRatePlanPoliciesQuery,
  useRatePlanVersionsQuery,
  useRatePlansQuery,
  useSaveRatePlansMutation,
} from "@/services/mock/queries";
import type { RatePlan, RatePlanCategory, RatePlanSyncStatus, RatePlanVersion } from "@/types/pms";

function syncTone(status: RatePlanSyncStatus) {
  if (status === "synced") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "error") return "error" as const;
  return "neutral" as const;
}

function statusTone(status: RatePlan["status"]) {
  if (status === "Active") return "success" as const;
  if (status === "Draft") return "warning" as const;
  return "neutral" as const;
}

function formatEffective(plan: RatePlan) {
  if (plan.effectiveFrom && plan.effectiveTo) return `${plan.effectiveFrom} → ${plan.effectiveTo}`;
  if (plan.effectiveFrom) return `From ${plan.effectiveFrom}`;
  return "Always";
}

function formatPricing(plan: RatePlan) {
  if (plan.pricingMode === "absolute" && plan.baseRate != null) {
    return `₹${plan.baseRate.toLocaleString()}`;
  }
  return plan.discountPercent > 0 ? `-${plan.discountPercent}%` : "BAR";
}

function mergePlanList(plans: RatePlan[], updated: RatePlan, isNew: boolean): RatePlan[] {
  const base = isNew
    ? [...plans, updated]
    : plans.map((item) => (item.id === updated.id ? updated : item));
  if (updated.isBarAnchor && updated.status === "Active") {
    return base.map((item) => (item.id === updated.id ? item : { ...item, isBarAnchor: false }));
  }
  return base;
}

export function RatePlansFeature() {
  const { can, logAuditEvent, user } = useAuth();
  const canManage = can("revenue.editrates");
  const { data: ratePlans = [] } = useRatePlansQuery();
  const { data: policies = [] } = useRatePlanPoliciesQuery();
  const { data: mealPlans = [] } = useMealPlansQuery();
  const { data: packages = [] } = useHotelPackagesQuery();
  const { data: versions = [] } = useRatePlanVersionsQuery();
  const saveMutation = useSaveRatePlansMutation();
  const appendVersionMutation = useAppendRatePlanVersionMutation();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<RatePlanCategory | "All">("All");
  const [statusFilter, setStatusFilter] = useState<RatePlan["status"] | "All">("All");
  const [syncFilter, setSyncFilter] = useState<RatePlanSyncStatus | "All">("All");
  const [editorPlan, setEditorPlan] = useState<RatePlan | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [syncJobs, setSyncJobs] = useState<SuRatePlanSyncJob[]>(() => listSuRatePlanSyncJobs());

  const refreshSyncJobs = () => setSyncJobs(listSuRatePlanSyncJobs());

  const validationCtx = useMemo(() => ({ allPlans: ratePlans, mealPlans }), [ratePlans, mealPlans]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ratePlans.filter((plan) => {
      if (categoryFilter !== "All" && plan.category !== categoryFilter) return false;
      if (statusFilter !== "All" && plan.status !== statusFilter) return false;
      if (syncFilter !== "All" && plan.syncStatus !== syncFilter) return false;
      if (!q) return true;
      return (
        plan.name.toLowerCase().includes(q) ||
        plan.externalRatePlanCode.toLowerCase().includes(q) ||
        RATE_PLAN_CATEGORY_LABEL[plan.category].toLowerCase().includes(q)
      );
    });
  }, [ratePlans, search, categoryFilter, statusFilter, syncFilter]);

  const kpis = useMemo(() => {
    const active = ratePlans.filter((p) => p.status === "Active").length;
    const mapped = ratePlans.filter((p) => p.syncStatus === "synced").length;
    const issues = ratePlans.reduce(
      (sum, p) => sum + countBlockingValidationIssues(p, validationCtx),
      0,
    );
    const bar = ratePlans.find((p) => p.isBarAnchor);
    const top = [...ratePlans].sort((a, b) => (b.bookingsMtd ?? 0) - (a.bookingsMtd ?? 0))[0];
    return { active, mapped, issues, bar, top };
  }, [ratePlans, validationCtx]);

  const persistPlans = (next: RatePlan[]) => {
    saveMutation.mutate(next);
  };

  const finalizeSuSync = (
    plans: RatePlan[],
    planId: string,
    jobId: string,
    actionLabel: string,
  ) => {
    simulateSuSyncJobCompletion(jobId, (success) => {
      saveMutation.mutate(
        plans.map((item) =>
          item.id === planId
            ? {
                ...item,
                syncStatus: success ? ("synced" as const) : ("error" as const),
                lastSyncedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
      refreshSyncJobs();
      logAuditEvent(
        success ? "Rate plan SU sync completed" : "Rate plan SU sync failed",
        plans.find((item) => item.id === planId)?.externalRatePlanCode,
        `${actionLabel} · Job ${jobId}`,
      );
      if (success) {
        toast.success(`SU sync completed (${jobId})`);
      } else {
        toast.error(`SU sync failed (${jobId}) — retry from Rate Plans.`);
      }
    });
  };

  const openCreate = () => {
    setEditorPlan(createEmptyRatePlan());
    setDrawerOpen(true);
  };

  const openEdit = (plan: RatePlan) => {
    setEditorPlan(plan);
    setDrawerOpen(true);
  };

  const handleSave = (plan: RatePlan) => {
    const exists = ratePlans.some((item) => item.id === plan.id);
    const before = ratePlans.find((item) => item.id === plan.id);
    const next = mergePlanList(ratePlans, plan, !exists);
    persistPlans(next);
    logAuditEvent(
      exists ? "Rate plan updated" : "Rate plan created",
      plan.externalRatePlanCode || plan.id,
      exists
        ? summarizePlanChanges(before, plan)
        : `Created draft plan ${plan.name || plan.externalRatePlanCode}.`,
    );
  };

  const handlePublish = async (plan: RatePlan, meta?: { hadWarnings: boolean }) => {
    const before = ratePlans.find((item) => item.id === plan.id);
    const nextVersion = (before?.version ?? plan.version) + 1;
    const published: RatePlan = {
      ...plan,
      status: "Active",
      version: nextVersion,
      syncStatus: "pending",
    };
    const exists = ratePlans.some((item) => item.id === plan.id);
    const next = mergePlanList(ratePlans, published, !exists);
    persistPlans(next);

    const versionEntry: RatePlanVersion = {
      id: `rpv-${Date.now()}`,
      ratePlanId: plan.id,
      version: nextVersion,
      snapshot: published,
      publishedAt: new Date().toISOString(),
      publishedBy: user?.name ?? "Unknown",
      changeSummary: summarizePlanChanges(before, published),
    };
    appendVersionMutation.mutate(versionEntry);

    logAuditEvent(
      "Rate plan published",
      published.externalRatePlanCode,
      `Published v${nextVersion} · ${published.name}. ${versionEntry.changeSummary}${
        meta?.hadWarnings ? " (warnings acknowledged)" : ""
      }`,
    );

    try {
      const { jobId, source } = await pushRatePlanToSu(published);
      refreshSyncJobs();
      logAuditEvent(
        "Rate plan SU sync queued",
        published.externalRatePlanCode,
        `Publish triggered SU job ${jobId} (${source}).`,
      );
      toast.success(`Published v${nextVersion} · SU sync ${jobId}`);
      finalizeSuSync(next, plan.id, jobId, "Publish sync");
    } catch {
      saveMutation.mutate(
        next.map((item) =>
          item.id === plan.id ? { ...item, syncStatus: "error" as const } : item,
        ),
      );
      toast.error("Published locally but SU sync failed to queue.");
    }
  };

  const handleDeactivate = (plan: RatePlan) => {
    if (!canManage) return;
    persistPlans(
      ratePlans.map((item) =>
        item.id === plan.id ? { ...item, status: "Inactive" as const, isBarAnchor: false } : item,
      ),
    );
    logAuditEvent("Rate plan deactivated", plan.externalRatePlanCode, `Deactivated ${plan.name}.`);
    toast.success(`"${plan.name}" deactivated.`);
  };

  const handleClone = (plan: RatePlan) => {
    if (!canManage) return;
    const copy = cloneRatePlan(plan);
    persistPlans([...ratePlans, copy]);
    logAuditEvent(
      "Rate plan cloned",
      plan.externalRatePlanCode,
      `Cloned to ${copy.externalRatePlanCode}.`,
    );
    openEdit(copy);
    toast.success(`Cloned "${plan.name}".`);
  };

  const handleSync = async (plan: RatePlan) => {
    if (!canManage) return;
    const pending = ratePlans.map((item) =>
      item.id === plan.id
        ? {
            ...item,
            syncStatus: "pending" as const,
            lastSyncedAt: new Date().toISOString(),
          }
        : item,
    );
    persistPlans(pending);

    try {
      const { jobId, source } = await queueRatePlanSuSync(plan);
      refreshSyncJobs();
      logAuditEvent(
        "Rate plan sync queued",
        plan.externalRatePlanCode,
        `Queued SU sync job ${jobId} (${source}) for ${plan.name}.`,
      );
      toast.success(`Sync queued · ${jobId}`);
      finalizeSuSync(pending, plan.id, jobId, "Manual sync");
    } catch {
      saveMutation.mutate(
        pending.map((item) =>
          item.id === plan.id ? { ...item, syncStatus: "error" as const } : item,
        ),
      );
      toast.error(`Failed to queue SU sync for "${plan.name}".`);
    }
  };

  return (
    <GuardedRoute
      permission="revenue.view"
      title="Rate Plans access required"
      description="You need revenue view permission to manage rate plan definitions."
    >
      <div>
        <PageHeader
          eyebrow="Commercial"
          title="Rate Plans"
          description="Canonical rate plan definitions for reservations, yield rules, and SU channel sync."
          actions={
            <>
              <Link
                to="/channel-manager/rate-plans"
                className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-[12px] font-medium text-primary hover:bg-surface-2"
              >
                OTA mapping
              </Link>
              {canManage && (
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-3.5 w-3.5" />
                  Create plan
                </Button>
              )}
            </>
          }
        />

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <KpiCard label="Active plans" value={String(kpis.active)} accent="brand" />
            <KpiCard label="Mapped to OTAs" value={String(kpis.mapped)} accent="success" />
            <KpiCard label="Validation issues" value={String(kpis.issues)} accent="warning" />
            <KpiCard
              label="BAR reference"
              value={kpis.bar ? `₹${(kpis.bar.baseRate ?? 8500).toLocaleString()}` : "—"}
              accent="info"
            />
            <KpiCard
              label="Top plan · MTD"
              value={kpis.top ? `${kpis.top.bookingsMtd ?? 0}` : "0"}
              delta={kpis.top?.name}
              accent="success"
            />
          </div>

          <Card>
            <CardHeader
              title="Rate plan catalog"
              hint={`${filtered.length} of ${ratePlans.length} plans`}
            />
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 pb-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search code or name…"
                className="h-8 min-w-[180px] flex-1 rounded-md border border-border bg-surface px-2 text-[12px] sm:max-w-xs"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as RatePlanCategory | "All")}
                className="h-8 rounded-md border border-border bg-surface px-2 text-[12px]"
              >
                <option value="All">All categories</option>
                {(Object.keys(RATE_PLAN_CATEGORY_LABEL) as RatePlanCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {RATE_PLAN_CATEGORY_LABEL[cat]}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as RatePlan["status"] | "All")}
                className="h-8 rounded-md border border-border bg-surface px-2 text-[12px]"
              >
                {(["All", "Active", "Draft", "Inactive"] as const).map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All statuses" : s}
                  </option>
                ))}
              </select>
              <select
                value={syncFilter}
                onChange={(e) => setSyncFilter(e.target.value as RatePlanSyncStatus | "All")}
                className="h-8 rounded-md border border-border bg-surface px-2 text-[12px]"
              >
                <option value="All">All sync</option>
                {(Object.keys(SYNC_STATUS_LABEL) as RatePlanSyncStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {SYNC_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Import CSV — Phase 3.")}
              >
                <Filter className="h-3.5 w-3.5" />
                Import
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    {[
                      "Code",
                      "Name",
                      "Type",
                      "Rooms",
                      "Meal",
                      "Pricing",
                      "Effective",
                      "Sync",
                      "Status",
                      "",
                    ].map((h) => (
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
                  {filtered.map((plan) => (
                    <tr
                      key={plan.id}
                      className="border-b border-border-subtle hover:bg-surface-2/50"
                    >
                      <td className="px-4 py-3 font-mono text-[12px]">
                        {plan.externalRatePlanCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-text-primary">{plan.name}</div>
                        <div className="text-[11px] text-text-secondary">{plan.description}</div>
                      </td>
                      <td className="px-4 py-3">{RATE_PLAN_CATEGORY_LABEL[plan.category]}</td>
                      <td className="px-4 py-3 font-mono">{plan.roomTypeIds.length}</td>
                      <td className="px-4 py-3 font-mono">{plan.defaultMealPlanCode}</td>
                      <td className="px-4 py-3 font-mono text-primary">{formatPricing(plan)}</td>
                      <td className="px-4 py-3 text-[12px] text-text-secondary">
                        {formatEffective(plan)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={syncTone(plan.syncStatus)}>
                          {SYNC_STATUS_LABEL[plan.syncStatus]}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={statusTone(plan.status)}>{plan.status}</StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            className="text-[12px] font-medium text-primary"
                            onClick={() => openEdit(plan)}
                          >
                            Edit
                          </button>
                          {canManage && (
                            <>
                              <button
                                type="button"
                                className="text-[12px] font-medium text-text-secondary hover:text-text-primary"
                                onClick={() => handleClone(plan)}
                              >
                                Clone
                              </button>
                              {plan.status === "Active" && (
                                <button
                                  type="button"
                                  className="text-[12px] font-medium text-text-secondary hover:text-text-primary"
                                  onClick={() => handleDeactivate(plan)}
                                >
                                  Deactivate
                                </button>
                              )}
                              <button
                                type="button"
                                className="text-[12px] font-medium text-text-secondary hover:text-text-primary"
                                onClick={() => handleSync(plan)}
                              >
                                <RefreshCw className="mr-1 inline h-3 w-3" />
                                Sync
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {syncJobs.length > 0 && (
            <Card>
              <CardHeader title="SU sync jobs" hint="Recent rate plan pushes to channel manager" />
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-2/40 text-left">
                      {["Job ID", "Plans", "Status", "Queued", "Completed", ""].map((h) => (
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
                    {syncJobs.slice(0, 8).map((job) => (
                      <tr key={job.id} className="border-b border-border-subtle">
                        <td className="px-4 py-3 font-mono text-[11px]">{job.id}</td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          {job.ratePlanCodes.join(", ")}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            tone={
                              job.status === "success"
                                ? "success"
                                : job.status === "error"
                                  ? "error"
                                  : "warning"
                            }
                          >
                            {job.status.replace("_", " ")}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-text-secondary">
                          {new Date(job.queuedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-text-secondary">
                          {job.completedAt ? new Date(job.completedAt).toLocaleString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to="/channel-manager/sync-logs"
                            className="text-[12px] font-medium text-primary hover:underline"
                          >
                            Sync logs
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        <RatePlanEditorDrawer
          open={drawerOpen}
          plan={editorPlan}
          allPlans={ratePlans}
          policies={policies}
          mealPlans={mealPlans}
          packages={packages.map((p) => ({ id: p.id, name: p.name }))}
          versions={versions as RatePlanVersion[]}
          canManage={canManage}
          onOpenChange={setDrawerOpen}
          onSave={handleSave}
          onPublish={handlePublish}
        />
      </div>
    </GuardedRoute>
  );
}

export default RatePlansFeature;
