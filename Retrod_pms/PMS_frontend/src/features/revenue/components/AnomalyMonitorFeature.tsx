import { AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  KpiCard,
  PageHeader,
  StatusBadge,
} from "@/components/ui/Primitives";

const anomalies = [
  {
    id: "ANM-301",
    domain: "Sync",
    severity: "High",
    signal: "Booking.com room parity mismatch spike",
    confidence: 92,
    impact: "Potential oversell risk on Deluxe King inventory.",
    owner: "Ops",
  },
  {
    id: "ANM-302",
    domain: "Revenue",
    severity: "Medium",
    signal: "ADR drop for corporate weekday segment",
    confidence: 86,
    impact: "Estimated ₹1.8L downside over next 7 days if trend continues.",
    owner: "Revenue",
  },
  {
    id: "ANM-303",
    domain: "Sync",
    severity: "Medium",
    signal: "Retry volume above baseline for Agoda restrictions",
    confidence: 81,
    impact: "Channel latency likely to impact short lead-time reservations.",
    owner: "Ops",
  },
  {
    id: "ANM-304",
    domain: "Revenue",
    severity: "Low",
    signal: "RevPAR under-index in group segment",
    confidence: 74,
    impact: "Margin pressure; opportunity for controlled re-pricing.",
    owner: "Revenue",
  },
];

const playbooks = [
  { name: "Sync containment", trigger: "High sync anomalies", eta: "15 min", owner: "Ops on-call" },
  {
    name: "Revenue protection",
    trigger: "ADR/RevPAR drop > 5%",
    eta: "30 min",
    owner: "Revenue manager",
  },
  {
    name: "Escalation broadcast",
    trigger: "Cross-domain anomalies",
    eta: "10 min",
    owner: "Duty manager",
  },
];

export function AnomalyMonitorFeature() {
  const highCount = anomalies.filter((item) => item.severity === "High").length;
  const avgConfidence = Math.round(
    anomalies.reduce((sum, item) => sum + item.confidence, 0) / Math.max(anomalies.length, 1),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="AI Anomaly Monitor"
        description="Detect sync and revenue risk patterns early with guided response playbooks."
        actions={
          <Button size="sm" variant="outline">
            <Sparkles className="h-3.5 w-3.5" />
            Re-run detection
          </Button>
        }
      />

      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Active anomalies" value={String(anomalies.length)} accent="warning" />
          <KpiCard
            label="High severity"
            value={String(highCount)}
            accent={highCount ? "error" : "success"}
          />
          <KpiCard label="Avg confidence" value={`${avgConfidence}%`} accent="info" />
          <KpiCard label="Domains covered" value="Sync + Revenue" accent="brand" />
        </div>

        <Card>
          <CardHeader title="Detected anomalies" hint="Prioritized by severity and confidence" />
          <div className="space-y-3 p-4 sm:p-5">
            {anomalies.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-border-subtle bg-surface-2/20 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-[12px] text-text-secondary">{item.id}</div>
                    <StatusBadge
                      tone={
                        item.severity === "High"
                          ? "error"
                          : item.severity === "Medium"
                            ? "warning"
                            : "info"
                      }
                    >
                      {item.severity}
                    </StatusBadge>
                    <StatusBadge tone={item.domain === "Sync" ? "info" : "brand"}>
                      {item.domain}
                    </StatusBadge>
                  </div>
                  <div className="text-[12px] font-mono text-text-secondary">
                    {item.confidence}% confidence
                  </div>
                </div>
                <div className="mt-2 text-[13px] font-medium text-text-primary">{item.signal}</div>
                <p className="mt-1 text-[12px] text-text-secondary">{item.impact}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[12px] text-text-secondary">Owner: {item.owner}</span>
                  <button type="button" className="text-[12px] font-medium text-primary">
                    Trigger playbook
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Response playbooks" hint="Automated response templates" />
          <div className="table-scroll-shadow overflow-x-auto">
            <table className="w-full min-w-[620px] text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["Playbook", "Trigger", "ETA", "Owner", ""].map((h) => (
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
                {playbooks.map((row) => (
                  <tr
                    key={row.name}
                    className="border-b border-border-subtle hover:bg-surface-2/30"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">{row.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.trigger}</td>
                    <td className="px-4 py-3 font-mono">{row.eta}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.owner}</td>
                    <td className="px-4 py-3 text-[12px] text-primary">Run now</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="rounded-lg border border-border bg-surface p-4 shadow-e1">
          <div className="flex items-center gap-2 text-[13px] font-medium text-text-primary">
            {highCount ? (
              <ShieldAlert className="h-4 w-4 text-error" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-warning" />
            )}
            Risk posture
          </div>
          <p className="mt-2 text-[12px] text-text-secondary">
            Current posture is <strong>{highCount ? "Elevated" : "Watch"}</strong>. Keep sync
            incidents below 2 high-severity events and maintain revenue variance alerts under 3 per
            day.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AnomalyMonitorFeature;
