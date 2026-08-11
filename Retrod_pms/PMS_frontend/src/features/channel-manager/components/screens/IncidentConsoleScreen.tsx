import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BellRing } from "lucide-react";
import { Button, Card, CardHeader, KpiCard, StatusBadge } from "@/components/ui/Primitives";
import { ChannelManagerShell } from "../ChannelManagerShell";
import { useOtaSyncLogsQuery } from "@/services/mock/queries";
import { SyncJobTable, type SyncJobRow } from "../SyncJobTable";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function IncidentConsoleScreen() {
  const { data: logs = [] } = useOtaSyncLogsQuery();
  const { logAuditEvent } = useAuth();
  const [selectedOwner, setSelectedOwner] = useState<"All" | "Ops" | "Revenue">("All");
  const [incidentOwners, setIncidentOwners] = useState<Record<string, "Ops" | "Revenue">>({});
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const incidents: SyncJobRow[] = useMemo(
    () =>
      logs
        .filter((log) => log.status === "Error" || log.status === "Warning")
        .map((log) => ({
          ...log,
          type: "Channel Incident",
          records: 1,
          owner: incidentOwners[log.id] ?? (log.status === "Error" ? "Ops" : "Revenue"),
          sla: log.status === "Error" ? "30m" : "120m",
          message:
            log.status === "Error"
              ? "Channel operation failed. Escalate to on-call engineer."
              : "Warning detected. Review parity impact.",
        })),
    [incidentOwners, logs],
  );

  const visibleIncidents =
    selectedOwner === "All" ? incidents : incidents.filter((i) => i.owner === selectedOwner);

  const parseSlaMinutes = (sla: string | undefined) => {
    if (!sla) return 0;
    if (sla.endsWith("m")) return Number(sla.replace("m", "")) || 0;
    if (sla.endsWith("h")) return (Number(sla.replace("h", "")) || 0) * 60;
    return 0;
  };

  const toEpochFromAt = (at: string) => {
    const parts = at.split(" ");
    const dayPart = Number(parts[0]);
    const monthPart = parts[1];
    const timePart = parts[2];
    const [hour, minute] = timePart.split(":").map(Number);
    const year = new Date().getFullYear();
    const monthMap: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };
    const month = monthMap[monthPart] ?? new Date().getMonth();
    return new Date(year, month, dayPart, hour, minute, 0, 0).getTime();
  };

  const withLiveSla = visibleIncidents.map((incident) => {
    const startedAt = toEpochFromAt(incident.at);
    const slaMinutes = parseSlaMinutes(incident.sla);
    const breachAt = startedAt + slaMinutes * 60_000;
    const remainingMs = breachAt - currentTime;
    const isBreached = remainingMs <= 0;
    const remainingText = isBreached
      ? `Breached ${Math.abs(Math.floor(remainingMs / 60_000))}m ago`
      : `${Math.floor(remainingMs / 60_000)}m left`;
    return {
      ...incident,
      status: isBreached ? "Error" : incident.status,
      sla: remainingText,
      message: isBreached
        ? "SLA breached. Immediate escalation required."
        : `${incident.message ?? "Incident in progress."} SLA ${remainingText}.`,
    };
  });

  const slaBreaches = withLiveSla.filter((i) => i.sla?.startsWith("Breached")).length;

  const handleEscalate = (row: SyncJobRow) => {
    logAuditEvent("OTA incident escalated", row.id, `Escalated to ${row.owner}. ${row.sla}.`);
    toast.success(`Escalated ${row.id} to ${row.owner} on-call queue.`);
  };

  const transferOwner = (row: SyncJobRow) => {
    const nextOwner = row.owner === "Ops" ? "Revenue" : "Ops";
    setIncidentOwners((prev) => ({ ...prev, [row.id]: nextOwner }));
    logAuditEvent(
      "OTA incident reassigned",
      row.id,
      `Transferred ${row.id} from ${row.owner} to ${nextOwner}.`,
    );
    toast.success(`${row.id} moved to ${nextOwner} ownership.`);
  };

  return (
    <ChannelManagerShell
      title="OTA Incident Console"
      description="Monitor failed channel operations, ownership, and SLA risks."
      actions={
        <Button size="sm" variant="outline">
          <BellRing className="h-3.5 w-3.5" />
          Notify on-call
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Open incidents" value={String(incidents.length)} accent="error" />
        <KpiCard
          label="Critical (Error)"
          value={String(incidents.filter((i) => i.status === "Error").length)}
          accent="error"
        />
        <KpiCard
          label="Warnings"
          value={String(incidents.filter((i) => i.status === "Warning").length)}
          accent="warning"
        />
        <KpiCard
          label="SLA breaches"
          value={String(slaBreaches)}
          accent={slaBreaches ? "error" : "info"}
        />
      </div>

      <Card>
        <CardHeader title="Incident queue" hint="Owner + SLA aware handling" />
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-4 py-3 sm:px-5">
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value as "All" | "Ops" | "Revenue")}
            className="h-8 rounded-md border border-border bg-surface px-2 text-[12px]"
          >
            <option value="All">All owners</option>
            <option value="Ops">Ops</option>
            <option value="Revenue">Revenue</option>
          </select>
          <StatusBadge tone={slaBreaches ? "error" : "warning"}>
            <AlertCircle className="h-3 w-3" />
            {slaBreaches ? "SLA breached incidents present" : "Escalate if SLA at risk"}
          </StatusBadge>
        </div>
        <SyncJobTable
          rows={withLiveSla}
          onAction={handleEscalate}
          actionLabel="Escalate"
          renderActions={(row) => (
            <Button variant="ghost" size="sm" onClick={() => transferOwner(row)}>
              Transfer
            </Button>
          )}
        />
      </Card>
    </ChannelManagerShell>
  );
}

export default IncidentConsoleScreen;
