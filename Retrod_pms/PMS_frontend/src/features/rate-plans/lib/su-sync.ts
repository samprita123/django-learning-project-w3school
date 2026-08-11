import { ROOM_TYPE_OPTIONS } from "@/features/rate-plans/lib/constants";
import { suClient } from "@/services/su/client";
import { updateSuRatePlanSyncJob, upsertSuRatePlanDefinition } from "@/services/su/rate-plan-store";
import type { SuRatePlanDefinition } from "@/types/channel-manager";
import type { RatePlan } from "@/types/pms";

export function ratePlanToSuDefinition(plan: RatePlan): SuRatePlanDefinition {
  const roomTypeCodes = plan.roomTypeIds
    .map((id) => ROOM_TYPE_OPTIONS.find((room) => room.id === id)?.code)
    .filter((code) => !!code) as string[];

  return {
    externalRatePlanCode: plan.externalRatePlanCode,
    name: plan.name,
    category: plan.category,
    status: plan.status === "Active" ? "active" : plan.status === "Draft" ? "draft" : "inactive",
    currency: plan.currency,
    pricingMode: plan.pricingMode,
    baseRate: plan.baseRate,
    discountPercent: plan.discountPercent,
    minLos: plan.minLos,
    maxLos: plan.maxLos,
    cancelPolicyCode: plan.cancelPolicyCode,
    defaultMealPlanCode: plan.defaultMealPlanCode,
    roomTypeCodes,
    effectiveFrom: plan.effectiveFrom,
    effectiveTo: plan.effectiveTo,
    propertyId: plan.propertyId,
  };
}

export type SuRatePlanSyncOutcome = {
  jobId: string;
  source: "su-api" | "mock";
};

export async function pushRatePlanToSu(plan: RatePlan): Promise<SuRatePlanSyncOutcome> {
  const definition = ratePlanToSuDefinition(plan);
  upsertSuRatePlanDefinition(definition);

  const existing = await suClient.getRatePlanDefinition(plan.externalRatePlanCode);
  if (existing.data) {
    await suClient.updateRatePlanDefinition(plan.externalRatePlanCode, definition);
  } else {
    await suClient.createRatePlanDefinition(definition);
  }

  const syncRes = await suClient.syncRatePlans([plan.externalRatePlanCode]);
  return { jobId: syncRes.data.id, source: syncRes.meta.source };
}

export async function queueRatePlanSuSync(plan: RatePlan): Promise<SuRatePlanSyncOutcome> {
  const definition = ratePlanToSuDefinition(plan);
  upsertSuRatePlanDefinition(definition);
  const syncRes = await suClient.syncRatePlans([plan.externalRatePlanCode]);
  return { jobId: syncRes.data.id, source: syncRes.meta.source };
}

export function simulateSuSyncJobCompletion(
  jobId: string,
  onComplete: (success: boolean) => void,
  delayMs = 1400,
) {
  updateSuRatePlanSyncJob(jobId, { status: "in_progress" });
  window.setTimeout(() => {
    const success = Math.random() > 0.08;
    updateSuRatePlanSyncJob(jobId, {
      status: success ? "success" : "error",
      completedAt: new Date().toISOString(),
      message: success
        ? "Rate plan pushed to SU channel manager."
        : "SU sync failed — retry from Rate Plans.",
    });
    onComplete(success);
  }, delayMs);
}
