import { useEffect, useMemo, useState } from "react";
import { PageHeader, Card, CardHeader, Button, StatusBadge } from "@/components/ui/Primitives";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

const notifications = [
  {
    id: "NT-9001",
    title: "Channel sync failed · Booking.com",
    detail: "Inventory push failed for Deluxe King. Retry recommended.",
    severity: "High",
    time: "2 min ago",
    owner: "Ops",
  },
  {
    id: "NT-9002",
    title: "High demand signal detected",
    detail: "AI recommends +8% uplift for weekend leisure segment.",
    severity: "Medium",
    time: "11 min ago",
    owner: "Revenue",
  },
  {
    id: "NT-9003",
    title: "New onboarding invite pending",
    detail: "2 staff invitations are pending acceptance.",
    severity: "Low",
    time: "35 min ago",
    owner: "Admin",
  },
];

const toneBySeverity: Record<string, "error" | "warning" | "info"> = {
  High: "error",
  Medium: "warning",
  Low: "info",
};

export function NotificationCenterFeature() {
  const LS_ACK_KEY = "retrod:notifications:ack:v1";
  const [ackIds, setAckIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_ACK_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setAckIds(parsed);
    } catch {
      /* ignore storage parse */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_ACK_KEY, JSON.stringify(ackIds));
  }, [ackIds]);

  const active = useMemo(() => notifications.filter((n) => !ackIds.includes(n.id)), [ackIds]);

  return (
    <div>
      <PageHeader
        eyebrow="Global"
        title="Notification Center"
        description="Operational alerts, tasks, and product signals in one inbox."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAckIds(notifications.map((n) => n.id));
              toast.success("All notifications marked as read.");
            }}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        }
      />
      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        <Card>
          <CardHeader title="Active alerts" hint={`${active.length} unread`} />
          <div className="divide-y divide-border-subtle">
            {active.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-surface-2 p-1.5">
                    <Bell className="h-3.5 w-3.5 text-text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-text-primary">{item.title}</div>
                    <div className="mt-0.5 text-[12px] text-text-secondary">{item.detail}</div>
                    <div className="mt-1 text-[11px] text-text-disabled">
                      {item.id} · Owner: {item.owner}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge tone={toneBySeverity[item.severity] ?? "info"}>
                    {item.severity}
                  </StatusBadge>
                  <span className="text-[11px] text-text-disabled">{item.time}</span>
                  <button
                    onClick={() => {
                      setAckIds((prev) => [...prev, item.id]);
                      toast.success(`${item.id} acknowledged.`);
                    }}
                    className="rounded-md border border-border px-2 py-1 text-[11px] text-text-secondary transition hover:bg-surface-2 hover:text-text-primary"
                  >
                    Acknowledge
                  </button>
                  <a
                    href={
                      item.owner === "Ops"
                        ? "/pms-integrations"
                        : item.owner === "Revenue"
                          ? "/revenue"
                          : "/staff"
                    }
                    className="rounded-md border border-border px-2 py-1 text-[11px] text-primary transition hover:bg-primary-tint"
                  >
                    Open
                  </a>
                </div>
              </div>
            ))}
            {active.length === 0 && (
              <div className="px-4 py-6 text-[12px] text-text-secondary sm:px-5">
                No active notifications. You are all caught up.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default NotificationCenterFeature;
