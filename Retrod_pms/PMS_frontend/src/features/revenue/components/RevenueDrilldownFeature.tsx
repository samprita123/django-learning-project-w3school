import { BarChart3, Download, SlidersHorizontal } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  KpiCard,
  PageHeader,
  StatusBadge,
} from "@/components/ui/Primitives";

const adrBySegment = [
  { segment: "Leisure", channel: "Direct", adr: 12840, compSet: 12100, trend: "+6.1%" },
  { segment: "Leisure", channel: "OTA", adr: 11720, compSet: 11390, trend: "+2.9%" },
  { segment: "Corporate", channel: "Direct", adr: 10980, compSet: 10620, trend: "+3.4%" },
  { segment: "Corporate", channel: "GDS", adr: 10250, compSet: 10480, trend: "-2.2%" },
  { segment: "Groups", channel: "Agency", adr: 9180, compSet: 9340, trend: "-1.7%" },
];

const revparBySegment = [
  { segment: "Leisure", occupancy: 0.84, adr: 12490, revpar: 10492, benchmark: 9720 },
  { segment: "Corporate", occupancy: 0.78, adr: 10610, revpar: 8276, benchmark: 7920 },
  { segment: "Groups", occupancy: 0.72, adr: 9260, revpar: 6667, benchmark: 6840 },
  { segment: "Wholesale", occupancy: 0.68, adr: 8420, revpar: 5726, benchmark: 5900 },
];

function formatInr(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function RevenueDrilldownFeature() {
  const strongestRevpar = [...revparBySegment].sort((a, b) => b.revpar - a.revpar)[0];
  const weakestRevpar = [...revparBySegment].sort((a, b) => a.revpar - b.revpar)[0];

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Revenue Drilldown Suite"
        description="ADR by segment and channel, RevPAR decomposition, and benchmark variance."
        actions={
          <>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </Button>
            <Button size="sm">
              <Download className="h-3.5 w-3.5" />
              Export snapshot
            </Button>
          </>
        }
      />

      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="Weighted ADR"
            value={formatInr(11420)}
            delta="+4.7% vs last week"
            accent="success"
          />
          <KpiCard
            label="Weighted RevPAR"
            value={formatInr(8290)}
            delta="+5.3% vs STLY"
            accent="success"
          />
          <KpiCard
            label="Best segment"
            value={strongestRevpar.segment}
            delta={formatInr(strongestRevpar.revpar)}
            accent="info"
          />
          <KpiCard
            label="Watch segment"
            value={weakestRevpar.segment}
            delta={formatInr(weakestRevpar.revpar)}
            accent="warning"
          />
        </div>

        <Card>
          <CardHeader title="ADR by segment and channel" hint="Compare realized ADR vs comp set" />
          <div className="table-scroll-shadow overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["Segment", "Channel", "ADR", "Comp Set", "Variance", "Trend"].map((h) => (
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
                {adrBySegment.map((row) => {
                  const variance = row.adr - row.compSet;
                  const varianceTone = variance >= 0 ? "success" : "warning";
                  return (
                    <tr
                      key={`${row.segment}-${row.channel}`}
                      className="border-b border-border-subtle hover:bg-surface-2/30"
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">{row.segment}</td>
                      <td className="px-4 py-3 text-text-secondary">{row.channel}</td>
                      <td className="px-4 py-3 font-mono">{formatInr(row.adr)}</td>
                      <td className="px-4 py-3 font-mono text-text-secondary">
                        {formatInr(row.compSet)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={varianceTone}>
                          {variance >= 0 ? "+" : ""}
                          {formatInr(variance)}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{row.trend}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="RevPAR decomposition and benchmark"
            hint="Occupancy x ADR with gap-to-benchmark view"
          />
          <div className="space-y-3 p-4 sm:p-5">
            {revparBySegment.map((row) => {
              const benchmarkGap = row.revpar - row.benchmark;
              const progress = Math.min(
                100,
                Math.round((row.revpar / Math.max(row.benchmark, 1)) * 100),
              );
              return (
                <div
                  key={row.segment}
                  className="rounded-md border border-border-subtle bg-surface-2/20 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[13px] font-medium text-text-primary">{row.segment}</div>
                    <div className="flex items-center gap-2 text-[12px]">
                      <StatusBadge tone={benchmarkGap >= 0 ? "success" : "warning"}>
                        {benchmarkGap >= 0 ? "+" : ""}
                        {formatInr(benchmarkGap)} vs benchmark
                      </StatusBadge>
                      <span className="font-mono text-text-secondary">
                        Occ {(row.occupancy * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded bg-surface">
                    <div
                      className={benchmarkGap >= 0 ? "h-full bg-success" : "h-full bg-warning"}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-[12px] text-text-secondary">
                    <span className="font-mono">ADR {formatInr(row.adr)}</span>
                    <span className="font-mono">RevPAR {formatInr(row.revpar)}</span>
                    <span className="font-mono">Benchmark {formatInr(row.benchmark)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="rounded-lg border border-border bg-surface p-4 shadow-e1">
          <div className="flex items-center gap-2 text-[13px] font-medium text-text-primary">
            <BarChart3 className="h-4 w-4 text-primary" />
            Scenario notes
          </div>
          <p className="mt-2 text-[12px] text-text-secondary">
            Corporate + Groups are currently below benchmark. Recommended next step is a weekday
            corporate package test with controlled ADR floor, while maintaining leisure weekend
            uplift.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RevenueDrilldownFeature;
