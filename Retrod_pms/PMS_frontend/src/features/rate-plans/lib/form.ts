import type { RatePlan } from "@/types/pms";
import type { RatePlanValidationContext } from "@/features/rate-plans/lib/validation";
import { countBlockingValidationIssues } from "@/features/rate-plans/lib/validation";

export function createEmptyRatePlan(): RatePlan {
  return {
    id: `rate-${Date.now()}`,
    externalRatePlanCode: "",
    name: "",
    description: "",
    benefits: [],
    category: "promotional",
    policyId: "policy-flex",
    cancelPolicyCode: "",
    discountPercent: 0,
    pricingMode: "relative_to_bar",
    currency: "INR",
    status: "Draft",
    version: 1,
    minLos: 1,
    maxLos: 30,
    roomTypeIds: [],
    defaultMealPlanCode: "EP",
    isBarAnchor: false,
    syncStatus: "not_synced",
    propertyId: "PROP-1",
    tenantId: "TEN-1",
    bookingsMtd: 0,
  };
}

export function cloneRatePlan(plan: RatePlan): RatePlan {
  return {
    ...plan,
    id: `rate-${Date.now()}`,
    externalRatePlanCode: `${plan.externalRatePlanCode}-COPY`,
    name: `${plan.name} (Copy)`,
    status: "Draft",
    version: 1,
    syncStatus: "not_synced",
    lastSyncedAt: undefined,
    bookingsMtd: 0,
  };
}

export function countValidationIssues(plan: RatePlan, ctx?: RatePlanValidationContext): number {
  if (ctx) return countBlockingValidationIssues(plan, ctx);
  let issues = 0;
  if (!plan.externalRatePlanCode.trim()) issues += 1;
  if (!plan.name.trim()) issues += 1;
  if (plan.roomTypeIds.length === 0) issues += 1;
  if (!plan.cancelPolicyCode.trim()) issues += 1;
  if (!plan.defaultMealPlanCode) issues += 1;
  if (plan.category === "seasonal" && (!plan.effectiveFrom || !plan.effectiveTo)) issues += 1;
  if (plan.category === "package" && !plan.packageId) issues += 1;
  if (plan.pricingMode === "absolute" && (plan.baseRate == null || plan.baseRate <= 0)) issues += 1;
  return issues;
}

export function summarizePlanChanges(before: RatePlan | undefined, after: RatePlan): string {
  if (!before) return "Initial publish";
  const fields: string[] = [];
  if (before.name !== after.name) fields.push("name");
  if (before.externalRatePlanCode !== after.externalRatePlanCode) fields.push("code");
  if (before.baseRate !== after.baseRate || before.discountPercent !== after.discountPercent) {
    fields.push("pricing");
  }
  if (before.status !== after.status) fields.push("status");
  if (before.roomTypeIds.length !== after.roomTypeIds.length) fields.push("room types");
  if (before.defaultMealPlanCode !== after.defaultMealPlanCode) fields.push("meal plan");
  return fields.length > 0 ? `Updated ${fields.join(", ")}` : "Republished without field changes";
}
