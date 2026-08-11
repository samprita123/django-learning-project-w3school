import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button, StatusBadge } from "@/components/ui/Primitives";
import { RatePlanValidationModal } from "@/features/rate-plans/components/RatePlanValidationModal";
import type { MealPlan, RatePlan, RatePlanPolicy, RatePlanVersion } from "@/types/pms";
import {
  EDITOR_TABS,
  MEAL_PLAN_CODES,
  RATE_PLAN_CATEGORIES,
  RATE_PLAN_CATEGORY_LABEL,
  ROOM_TYPE_OPTIONS,
  SYNC_STATUS_LABEL,
  type EditorTab,
} from "@/features/rate-plans/lib/constants";
import { countValidationIssues } from "@/features/rate-plans/lib/form";
import { validateRatePlan } from "@/features/rate-plans/lib/validation";

const inputCls =
  "h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  );
}

function syncTone(status: RatePlan["syncStatus"]) {
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

interface RatePlanEditorDrawerProps {
  open: boolean;
  plan: RatePlan | null;
  allPlans: RatePlan[];
  policies: RatePlanPolicy[];
  mealPlans: MealPlan[];
  packages: Array<{ id: string; name: string }>;
  versions: RatePlanVersion[];
  canManage: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (plan: RatePlan) => void;
  onPublish: (plan: RatePlan, meta?: { hadWarnings: boolean }) => void;
}

export function RatePlanEditorDrawer({
  open,
  plan,
  allPlans,
  policies,
  mealPlans,
  packages,
  versions,
  canManage,
  onOpenChange,
  onSave,
  onPublish,
}: RatePlanEditorDrawerProps) {
  const [tab, setTab] = useState<EditorTab>("General");
  const [draft, setDraft] = useState<RatePlan | null>(plan);
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationMode, setValidationMode] = useState<"validate" | "publish">("validate");

  useEffect(() => {
    if (plan) {
      setDraft({ ...plan });
      setTab("General");
    }
  }, [plan]);

  const validationCtx = useMemo(
    () => ({
      allPlans: draft
        ? allPlans.some((item) => item.id === draft.id)
          ? allPlans.map((item) => (item.id === draft.id ? draft : item))
          : [...allPlans, draft]
        : allPlans,
      mealPlans,
    }),
    [allPlans, draft, mealPlans],
  );

  const validationResult = useMemo(
    () => (draft ? validateRatePlan(draft, validationCtx) : null),
    [draft, validationCtx],
  );

  const planVersions = useMemo(
    () =>
      draft
        ? versions
            .filter((item) => item.ratePlanId === draft.id)
            .sort((a, b) => b.version - a.version)
        : [],
    [draft, versions],
  );

  if (!draft || !validationResult) return null;

  const policy = policies.find((item) => item.id === draft.policyId);
  const blockingIssues = countValidationIssues(draft, validationCtx);
  const linkedPackage = packages.find((item) => item.id === draft.packageId);

  const patch = (updates: Partial<RatePlan>) =>
    setDraft((prev) => (prev ? { ...prev, ...updates } : prev));

  const toggleRoomType = (roomTypeId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const exists = prev.roomTypeIds.includes(roomTypeId);
      return {
        ...prev,
        roomTypeIds: exists
          ? prev.roomTypeIds.filter((id) => id !== roomTypeId)
          : [...prev.roomTypeIds, roomTypeId],
      };
    });
  };

  const openValidation = (mode: "validate" | "publish") => {
    setValidationMode(mode);
    setValidationOpen(true);
  };

  const handleSaveDraft = () => {
    if (!canManage) return;
    let toSave = { ...draft };
    if (toSave.status === "Active" && blockingIssues > 0) {
      toSave = { ...toSave, status: "Draft" };
      toast.warning("Saved as draft — fix blocking issues before activating.");
    }
    onSave(toSave);
    toast.success(`Rate plan "${toSave.name || toSave.externalRatePlanCode}" saved.`);
    onOpenChange(false);
  };

  const handlePublishConfirm = () => {
    if (!canManage || !validationResult.canPublish) return;
    onPublish(draft, { hadWarnings: validationResult.warnings.length > 0 });
    setValidationOpen(false);
    onOpenChange(false);
  };

  const goToTab = (nextTab: NonNullable<(typeof validationResult.errors)[number]["tab"]>) => {
    setValidationOpen(false);
    setTab(nextTab);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col overflow-hidden sm:max-w-2xl">
          <SheetHeader className="border-b border-border pb-4 text-left">
            <div className="flex flex-wrap items-center gap-2 pr-8">
              <SheetTitle className="font-display text-text-primary">
                {draft.name || "New rate plan"}
              </SheetTitle>
              <StatusBadge tone={statusTone(draft.status)}>{draft.status}</StatusBadge>
              <StatusBadge tone={syncTone(draft.syncStatus)}>
                {SYNC_STATUS_LABEL[draft.syncStatus]}
              </StatusBadge>
            </div>
            <SheetDescription className="text-text-secondary">
              {draft.externalRatePlanCode || "Draft code pending"} · v{draft.version}
            </SheetDescription>
          </SheetHeader>

          <div className="flex gap-1 overflow-x-auto border-b border-border px-1 py-2">
            {EDITOR_TABS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`shrink-0 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  tab === item
                    ? "bg-primary-tint text-primary"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-1 py-4">
            {tab === "General" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Rate plan code">
                  <input
                    disabled={!canManage}
                    className={inputCls}
                    value={draft.externalRatePlanCode}
                    onChange={(e) => patch({ externalRatePlanCode: e.target.value.toUpperCase() })}
                    placeholder="BAR-FLEX"
                  />
                </Field>
                <Field label="Display name">
                  <input
                    disabled={!canManage}
                    className={inputCls}
                    value={draft.name}
                    onChange={(e) => patch({ name: e.target.value })}
                  />
                </Field>
                <Field label="Category">
                  <select
                    disabled={!canManage}
                    className={inputCls}
                    value={draft.category}
                    onChange={(e) => patch({ category: e.target.value as RatePlan["category"] })}
                  >
                    {RATE_PLAN_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {RATE_PLAN_CATEGORY_LABEL[cat]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    disabled={!canManage}
                    className={inputCls}
                    value={draft.status}
                    onChange={(e) => patch({ status: e.target.value as RatePlan["status"] })}
                  >
                    {(["Draft", "Active", "Inactive"] as const).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Description">
                    <textarea
                      disabled={!canManage}
                      className="min-h-[72px] w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                      value={draft.description}
                      onChange={(e) => patch({ description: e.target.value })}
                    />
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-[13px] text-text-primary md:col-span-2">
                  <input
                    disabled={!canManage}
                    type="checkbox"
                    checked={draft.isBarAnchor}
                    onChange={(e) => patch({ isBarAnchor: e.target.checked })}
                  />
                  Set as BAR anchor for this property
                </label>
              </div>
            )}

            {tab === "Pricing" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Pricing mode">
                  <select
                    disabled={!canManage}
                    className={inputCls}
                    value={draft.pricingMode}
                    onChange={(e) =>
                      patch({ pricingMode: e.target.value as RatePlan["pricingMode"] })
                    }
                  >
                    <option value="absolute">Absolute base rate</option>
                    <option value="relative_to_bar">Relative to BAR (% discount)</option>
                  </select>
                </Field>
                <Field label="Currency">
                  <input disabled className={inputCls} value={draft.currency} readOnly />
                </Field>
                {draft.pricingMode === "absolute" ? (
                  <Field label="Base rate">
                    <input
                      disabled={!canManage}
                      type="number"
                      className={inputCls}
                      value={draft.baseRate ?? ""}
                      onChange={(e) => patch({ baseRate: Number(e.target.value) })}
                    />
                  </Field>
                ) : (
                  <Field label="Discount vs BAR (%)">
                    <input
                      disabled={!canManage}
                      type="number"
                      className={inputCls}
                      value={draft.discountPercent}
                      onChange={(e) => patch({ discountPercent: Number(e.target.value) })}
                    />
                  </Field>
                )}
                <div className="md:col-span-2 rounded-md border border-border-subtle bg-surface-2/40 p-3 text-[12px] text-text-secondary">
                  BAR anchor: {draft.isBarAnchor ? "This plan" : "BAR Flexible"} · Preview uses mock
                  BAR ₹8,500
                </div>
              </div>
            )}

            {tab === "Restrictions" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Minimum length of stay">
                  <input
                    disabled={!canManage}
                    type="number"
                    className={inputCls}
                    value={draft.minLos}
                    onChange={(e) => patch({ minLos: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Maximum length of stay">
                  <input
                    disabled={!canManage}
                    type="number"
                    className={inputCls}
                    value={draft.maxLos}
                    onChange={(e) => patch({ maxLos: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Effective from">
                  <input
                    disabled={!canManage}
                    type="date"
                    className={inputCls}
                    value={draft.effectiveFrom ?? ""}
                    onChange={(e) => patch({ effectiveFrom: e.target.value || undefined })}
                  />
                </Field>
                <Field label="Effective to">
                  <input
                    disabled={!canManage}
                    type="date"
                    className={inputCls}
                    value={draft.effectiveTo ?? ""}
                    onChange={(e) => patch({ effectiveTo: e.target.value || undefined })}
                  />
                </Field>
              </div>
            )}

            {tab === "Policies" && (
              <div className="space-y-4">
                <Field label="Policy template">
                  <select
                    disabled={!canManage}
                    className={inputCls}
                    value={draft.policyId}
                    onChange={(e) => patch({ policyId: e.target.value })}
                  >
                    {policies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.id.replace("policy-", "").replace(/^\w/, (c) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="SU cancellation policy code">
                  <input
                    disabled={!canManage}
                    className={inputCls}
                    value={draft.cancelPolicyCode}
                    onChange={(e) => patch({ cancelPolicyCode: e.target.value.toUpperCase() })}
                  />
                </Field>
                {policy && (
                  <div className="rounded-md border border-border-subtle bg-surface-2/40 p-3 text-[12px] text-text-secondary">
                    <div>{policy.cancellationPolicy}</div>
                    <div className="mt-1">{policy.refundPolicy}</div>
                    <div className="mt-1">
                      {policy.minStayRule} · {policy.maxStayRule}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "Room & meal" && (
              <div className="space-y-4">
                <Field label="Default meal plan">
                  <select
                    disabled={!canManage}
                    className={inputCls}
                    value={draft.defaultMealPlanCode}
                    onChange={(e) =>
                      patch({
                        defaultMealPlanCode: e.target.value as RatePlan["defaultMealPlanCode"],
                      })
                    }
                  >
                    {MEAL_PLAN_CODES.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </Field>
                {draft.category === "package" && (
                  <Field label="Linked package">
                    <select
                      disabled={!canManage}
                      className={inputCls}
                      value={draft.packageId ?? ""}
                      onChange={(e) => patch({ packageId: e.target.value || undefined })}
                    >
                      <option value="">Select package</option>
                      {packages.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                <div>
                  <div className="mb-2 text-[12px] font-medium text-text-secondary">
                    Linked room types
                  </div>
                  <div className="space-y-2">
                    {ROOM_TYPE_OPTIONS.map((room) => (
                      <label
                        key={room.id}
                        className="flex cursor-pointer items-center justify-between rounded-md border border-border-subtle px-3 py-2 text-[13px]"
                      >
                        <span>
                          {room.name}{" "}
                          <span className="font-mono text-[11px] text-text-secondary">
                            {room.code}
                          </span>
                        </span>
                        <input
                          disabled={!canManage}
                          type="checkbox"
                          checked={draft.roomTypeIds.includes(room.id)}
                          onChange={() => toggleRoomType(room.id)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
                {linkedPackage && (
                  <div className="text-[12px] text-text-secondary">
                    Package: {linkedPackage.name}
                  </div>
                )}
              </div>
            )}

            {tab === "Channels" && (
              <div className="space-y-3 text-[13px]">
                <p className="text-text-secondary">
                  OTA mapping is managed in Channel Manager. This plan syncs using code{" "}
                  <span className="font-mono text-text-primary">
                    {draft.externalRatePlanCode || "—"}
                  </span>
                  .
                </p>
                <div className="rounded-md border border-border-subtle bg-surface-2/40 p-3">
                  <div className="flex items-center justify-between">
                    <span>Sync status</span>
                    <StatusBadge tone={syncTone(draft.syncStatus)}>
                      {SYNC_STATUS_LABEL[draft.syncStatus]}
                    </StatusBadge>
                  </div>
                  {draft.lastSyncedAt && (
                    <div className="mt-2 text-[12px] text-text-secondary">
                      Last synced: {new Date(draft.lastSyncedAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <Link
                  to="/channel-manager/rate-plans"
                  className="text-[12px] font-medium text-primary hover:underline"
                >
                  Open Rate Plan Mapping
                </Link>
              </div>
            )}

            {tab === "History" && (
              <div className="space-y-2 text-[13px]">
                <div className="rounded-md border border-primary/20 bg-primary-tint/20 px-3 py-2">
                  <div className="font-medium text-text-primary">
                    Version {draft.version} (working copy)
                  </div>
                  <div className="text-[12px] text-text-secondary">
                    Status {draft.status} · {draft.syncStatus.replace("_", " ")}
                  </div>
                </div>
                {planVersions.length === 0 ? (
                  <div className="rounded-md border border-border-subtle px-3 py-2 text-text-secondary">
                    No published versions yet. Publish to create the first snapshot.
                  </div>
                ) : (
                  planVersions.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-md border border-border-subtle px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-text-primary">
                          Version {entry.version}
                        </span>
                        <StatusBadge tone="success">Published</StatusBadge>
                      </div>
                      <div className="mt-1 text-[12px] text-text-secondary">
                        {entry.changeSummary}
                      </div>
                      <div className="mt-1 text-[11px] text-text-secondary">
                        {entry.publishedBy} · {new Date(entry.publishedAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {(blockingIssues > 0 || validationResult.warnings.length > 0) && (
            <div className="mx-1 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-[12px] text-text-primary">
              {blockingIssues > 0
                ? `${blockingIssues} blocking issue${blockingIssues === 1 ? "" : "s"} — run validation or fix before publish.`
                : `${validationResult.warnings.length} warning${validationResult.warnings.length === 1 ? "" : "s"} — publish allowed with confirmation.`}
            </div>
          )}

          <SheetFooter className="border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!canManage}
              onClick={() => openValidation("validate")}
            >
              Run validation
            </Button>
            <Button size="sm" disabled={!canManage} onClick={handleSaveDraft}>
              Save draft
            </Button>
            <Button
              size="sm"
              disabled={!canManage || !validationResult.canPublish}
              onClick={() => openValidation("publish")}
            >
              Publish
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <RatePlanValidationModal
        open={validationOpen}
        mode={validationMode}
        result={validationResult}
        planName={draft.name}
        onOpenChange={setValidationOpen}
        onGoToTab={goToTab}
        onPublishAnyway={validationMode === "publish" ? handlePublishConfirm : undefined}
      />
    </>
  );
}
