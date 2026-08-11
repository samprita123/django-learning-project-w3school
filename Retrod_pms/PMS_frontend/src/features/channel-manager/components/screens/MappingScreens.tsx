import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Link2, RefreshCcw } from "lucide-react";
import { Button, Card, CardHeader, KpiCard, StatusBadge } from "@/components/ui/Primitives";
import { MEAL_PLAN_LABEL } from "@/features/rate-plans/lib/constants";
import { suClient } from "@/services/su/client";
import { useRatePlansQuery } from "@/services/mock/queries";
import { SU_CHANNELS, type SuChannel, type SuRatePlanMapping } from "@/types/channel-manager";
import { ChannelManagerShell } from "../ChannelManagerShell";
import { useSuData } from "../../hooks/useSuData";
import { ChannelFilterToolbar, LoadingBlock, ErrorBlock, mapTone } from "../shared";

function resolveMapping(
  planCode: string,
  planName: string,
  mappings: SuRatePlanMapping[],
): SuRatePlanMapping | undefined {
  return mappings.find(
    (row) =>
      row.pmsRatePlanCode.toUpperCase() === planCode.toUpperCase() || row.pmsRatePlan === planName,
  );
}

function unmappedChannelsRow(planCode: string, mealLabel: string): SuRatePlanMapping {
  return {
    pmsRatePlan: planCode,
    pmsRatePlanCode: planCode,
    mealPlan: mealLabel,
    channels: Object.fromEntries(
      SU_CHANNELS.map((ch) => [ch, { otaRatePlanId: "—", status: "Unmapped" as const }]),
    ) as SuRatePlanMapping["channels"],
  };
}

