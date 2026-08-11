import type { OnboardingState } from "@/lib/onboarding-store";
import {
  fetchTaxAssignments,
  fetchTaxComponents,
  fetchTaxGroups,
  saveTaxAssignments,
  saveTaxComponents,
  saveTaxGroups,
} from "@/services/mock/data-layer";
import type { TaxComponent, TaxGroup } from "@/types/pms";

function upsertComponent(list: TaxComponent[], component: TaxComponent): TaxComponent[] {
  const idx = list.findIndex((item) => item.id === component.id);
  return idx >= 0 ? list.map((item, i) => (i === idx ? component : item)) : [...list, component];
}

export async function publishOnboardingToTaxes(state: OnboardingState): Promise<{
  components: TaxComponent[];
  groups: TaxGroup[];
}> {
  const existingComponents = await fetchTaxComponents();
  const existingGroups = await fetchTaxGroups();
  const existingAssignments = await fetchTaxAssignments();

  const gstHalf = state.tax.gst > 0 ? state.tax.gst / 2 : 9;
  const onboardingComponents: TaxComponent[] = [
    {
      id: "onb-cgst",
      code: "CGST-ONB",
      name: `CGST ${gstHalf}%`,
      type: "gst",
      ratePercent: gstHalf,
      calculationBase: "room_tariff",
      inclusive: false,
      status: "Active",
      jurisdiction: "intra_state",
      description: "Published from onboarding GST configuration.",
    },
    {
      id: "onb-sgst",
      code: "SGST-ONB",
      name: `SGST ${gstHalf}%`,
      type: "gst",
      ratePercent: gstHalf,
      calculationBase: "room_tariff",
      inclusive: false,
      status: "Active",
      jurisdiction: "intra_state",
      description: "Published from onboarding GST configuration.",
    },
    {
      id: "onb-city",
      code: "CITY-ONB",
      name: "City Tax",
      type: "city_tax",
      ratePercent: state.tax.cityTax,
      flatAmount: state.tax.cityTax > 0 ? undefined : 200,
      calculationBase: state.tax.cityTax > 0 ? "folio_subtotal" : "per_night",
      inclusive: false,
      status: "Active",
      description: "Published from onboarding city tax setting.",
    },
    {
      id: "onb-sc",
      code: "SC-ONB",
      name: "Service Charge",
      type: "service_charge",
      ratePercent: state.tax.serviceCharge,
      calculationBase: "folio_subtotal",
      inclusive: false,
      status: state.tax.serviceCharge > 0 ? "Active" : "Inactive",
      description: "Published from onboarding service charge setting.",
    },
    {
      id: "onb-tourism",
      code: "TOUR-ONB",
      name: "Tourism Tax",
      type: "tourism_tax",
      ratePercent: state.tax.luxuryTax > 0 ? state.tax.luxuryTax : 2,
      calculationBase: "room_tariff",
      inclusive: false,
      status: "Active",
      description: "Published from onboarding tourism / luxury levy setting.",
    },
  ];

  let mergedComponents = existingComponents.filter((c) => !c.id.startsWith("onb-"));
  for (const component of onboardingComponents) {
    mergedComponents = upsertComponent(mergedComponents, component);
  }

  const folioGroup: TaxGroup = {
    id: "onb-folio",
    code: "FOLIO-ONB",
    name: "Onboarding Folio Profile",
    componentIds: onboardingComponents.filter((c) => c.status === "Active").map((c) => c.id),
    status: "Active",
    description: "Default folio tax bundle from property onboarding.",
  };

  const mergedGroups = [...existingGroups.filter((g) => g.id !== "onb-folio"), folioGroup];

  const mergedAssignments = [
    ...existingAssignments.filter((a) => a.id !== "onb-folio-assign"),
    {
      id: "onb-folio-assign",
      targetType: "folio_default" as const,
      targetId: "default",
      targetLabel: "Default folio posting (onboarding)",
      taxGroupId: folioGroup.id,
    },
  ];

  await saveTaxComponents(mergedComponents);
  await saveTaxGroups(mergedGroups);
  await saveTaxAssignments(mergedAssignments);

  return { components: mergedComponents, groups: mergedGroups };
}

export function onboardingTaxReadiness(state: OnboardingState): {
  configured: boolean;
  summary: string;
} {
  const configured = state.tax.gst >= 0 && state.tax.serviceCharge >= 0 && state.tax.cityTax >= 0;
  const summary = `GST ${state.tax.gst}% · Service ${state.tax.serviceCharge}% · City ${state.tax.cityTax}%`;
  return { configured, summary };
}
