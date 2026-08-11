import type {
  MealPlan,
  RatePlan,
  RatePlanValidationIssue,
  RatePlanValidationResult,
} from "@/types/pms";

export type RatePlanValidationContext = {
  allPlans: RatePlan[];
  mealPlans: MealPlan[];
};

function issue(
  ruleId: string,
  message: string,
  severity: RatePlanValidationIssue["severity"],
  tab?: RatePlanValidationIssue["tab"],
): RatePlanValidationIssue {
  return { ruleId, message, severity, tab };
}

export function validateRatePlan(
  plan: RatePlan,
  ctx: RatePlanValidationContext,
): RatePlanValidationResult {
  const errors: RatePlanValidationIssue[] = [];
  const warnings: RatePlanValidationIssue[] = [];

  const code = plan.externalRatePlanCode.trim();
  const duplicate = ctx.allPlans.some(
    (item) =>
      item.id !== plan.id && item.externalRatePlanCode.trim().toUpperCase() === code.toUpperCase(),
  );
  if (!code) {
    errors.push(issue("V-01", "Rate plan code is required.", "error", "General"));
  } else if (duplicate) {
    errors.push(
      issue("V-01", `Code "${code}" is already used by another plan.`, "error", "General"),
    );
  }

  if (!plan.name.trim()) {
    errors.push(issue("V-01", "Display name is required.", "error", "General"));
  }

  if (plan.roomTypeIds.length === 0) {
    errors.push(issue("V-02", "Link at least one room type.", "error", "Room & meal"));
  }

  if (!plan.policyId) {
    errors.push(issue("V-03", "Select a cancellation policy template.", "error", "Policies"));
  }
  if (!plan.cancelPolicyCode.trim()) {
    errors.push(issue("V-03", "SU cancellation policy code is required.", "error", "Policies"));
  }

  if (!plan.defaultMealPlanCode) {
    errors.push(issue("V-04", "Default meal plan is required.", "error", "Room & meal"));
  }

  if (plan.isBarAnchor) {
    const otherBar = ctx.allPlans.some(
      (item) => item.id !== plan.id && item.isBarAnchor && item.status === "Active",
    );
    if (otherBar) {
      errors.push(
        issue("V-05", "Only one active BAR anchor is allowed per property.", "error", "General"),
      );
    }
  }

  if (plan.effectiveFrom && plan.effectiveTo && plan.effectiveFrom > plan.effectiveTo) {
    errors.push(
      issue("V-06", "Effective from must be on or before effective to.", "error", "Restrictions"),
    );
  }

  if (plan.category === "seasonal" && (!plan.effectiveFrom || !plan.effectiveTo)) {
    errors.push(
      issue("V-07", "Seasonal plans require effective from and to dates.", "error", "Restrictions"),
    );
  }

  if (plan.category === "package" && !plan.packageId) {
    errors.push(issue("V-08", "Package plans must link to a package.", "error", "Room & meal"));
  }

  if (plan.pricingMode === "absolute" && (plan.baseRate == null || plan.baseRate <= 0)) {
    errors.push(
      issue("V-12", "Absolute pricing requires a base rate greater than zero.", "error", "Pricing"),
    );
  }

  if (
    plan.category === "corporate" &&
    (!plan.corporateAccountIds || plan.corporateAccountIds.length === 0)
  ) {
    warnings.push(
      issue(
        "V-09",
        "Corporate plan has no linked corporate accounts — publish is allowed with audit.",
        "warning",
        "General",
      ),
    );
  }

  const meal = ctx.mealPlans.find((item) => item.code === plan.defaultMealPlanCode);
  if (meal && meal.status === "Inactive") {
    warnings.push(issue("V-10", `Meal plan ${meal.code} is inactive.`, "warning", "Room & meal"));
  }

  if (plan.syncStatus === "not_synced") {
    warnings.push(
      issue(
        "V-11",
        "No OTA mapping sync yet — publish is allowed; map in Channel Manager.",
        "warning",
        "Channels",
      ),
    );
  }

  return {
    errors,
    warnings,
    canPublish: errors.length === 0,
  };
}

export function countBlockingValidationIssues(
  plan: RatePlan,
  ctx: RatePlanValidationContext,
): number {
  return validateRatePlan(plan, ctx).errors.length;
}