export function RoomMappingScreen() {
  const { data, loading, error, reload } = useSuData(() => suClient.getRoomMappings());
  const [channel, setChannel] = useState<SuChannel | "All">("All");
  const [syncing, setSyncing] = useState(false);

  const stats = useMemo(() => {
    if (!data) return { mapped: 0, mismatch: 0, unmapped: 0 };
    let mapped = 0;
    let mismatch = 0;
    let unmapped = 0;
    for (const row of data) {
      for (const ch of SU_CHANNELS) {
        const s = row.channels[ch].status;
        if (s === "Mapped") mapped++;
        else if (s === "Mismatch") mismatch++;
        else unmapped++;
      }
    }
    return { mapped, mismatch, unmapped };
  }, [data]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await suClient.triggerSync({ types: ["Content"] });
      reload();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ChannelManagerShell
      title="Room Mapping"
      description="Map PMS room types to OTA room codes across all distribution channels."
      actions={
        <Button size="sm">
          <Link2 className="h-3.5 w-3.5" />
          Auto-map
        </Button>
      }
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Mapped" value={String(stats.mapped)} accent="success" />
            <KpiCard label="Mismatch" value={String(stats.mismatch)} accent="warning" />
            <KpiCard label="Unmapped" value={String(stats.unmapped)} accent="error" />
            <KpiCard label="PMS room types" value={String(data.length)} accent="info" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ChannelFilterToolbar
              channel={channel}
              onChannel={setChannel}
              onSync={handleSync}
              syncing={syncing}
            />
            <Button variant="outline" size="sm" onClick={reload}>
              <RefreshCcw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>

          <Card>
            <CardHeader title="Room type mapping grid" hint="PMS ↔ OTA room codes" />
            <div className="table-scroll-shadow overflow-x-auto">
              <table className="w-full min-w-[1100px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    <th className="sticky left-0 bg-surface-2/95 px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                      PMS room type
                    </th>
                    {(channel === "All" ? SU_CHANNELS : [channel]).map((ch) => (
                      <th
                        key={ch}
                        className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                      >
                        {ch}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr
                      key={row.pmsRoomCode}
                      className="border-b border-border-subtle hover:bg-surface-2/30"
                    >
                      <td className="sticky left-0 bg-surface px-4 py-3">
                        <p className="font-medium">{row.pmsRoomType}</p>
                        <p className="font-mono text-[11px] text-text-secondary">
                          {row.pmsRoomCode}
                        </p>
                      </td>
                      {(channel === "All" ? SU_CHANNELS : [channel]).map((ch) => {
                        const m = row.channels[ch];
                        return (
                          <td key={ch} className="px-3 py-3">
                            <StatusBadge tone={mapTone(m.status)}>{m.status}</StatusBadge>
                            <p className="mt-1 font-mono text-[11px] text-text-secondary">
                              {m.otaRoomId}
                            </p>
                            <p className="text-[11px] text-text-secondary">{m.otaRoomName}</p>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </ChannelManagerShell>
  );
}

export function RatePlanMappingScreen() {
  const {
    data: mappings,
    loading,
    error,
    reload,
  } = useSuData(() => suClient.getRatePlanMappings());
  const { data: ratePlans = [] } = useRatePlansQuery();
  const [channel, setChannel] = useState<SuChannel | "All">("All");

  const rows = useMemo(() => {
    const catalog = ratePlans.filter((plan) => plan.status !== "Inactive");
    const mappingList = mappings ?? [];

    return catalog.map((plan) => {
      const mealLabel = MEAL_PLAN_LABEL[plan.defaultMealPlanCode] ?? plan.defaultMealPlanCode;
      const mapping =
        resolveMapping(plan.externalRatePlanCode, plan.name, mappingList) ??
        unmappedChannelsRow(plan.externalRatePlanCode, mealLabel);

      const hasOtaMapping = mappingList.some(
        (row) =>
          row.pmsRatePlanCode.toUpperCase() === plan.externalRatePlanCode.toUpperCase() ||
          row.pmsRatePlan === plan.name,
      );

      return {
        plan,
        mapping,
        mealLabel,
        hasOtaMapping,
      };
    });
  }, [ratePlans, mappings]);

  const stats = useMemo(() => {
    let pending = 0;
    let unmappedPlans = 0;
    for (const row of rows) {
      if (!row.hasOtaMapping) unmappedPlans += 1;
      for (const ch of SU_CHANNELS) {
        if (row.mapping.channels[ch].status === "Pending") pending += 1;
      }
    }
    return { pending, unmappedPlans };
  }, [rows]);

  return (
    <ChannelManagerShell
      title="Rate Plan Mapping"
      description="Align canonical PMS rate plan codes from Rate Plans with OTA rate plan IDs."
      actions={
        <Link
          to="/rate-plans"
          className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-[12px] font-medium text-primary hover:bg-surface-2"
        >
          Open Rate Plans
        </Link>
      }
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {mappings && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Canonical plans" value={String(rows.length)} accent="brand" />
            <KpiCard label="SU mapping rows" value={String(mappings.length)} accent="info" />
            <KpiCard
              label="Plans without SU row"
              value={String(stats.unmappedPlans)}
              accent="warning"
            />
            <KpiCard label="Pending channel cells" value={String(stats.pending)} accent="warning" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ChannelFilterToolbar channel={channel} onChannel={setChannel} />
            <Button variant="outline" size="sm" onClick={reload}>
              <RefreshCcw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>

          <Card>
            <CardHeader
              title="Rate plan mapping"
              hint="Codes from /rate-plans · BAR-FLEX · CORP-NEG · NRF-STD"
            />
            <div className="table-scroll-shadow overflow-x-auto">
              <table className="w-full min-w-[960px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                      PMS code
                    </th>
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                      Rate plan
                    </th>
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                      Meal plan
                    </th>
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                      Catalog
                    </th>
                    {(channel === "All" ? SU_CHANNELS : [channel]).map((ch) => (
                      <th
                        key={ch}
                        className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                      >
                        {ch}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ plan, mapping, mealLabel, hasOtaMapping }) => (
                    <tr
                      key={plan.id}
                      className="border-b border-border-subtle hover:bg-surface-2/30"
                    >
                      <td className="px-4 py-3 font-mono text-[12px]">
                        {plan.externalRatePlanCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-[11px] text-text-secondary">{mapping.pmsRatePlan}</div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{mealLabel}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          tone={
                            plan.syncStatus === "synced"
                              ? "success"
                              : plan.syncStatus === "pending"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {plan.syncStatus.replace("_", " ")}
                        </StatusBadge>
                        {!hasOtaMapping && (
                          <div className="mt-1 text-[11px] text-warning">No SU mapping row</div>
                        )}
                      </td>
                      {(channel === "All" ? SU_CHANNELS : [channel]).map((ch) => {
                        const m = mapping.channels[ch];
                        return (
                          <td key={ch} className="px-3 py-3">
                            <StatusBadge tone={mapTone(m.status)}>{m.status}</StatusBadge>
                            <p className="mt-1 font-mono text-[11px] text-text-secondary">
                              {m.otaRatePlanId}
                            </p>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </ChannelManagerShell>
  );
}
