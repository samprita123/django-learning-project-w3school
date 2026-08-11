import { useMemo, useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { Card, CardHeader, KpiCard, StatusBadge } from "@/components/ui/Primitives";
import { suClient } from "@/services/su/client";
import type { SuChannel } from "@/types/channel-manager";
import { ChannelManagerShell } from "../ChannelManagerShell";
import { useSuData } from "../../hooks/useSuData";
import { ChannelFilterToolbar, fmtINR, LoadingBlock, ErrorBlock } from "../shared";

export function OtaRevenueScreen() {
  const { data, loading, error, reload } = useSuData(() => suClient.getRevenue());
  const [channel, setChannel] = useState<SuChannel | "All">("All");

  const filtered = useMemo(
    () => (channel === "All" ? (data ?? []) : (data ?? []).filter((r) => r.channel === channel)),
    [data, channel],
  );

  const totals = useMemo(() => {
    const rows = filtered;
    return {
      bookings: rows.reduce((a, r) => a + r.bookings, 0),
      revenue: rows.reduce((a, r) => a + r.revenue, 0),
      commission: rows.reduce((a, r) => a + r.commission, 0),
      net: rows.reduce((a, r) => a + r.netRevenue, 0),
    };
  }, [filtered]);

  return (
    <ChannelManagerShell
      title="OTA Revenue Dashboard"
      description="Channel contribution, ADR, commission impact, and net revenue from OTA distribution."
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard
              label="Bookings · MTD"
              value={String(totals.bookings)}
              delta="↑ 18% vs LM"
              accent="info"
            />
            <KpiCard label="Gross revenue" value={fmtINR(totals.revenue)} accent="brand" />
            <KpiCard label="Commission" value={fmtINR(totals.commission)} accent="warning" />
            <KpiCard label="Net revenue" value={fmtINR(totals.net)} accent="success" />
          </div>

          <ChannelFilterToolbar channel={channel} onChannel={setChannel} />

          <Card>
            <CardHeader title="Channel revenue breakdown" hint="Month to date · SU synced" />
            <div className="table-scroll-shadow overflow-x-auto">
              <table className="w-full min-w-[800px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    {[
                      "Channel",
                      "Bookings",
                      "Revenue",
                      "ADR",
                      "Commission",
                      "Net revenue",
                      "Share",
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
                  {filtered.map((r) => (
                    <tr
                      key={r.channel}
                      className="border-b border-border-subtle hover:bg-surface-2/30"
                    >
                      <td className="px-4 py-3 font-medium">{r.channel}</td>
                      <td className="px-4 py-3 font-mono">{r.bookings}</td>
                      <td className="px-4 py-3 font-mono">{fmtINR(r.revenue)}</td>
                      <td className="px-4 py-3 font-mono">₹{r.adr.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 font-mono text-[var(--color-warning)]">
                        {fmtINR(r.commission)}
                      </td>
                      <td className="px-4 py-3 font-mono text-primary-pressed">
                        {fmtINR(r.netRevenue)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 max-w-[80px] rounded-full bg-surface-2">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${r.share}%` }}
                            />
                          </div>
                          <span className="font-mono text-[12px]">{r.share}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-[13px] font-medium text-text-primary">
                <TrendingUp className="h-4 w-4 text-primary" />
                Top performer
              </div>
              <p className="mt-2 text-[24px] font-semibold text-text-primary">Booking.com</p>
              <p className="text-[12px] text-text-secondary">34.5% revenue share · highest ADR</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-[13px] font-medium text-text-primary">
                <BarChart3 className="h-4 w-4 text-primary" />
                Commission efficiency
              </div>
              <p className="mt-2 text-[24px] font-semibold text-text-primary">14.2%</p>
              <p className="text-[12px] text-text-secondary">Blended commission across all OTAs</p>
            </Card>
          </div>
        </>
      )}
    </ChannelManagerShell>
  );
}

export function AnalyticsScreen() {
  const { data, loading, error, reload } = useSuData(() => suClient.getAnalytics());
  const [channel, setChannel] = useState<SuChannel | "All">("All");

  const filtered = useMemo(
    () => (channel === "All" ? (data ?? []) : (data ?? []).filter((r) => r.channel === channel)),
    [data, channel],
  );

  return (
    <ChannelManagerShell
      title="Channel Performance Analytics"
      description="Conversion, impressions, cancellation rates, and booking lead time by OTA channel."
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard
              label="Avg conversion"
              value={`${(filtered.reduce((a, r) => a + r.conversion, 0) / filtered.length).toFixed(1)}%`}
              accent="brand"
            />
            <KpiCard
              label="Total impressions"
              value={`${Math.round(filtered.reduce((a, r) => a + r.impressions, 0) / 1000)}k`}
              accent="info"
            />
            <KpiCard
              label="Avg cancellation"
              value={`${(filtered.reduce((a, r) => a + r.cancellationRate, 0) / filtered.length).toFixed(1)}%`}
              accent="warning"
            />
            <KpiCard
              label="Avg lead time"
              value={`${Math.round(filtered.reduce((a, r) => a + r.avgLeadTime, 0) / filtered.length)}d`}
              accent="success"
            />
          </div>

          <ChannelFilterToolbar channel={channel} onChannel={setChannel} />

          <Card>
            <CardHeader title="Channel analytics" hint="Performance metrics · last 30 days" />
            <div className="table-scroll-shadow overflow-x-auto">
              <table className="w-full min-w-[800px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    {[
                      "Channel",
                      "Impressions",
                      "Conversion",
                      "Bookings",
                      "Revenue",
                      "Cancel rate",
                      "Lead time",
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
                  {filtered.map((r) => (
                    <tr
                      key={r.channel}
                      className="border-b border-border-subtle hover:bg-surface-2/30"
                    >
                      <td className="px-4 py-3 font-medium">{r.channel}</td>
                      <td className="px-4 py-3 font-mono">
                        {r.impressions.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={r.conversion >= 2.5 ? "success" : "warning"}>
                          {r.conversion}%
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 font-mono">{r.bookings}</td>
                      <td className="px-4 py-3 font-mono">{fmtINR(r.revenue)}</td>
                      <td className="px-4 py-3 font-mono">{r.cancellationRate}%</td>
                      <td className="px-4 py-3 font-mono">{r.avgLeadTime} days</td>
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
