import type { FolioTaxBreakdown, FolioTaxLine, TaxComponent, TaxGroup } from "@/types/pms";

function componentAmount(component: TaxComponent, subtotal: number, nights = 1): number {
  if (component.status !== "Active") return 0;
  if (component.calculationBase === "per_night" && component.flatAmount != null) {
    return Math.round(component.flatAmount * nights);
  }
  if (component.calculationBase === "per_guest_night" && component.flatAmount != null) {
    return Math.round(component.flatAmount * nights);
  }
  return Math.round(subtotal * (component.ratePercent / 100));
}

export function calculateFolioTaxes(
  subtotal: number,
  components: TaxComponent[],
  group?: TaxGroup | null,
  nights = 1,
): FolioTaxBreakdown {
  const active = components.filter((c) => c.status === "Active" || (c as any).status === "active");
  let selected =
    group != null
      ? active.filter((c) => group.componentIds.includes(c.id))
      : active;

  const perNight = subtotal / Math.max(1, nights);

  // Dynamic tariff range filtering from database component properties
  const applicableComponents = selected.filter((c: any) => {
    const minVal = c.gstSlabMin != null ? Number(c.gstSlabMin) : (c.min_tariff != null ? Number(c.min_tariff) : null);
    const maxVal = c.gstSlabMax != null ? Number(c.gstSlabMax) : (c.max_tariff != null ? Number(c.max_tariff) : null);

    const minPass = minVal == null || perNight >= minVal;
    const maxPass = maxVal == null || maxVal === 0 || perNight <= maxVal;
    return minPass && maxPass;
  });

  const lines: FolioTaxLine[] = applicableComponents.map((component) => ({
    componentCode: component.code,
    componentName: component.name,
    type: component.type,
    ratePercent: component.ratePercent || 0,
    amount: componentAmount(component, subtotal, nights),
  }));

  const totalTax = lines.reduce((sum, line) => sum + line.amount, 0);
  return {
    subtotal,
    lines,
    totalTax,
    grandTotal: subtotal + totalTax,
  };
}

export function resolveDefaultTaxGroup(groups: TaxGroup[]): TaxGroup | undefined {
  return (
    groups.find((g) => g.code === "FOLIO-STD" && g.status === "Active") ??
    groups.find((g) => g.status === "Active")
  );
}
