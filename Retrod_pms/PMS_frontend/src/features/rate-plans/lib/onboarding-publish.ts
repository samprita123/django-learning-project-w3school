import type { OnboardingState, RatePlanConfig } from "@/lib/onboarding-store";
import { ROOM_TYPE_OPTIONS } from "@/features/rate-plans/lib/constants";
import { fetchRatePlans, saveRatePlans } from "@/services/mock/data-layer";
import type { RatePlan, RatePlanCategory } from "@/types/pms";

const ONBOARDING_CATEGORY_MAP: Record<RatePlanConfig["category"], RatePlanCategory> = {
  flexible: "bar",
  non_refundable: "non_refundable",
  corporate: "corporate",
  government: "corporate",
  weekend: "promotional",
  early_bird: "promotional",
  long_stay: "promotional",
  member: "member",
  promotional: "promotional",
};

const POLICY_BY_CATEGORY: Record<RatePlanConfig["category"], string> = {
  flexible: "policy-flex",
  non_refundable: "policy-nr",
  corporate: "policy-corp",
  government: "policy-corp",
  weekend: "policy-flex",
  early_bird: "policy-nr",
  long_stay: "policy-flex",
  member: "policy-flex",
  promotional: "policy-flex",
};

const CANCEL_CODE_BY_CATEGORY: Record<RatePlanConfig["category"], string> = {
  flexible: "FLEX-24H",
  non_refundable: "NRF-STRICT",
  corporate: "CORP-SAME-DAY",
  government: "CORP-SAME-DAY",
  weekend: "FLEX-24H",
  early_bird: "NRF-STRICT",
  long_stay: "FLEX-48H",
  member: "FLEX-24H",
  promotional: "FLEX-24H",
};

function toExternalCode(cfg: RatePlanConfig): string {
  if (cfg.category === "flexible" && cfg.discountPercent === 0) return "BAR-FLEX";
  const slug = cfg.name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 16);
  return slug || `PLAN-${cfg.id.slice(-4).toUpperCase()}`;
}

function resolveRoomTypeIds(state: OnboardingState): string[] {
  const ids = state.roomTypes
    .map((room) => {
      const exact = ROOM_TYPE_OPTIONS.find(
        (item) => item.name.toLowerCase() === room.name.toLowerCase(),
      );
      if (exact) return exact.id;
      if (room.name.toLowerCase().includes("deluxe") && room.name.toLowerCase().includes("king")) {
        return "rt-deluxe-king";
      }
      if (room.name.toLowerCase().includes("suite")) return "rt-premier-suite";
      return undefined;
    })
    .filter((id) => !!id) as string[];

  return ids.length > 0 ? [...new Set(ids)] : ["rt-deluxe-king"];
}

function onboardingPlanToRatePlan(
  cfg: RatePlanConfig,
  state: OnboardingState,
  roomTypeIds: string[],
): RatePlan {
  const category = ONBOARDING_CATEGORY_MAP[cfg.category];
  const defaultMeal = state.mealPlans.find((meal) => meal.active)?.code ?? "EP";
  const isBarAnchor = category === "bar" && cfg.discountPercent === 0;

  return {
    id: `onb-${cfg.id}`,
    externalRatePlanCode: toExternalCode(cfg),
    name: cfg.name,
    description: cfg.cancellationPolicy,
    benefits: [],
    category,
    policyId: POLICY_BY_CATEGORY[cfg.category],
    cancelPolicyCode: CANCEL_CODE_BY_CATEGORY[cfg.category],
    discountPercent: cfg.discountPercent,
    pricingMode: cfg.discountPercent > 0 ? "relative_to_bar" : "absolute",
    baseRate: isBarAnchor ? (state.roomTypes[0]?.baseRate ?? 8500) : undefined,
    currency: state.profile.currency || "INR",
    status: cfg.active ? "Active" : "Draft",
    version: 1,
    minLos: cfg.minStay,
    maxLos: cfg.maxStay,
    roomTypeIds,
    defaultMealPlanCode: defaultMeal,
    corporateAccountIds: category === "corporate" ? ["corp-tcs", "corp-infosys"] : undefined,
    isBarAnchor,
    syncStatus: "not_synced",
    propertyId: "PROP-1",
    tenantId: "TEN-1",
    bookingsMtd: 0,
  };
}

export async function publishOnboardingToRatePlans(state: OnboardingState): Promise<RatePlan[]> {
  const existing = await fetchRatePlans();
  const roomTypeIds = resolveRoomTypeIds(state);
  const published = state.ratePlans
    .filter((plan) => plan.active)
    .map((cfg) => onboardingPlanToRatePlan(cfg, state, roomTypeIds));

  const withoutOnboarding = existing.filter((plan) => !plan.id.startsWith("onb-"));
  let merged = [...withoutOnboarding, ...published];

  const barId = published.find((plan) => plan.isBarAnchor)?.id;
  if (barId) {
    merged = merged.map((plan) => (plan.id === barId ? plan : { ...plan, isBarAnchor: false }));
  }

  await saveRatePlans(merged);
  return merged;
}

export function onboardingRatePlanReadiness(state: OnboardingState): {
  activeCount: number;
  hasBar: boolean;
  hasRooms: boolean;
} {
  const active = state.ratePlans.filter((plan) => plan.active);
  const hasBar = active.some(
    (plan) =>
      (plan.category === "flexible" && plan.discountPercent === 0) ||
      plan.name.toLowerCase().includes("bar"),
  );
  const hasRooms = state.roomTypes.length > 0 && active.length > 0;
  return { activeCount: active.length, hasBar, hasRooms };
}
