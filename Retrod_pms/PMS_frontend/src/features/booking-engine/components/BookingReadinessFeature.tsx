import { ArrowRight, CheckCircle2, Gauge, TriangleAlert } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  KpiCard,
  PageHeader,
  StatusBadge,
} from "@/components/ui/Primitives";

const funnelSteps = [
  { step: "Search sessions", count: 4120, rate: 100 },
  { step: "Room availability viewed", count: 2670, rate: 64.8 },
  { step: "Rate plan selected", count: 1490, rate: 36.2 },
  { step: "Guest details entered", count: 890, rate: 21.6 },
  { step: "Payment completed", count: 640, rate: 15.5 },
];

const parityChecks = [
  { id: "PAR-01", check: "Room inventory parity", confidence: 96, status: "Healthy" },
  { id: "PAR-02", check: "Rate parity across OTA/direct", confidence: 91, status: "Healthy" },
  { id: "PAR-03", check: "Tax + fee parity", confidence: 84, status: "Watch" },
  { id: "PAR-04", check: "Promo applicability consistency", confidence: 78, status: "Watch" },
];

export function BookingReadinessFeature() {
  const confidence = Math.round(
    parityChecks.reduce((sum, row) => sum + row.confidence, 0) / Math.max(parityChecks.length, 1),
  );
  const unhealthy = parityChecks.filter((row) => row.status !== "Healthy").length;
  const completionRate = funnelSteps[funnelSteps.length - 1]?.rate ?? 0;

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Booking Readiness Dashboard"
        description="Monitor conversion funnel and parity confidence before traffic pushes."
        actions={
          <Button size="sm">
            <ArrowRight className="h-3.5 w-3.5" />
            Open booking engine
          </Button>
        }
      />

      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="Funnel completion"
            value={`${completionRate.toFixed(1)}%`}
            accent="info"
          />
          <KpiCard
            label="Parity confidence"
            value={`${confidence}%`}
            accent={confidence >= 85 ? "success" : "warning"}
          />
          <KpiCard
            label="Watch checks"
            value={String(unhealthy)}
            accent={unhealthy ? "warning" : "success"}
          />
          <KpiCard
            label="Readiness state"
            value={confidence >= 85 ? "Ready" : "Needs tuning"}
            accent={confidence >= 85 ? "success" : "warning"}
          />
        </div>

        <Card>
          <CardHeader title="Conversion funnel" hint="Direct booking path health" />
          <div className="space-y-2 p-4 sm:p-5">
            {funnelSteps.map((step, idx) => (
              <div
                key={step.step}
                className="rounded-md border border-border-subtle bg-surface-2/20 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[13px] font-medium text-text-primary">
                    {idx + 1}. {step.step}
                  </div>
                  <div className="text-[12px] font-mono text-text-secondary">
                    {step.count.toLocaleString("en-IN")} ({step.rate.toFixed(1)}%)
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded bg-surface">
                  <div className="h-full bg-primary" style={{ width: `${step.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Parity confidence checks"
            hint="Rate/inventory/offer consistency signals"
          />
          <div className="table-scroll-shadow overflow-x-auto">
            <table className="w-full min-w-[680px] text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["ID", "Check", "Confidence", "Status", "Action"].map((h) => (
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
                {parityChecks.map((row) => (
                  <tr key={row.id} className="border-b border-border-subtle hover:bg-surface-2/30">
                    <td className="px-4 py-3 font-mono text-[12px]">{row.id}</td>
                    <td className="px-4 py-3 text-text-primary">{row.check}</td>
                    <td className="px-4 py-3 font-mono">{row.confidence}%</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={row.status === "Healthy" ? "success" : "warning"}>
                        {row.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-primary">Investigate</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-4 shadow-e1">
            <div className="flex items-center gap-2 text-[13px] font-medium text-text-primary">
              <Gauge className="h-4 w-4 text-info" />
              Readiness recommendation
            </div>
            <p className="mt-2 text-[12px] text-text-secondary">
              Keep traffic budget steady. Improve promo parity before scaling campaign spend;
              estimated conversion lift opportunity is +1.2 to +1.8 percentage points.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4 shadow-e1">
            <div className="flex items-center gap-2 text-[13px] font-medium text-text-primary">
              {unhealthy ? (
                <TriangleAlert className="h-4 w-4 text-warning" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-success" />
              )}
              Deployment gate
            </div>
            <p className="mt-2 text-[12px] text-text-secondary">
              Gate opens when all parity checks remain above 85% confidence for 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingReadinessFeature;
