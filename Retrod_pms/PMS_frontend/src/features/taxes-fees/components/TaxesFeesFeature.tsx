import { useEffect, useMemo, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
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
import { TaxComponentEditorDrawer } from "@/features/taxes-fees/components/TaxComponentEditorDrawer";
import {
  CALCULATION_BASE_LABEL,
  TAX_COMPONENT_TYPE_LABEL,
} from "@/features/taxes-fees/lib/constants";
import { calculateFolioTaxes, resolveDefaultTaxGroup } from "@/features/taxes-fees/lib/calculation";
import { fetchApi } from "@/services/api/core";
import type { TaxComponent, TaxGroup } from "@/types/pms";

type Tab = "components" | "groups" | "preview";

export function TaxesFeesFeature() {
  const { can, logAuditEvent } = useAuth();
  const canManage = can("settings.manage");

  const [isLoading, setIsLoading] = useState(true);
  const [componentsList, setComponentsList] = useState<TaxComponent[]>([]);
  const [groupsList, setGroupsList] = useState<TaxGroup[]>([]);

  const [tab, setTab] = useState<Tab>("components");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [scopeFilter, setScopeFilter] = useState<string>("All");

  const [editorComponent, setEditorComponent] = useState<TaxComponent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewSubtotal, setPreviewSubtotal] = useState("52400");
  const [previewNights, setPreviewNights] = useState("2");

  const activePropertyId = useMemo(() => {
    return localStorage.getItem("retrod:active-property-id") || "";
  }, []);

  // Fetch taxes dynamically from backend Superadmin Taxes API (/api/superadmin-taxes/)
  const loadTaxData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi<any>("/api/superadmin-taxes/").catch(() => []);
      const sysList = Array.isArray(res) ? res : res?.results || [];

      const dynamicComponents: TaxComponent[] = sysList.map((t: any) => {
        const isGlobal = !t.tenant;
        const code = t.code || t.name?.toUpperCase().replace(/[^A-Z0-9]/g, "_") || "TAX";
        const nameLower = (t.name || "").toLowerCase();
        
        let componentType: TaxComponent["type"] = t.type as any || "gst";
        if (nameLower.includes("vat")) componentType = "vat";
        else if (nameLower.includes("city")) componentType = "city_tax";
        else if (nameLower.includes("service")) componentType = "service_charge";
        else if (nameLower.includes("tourism")) componentType = "tourism_tax";

        const rateVal = parseFloat(t.percentage ?? t.ratePercent ?? t.rate ?? 0);
        const flatVal = t.flat_amount != null ? parseFloat(t.flat_amount) : (t.flatAmount != null ? parseFloat(t.flatAmount) : (t.type === "fixed" ? parseFloat(t.rate || 0) : undefined));
        const minVal = t.min_tariff != null ? parseFloat(t.min_tariff) : (t.gstSlabMin != null ? parseFloat(t.gstSlabMin) : undefined);
        const maxVal = t.max_tariff != null ? parseFloat(t.max_tariff) : (t.gstSlabMax != null ? parseFloat(t.gstSlabMax) : undefined);
        const baseVal = t.calculation_base || t.calculationBase || (t.type === "fixed" ? "per_night" : "room_tariff");

        return {
          id: t.id,
          code: code,
          name: t.name,
          type: componentType,
          ratePercent: rateVal,
          flatAmount: flatVal,
          gstSlabMin: minVal,
          gstSlabMax: maxVal,
          calculationBase: baseVal,
          inclusive: Boolean(t.inclusive),
          status: (t.is_active === false || (t.status || "").toLowerCase() === "inactive") ? "Inactive" : "Active",
          scope: isGlobal ? "global" : "tenant",
          tenant: t.tenant || null,
          description: isGlobal ? "Superadmin platform tax rule." : "Tenant custom configured tax rule.",
        } as any;
      });

      setComponentsList(dynamicComponents);
      setGroupsList([]);
    } catch (err) {
      console.error("Failed to load backend tax data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTaxData();
  }, [activePropertyId]);

  const isGlobalTax = (c: TaxComponent) => {
    return (c as any).scope === "global" || !(c as any).tenant;
  };

  const defaultGroup = useMemo(() => resolveDefaultTaxGroup(groupsList), [groupsList]);
  const previewBreakdown = useMemo(() => {
    const sub = Number(previewSubtotal) || 0;
    const nights = Number(previewNights) || 1;
    return calculateFolioTaxes(sub, componentsList, defaultGroup, nights);
  }, [componentsList, defaultGroup, previewNights, previewSubtotal]);

  const kpis = useMemo(() => {
    const activeComponents = componentsList.filter((c) => c.status === "Active").length;
    const byType = {
      gst: componentsList.filter((c) => c.type === "gst").length,
      city: componentsList.filter((c) => c.type === "city_tax").length,
      service: componentsList.filter((c) => c.type === "service_charge").length,
      tourism: componentsList.filter((c) => c.type === "tourism_tax").length,
    };
    return { activeComponents, byType, groups: groupsList.filter((g) => g.status === "Active").length };
  }, [componentsList, groupsList]);

  const filteredComponents = useMemo(() => {
    return componentsList.filter((c) => {
      const matchType = typeFilter === "All" || c.type === typeFilter;
      const isGlobal = isGlobalTax(c);
      const matchScope =
        scopeFilter === "All" ||
        (scopeFilter === "Global" && isGlobal) ||
        (scopeFilter === "Tenant" && !isGlobal);
      return matchType && matchScope;
    });
  }, [componentsList, typeFilter, scopeFilter]);

  const openCreate = () => {
    setEditorComponent(null);
    setDrawerOpen(true);
  };

  const openEdit = (component: TaxComponent) => {
    setEditorComponent(component);
    setDrawerOpen(true);
  };

  const handleSaveComponent = async (updated: TaxComponent) => {
    const isEditingExistingGlobal = Boolean(editorComponent && isGlobalTax(editorComponent));
    if (isEditingExistingGlobal && !canManage) {
      toast.error("Superadmin Global Taxes are read-only for tenants.");
      return;
    }

    try {
      const activeTenantId = localStorage.getItem("retrod:active-tenant-id") || "";
      const isEdit = Boolean(editorComponent?.id);

      const payload: any = {
        code: updated.code || updated.name?.toUpperCase().replace(/[^A-Z0-9]/g, "_") || "TAX",
        name: updated.name,
        type: updated.type || "gst",
        rate: updated.flatAmount || updated.ratePercent,
        ratePercent: updated.ratePercent ?? 0,
        percentage: updated.ratePercent ?? 0,
        min_tariff: updated.gstSlabMin ?? null,
        max_tariff: updated.gstSlabMax ?? null,
        gstSlabMin: updated.gstSlabMin ?? null,
        gstSlabMax: updated.gstSlabMax ?? null,
        flat_amount: updated.flatAmount ?? null,
        flatAmount: updated.flatAmount ?? null,
        calculation_base: updated.calculationBase || "folio_subtotal",
        calculationBase: updated.calculationBase || "folio_subtotal",
        inclusive: Boolean(updated.inclusive),
        status: updated.status.toLowerCase(),
        is_active: updated.status.toLowerCase() === "active",
        tenant: activeTenantId || undefined,
      };

      if (isEdit && editorComponent?.id) {
        // Update existing tax component via PATCH
        await fetchApi<any>(`/api/superadmin-taxes/${editorComponent.id}/`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Tax Component updated successfully!");
      } else {
        // Create new tax component via POST
        await fetchApi<any>("/api/superadmin-taxes/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("New Custom Tax component created successfully!");
      }

      setDrawerOpen(false);
      loadTaxData();
    } catch (err: any) {
      toast.error("Failed to save tax component: " + (err.message || err));
    }
  };

  const toggleGroupStatus = (group: TaxGroup) => {
    const next = groupsList.map((g) =>
      g.id === group.id
        ? { ...g, status: g.status === "Active" ? ("Inactive" as const) : ("Active" as const) }
        : g
    );
    setGroupsList(next);
    toast.success(
      `Tax group ${group.code} ${group.status === "Active" ? "deactivated" : "activated"}`
    );
  };

  return (
    <GuardedRoute
      permission="billing.view"
      title="Taxes & Fees access required"
      description="You need billing view permission to manage tax components and groups."
    >
      <div>
        <PageHeader
          eyebrow="Commercial"
          title="Taxes & Fees"
          description="Superadmin global GST rules combined with tenant-specific custom taxes fetched dynamically from backend database."
          actions={
            <Button size="sm" onClick={openCreate} className="gap-1.5 bg-primary text-white hover:bg-primary/90 shadow-sm">
              <Plus className="h-4 w-4" />
              Create New Tax
            </Button>
          }
        />

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            <KpiCard
              label="Active components"
              value={String(kpis.activeComponents)}
              accent="brand"
            />
            <KpiCard label="GST profiles" value={String(kpis.byType.gst)} accent="info" />
            <KpiCard
              label="City / Tourism"
              value={String(kpis.byType.city + kpis.byType.tourism)}
              accent="warning"
            />
            <KpiCard label="Service charge" value={String(kpis.byType.service)} accent="success" />
            <KpiCard label="Tax groups" value={String(kpis.groups)} accent="info" />
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["components", "Tax components"],
                ["groups", "Tax groups"],
                ["preview", "Preview calculator"],
              ] as Array<[Tab, string]>
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-md border px-3 py-1.5 text-[12px] transition ${
                  tab === id
                    ? "border-primary bg-primary-tint/40 text-primary"
                    : "border-border-subtle bg-surface text-text-secondary hover:bg-surface-2/70"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "components" ? (
            <Card>
              <CardHeader
                title="Tax components"
                hint="Superadmin Global Taxes + Tenant Custom Taxes — Live Backend API"
                action={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadTaxData}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      {isLoading && <Loader2 className="h-3 w-3 animate-spin" />} Refresh
                    </button>
                    <Button size="sm" onClick={openCreate} className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Create New Tax
                    </Button>
                  </div>
                }
              />
              <div className="flex flex-wrap gap-3 border-b border-border px-5 pb-4">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] font-medium"
                >
                  <option value="All">All Types</option>
                  {Object.entries(TAX_COMPONENT_TYPE_LABEL).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>

                <select
                  value={scopeFilter}
                  onChange={(e) => setScopeFilter(e.target.value)}
                  className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] font-medium"
                >
                  <option value="All">All Sources (Global & Tenant)</option>
                  <option value="Global">Superadmin Global Taxes</option>
                  <option value="Tenant">Tenant Custom Taxes</option>
                </select>
              </div>

              {isLoading ? (
                <div className="p-12 text-center text-text-secondary flex justify-center items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading tax rules from backend database...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px] text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2/40 text-left">
                        {["Code", "Name", "Source Scope", "Type", "Rate / Amount", "Tariff Range (Slab)", "Base", "Inclusive", "Status", ""].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComponents.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-text-disabled">
                            No tax components found for selected filter.
                          </td>
                        </tr>
                      ) : (
                        filteredComponents.map((component) => {
                          const isGlobal = isGlobalTax(component);
                          const hasSlab = component.gstSlabMin != null || component.gstSlabMax != null;
                          return (
                            <tr
                              key={component.id}
                              className="border-b border-border-subtle hover:bg-surface-2/50"
                            >
                              <td className="px-4 py-3 font-mono text-[12px] font-semibold">{component.code}</td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-text-primary">{component.name}</div>
                                {component.description ? (
                                  <div className="text-[11px] text-text-secondary">
                                    {component.description}
                                  </div>
                                ) : null}
                              </td>
                              <td className="px-4 py-3">
                                {isGlobal ? (
                                  <StatusBadge tone="success">Global (Superadmin)</StatusBadge>
                                ) : (
                                  <StatusBadge tone="info">Tenant Custom</StatusBadge>
                                )}
                              </td>
                              <td className="px-4 py-3">{TAX_COMPONENT_TYPE_LABEL[component.type] || component.type}</td>
                              <td className="px-4 py-3 font-mono font-semibold">
                                {component.flatAmount != null
                                  ? `₹${component.flatAmount} (Fixed)`
                                  : `${component.ratePercent}%`}
                              </td>
                              <td className="px-4 py-3 font-mono text-[11px]">
                                {hasSlab ? (
                                  <span className="inline-flex items-center rounded border border-primary/30 bg-primary-tint/20 px-2 py-0.5 font-bold text-primary">
                                    ₹{(component.gstSlabMin ?? 0).toLocaleString()} – {component.gstSlabMax ? `₹${component.gstSlabMax.toLocaleString()}` : "Above"}
                                  </span>
                                ) : (
                                  <span className="text-text-disabled">All Tariffs</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-[12px] text-text-secondary">
                                {CALCULATION_BASE_LABEL[component.calculationBase]}
                              </td>
                              <td className="px-4 py-3">{component.inclusive ? "Yes" : "No"}</td>
                              <td className="px-4 py-3">
                                <StatusBadge tone={component.status === "Active" ? "success" : "neutral"}>
                                  {component.status}
                                </StatusBadge>
                              </td>
                              <td className="px-4 py-3">
                                <Button variant="ghost" size="sm" onClick={() => openEdit(component)}>
                                  {isGlobal ? "View" : canManage ? "Edit" : "View"}
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          ) : null}

          {tab === "groups" ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {groupsList.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-text-disabled border rounded-md">
                  No tax groups defined.
                </div>
              ) : (
                groupsList.map((group) => {
                  const memberNames = group.componentIds
                    .map((id) => componentsList.find((c) => c.id === id)?.code)
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <Card key={group.id} className="border-border-subtle">
                      <CardHeader title={group.name} hint={group.code} />
                      <div className="space-y-3 p-4 sm:p-5">
                        <p className="text-[12px] text-text-secondary">{group.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {group.componentIds.map((id) => {
                            const c = componentsList.find((item) => item.id === id);
                            if (!c) return null;
                            return (
                              <StatusBadge key={id} tone="info">
                                {c.code}
                              </StatusBadge>
                            );
                          })}
                        </div>
                        <div className="text-[11px] text-text-secondary">
                          Components: {memberNames || "—"}
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge tone={group.status === "Active" ? "success" : "neutral"}>
                            {group.status}
                          </StatusBadge>
                          {canManage ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleGroupStatus(group)}
                            >
                              {group.status === "Active" ? "Deactivate" : "Activate"}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          ) : null}

          {tab === "preview" ? (
            <Card>
              <CardHeader
                title="Folio tax preview"
                hint="Simulate GST and custom fee breakdown"
              />
              <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2">
                <div className="space-y-4">
                  <label className="block space-y-1">
                    <span className="text-[12px] font-medium text-text-secondary">Subtotal (₹)</span>
                    <input
                      type="number"
                      className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                      value={previewSubtotal}
                      onChange={(e) => setPreviewSubtotal(e.target.value)}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[12px] font-medium text-text-secondary">Room nights</span>
                    <input
                      type="number"
                      className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                      value={previewNights}
                      onChange={(e) => setPreviewNights(e.target.value)}
                    />
                  </label>
                </div>
                <div className="space-y-2 rounded-md border border-border bg-surface-2/40 p-4 text-[13px]">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal:</span>
                    <span className="font-mono text-text-primary">₹{Number(previewSubtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Tax amount:</span>
                    <span className="font-mono text-text-primary">
                      ₹{(previewBreakdown?.totalTax ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border-subtle pt-2 font-semibold">
                    <span>Grand total:</span>
                    <span className="font-mono text-primary">
                      ₹{(previewBreakdown?.grandTotal ?? Number(previewSubtotal || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}
        </div>

        <TaxComponentEditorDrawer
          open={drawerOpen}
          component={editorComponent}
          onClose={() => setDrawerOpen(false)}
          onSave={handleSaveComponent}
          readOnly={Boolean(editorComponent && isGlobalTax(editorComponent) && !canManage)}
        />
      </div>
    </GuardedRoute>
  );
}
