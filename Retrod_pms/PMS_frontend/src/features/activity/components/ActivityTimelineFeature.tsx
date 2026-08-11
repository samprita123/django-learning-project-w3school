import { PageHeader, Card, CardHeader, StatusBadge } from "@/components/ui/Primitives";
import {
  useActivityFeedQuery,
  useOtaSyncLogsQuery,
  useReservationsQuery,
} from "@/services/mock/queries";

export function ActivityTimelineFeature() {
  const { data: activityFeed = [] } = useActivityFeedQuery();
  const { data: syncLogs = [] } = useOtaSyncLogsQuery();
  const { data: reservations = [] } = useReservationsQuery();

  const events = [
    ...activityFeed.map((e, idx) => ({
      id: `act-${idx}`,
      time: e.time,
      domain: "Operations",
      text: e.text,
      tone: "info" as const,
    })),
    ...syncLogs.slice(0, 6).map((s) => ({
      id: s.id,
      time: s.at,
      domain: "Integrations",
      text: `${s.channel} · ${s.action} · ${s.status}`,
      tone:
        s.status === "Error"
          ? ("error" as const)
          : s.status === "Warning"
            ? ("warning" as const)
            : ("success" as const),
    })),
    ...reservations.slice(0, 6).map((r) => ({
      id: r.id,
      time: r.ci,
      domain: "Reservations",
      text: `${r.id} · ${r.guest} · ${r.status} · ${r.source}`,
      tone: "neutral" as const,
    })),
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Global"
        title="Activity Timeline"
        description="Unified operational timeline across reservations, integrations, and guest events."
      />

      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        <Card>
          <CardHeader title="Live event stream" hint={`${events.length} events`} />
          <div className="space-y-2 p-4 sm:p-5">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-2/20 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-[13px] text-text-primary">{event.text}</div>
                  <div className="text-[11px] text-text-disabled">{event.time}</div>
                </div>
                <StatusBadge tone={event.tone}>{event.domain}</StatusBadge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ActivityTimelineFeature;
