import { Link } from "@tanstack/react-router";
import { Wrench, ListTodo, MessageSquare, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, StatusBadge } from "@/components/ui/Primitives";
import {
  useWorkOrdersQuery,
  useOpsTasksQuery,
  useGuestServiceRequestsQuery,
} from "@/services/mock/queries";

export function OpsSummaryRow() {
  const { data: workOrders = [] } = useWorkOrdersQuery();
  const { data: opsTasks = [] } = useOpsTasksQuery();
  const { data: guestServiceRequests = [] } = useGuestServiceRequestsQuery();

  const openWo = workOrders.filter((w) => w.status !== "Resolved");
  const openTasks = opsTasks.filter((t) => t.status !== "Done");
  const openRequests = guestServiceRequests.filter((r) => r.status !== "Done");

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <OpsCard
        title="Maintenance"
        hint={`${openWo.length} open work orders`}
        to="/maintenance"
        icon={Wrench}
      >
        {openWo.slice(0, 3).map((w) => (
          <li
            key={w.id}
            className="flex items-center justify-between gap-2 border-b border-border-subtle py-2.5 last:border-0"
          >
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-text-primary">
                Room {w.room} · {w.title}
              </div>
              <div className="text-[11px] text-text-secondary">{w.id}</div>
            </div>
            <StatusBadge tone={w.priority === "Critical" ? "error" : "warning"}>
              {w.priority}
            </StatusBadge>
          </li>
        ))}
      </OpsCard>

      <OpsCard title="Tasks" hint={`${openTasks.length} open`} to="/tasks" icon={ListTodo}>
        {openTasks.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-2 border-b border-border-subtle py-2.5 last:border-0"
          >
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-text-primary">{t.title}</div>
              <div className="text-[11px] text-text-secondary">
                {t.department} · Due {t.due}
              </div>
            </div>
            <StatusBadge tone={t.priority === "High" ? "warning" : "neutral"}>
              {t.status}
            </StatusBadge>
          </li>
        ))}
      </OpsCard>

      <OpsCard
        title="Guest requests"
        hint={`${openRequests.length} active`}
        to="/guest-requests"
        icon={MessageSquare}
      >
        {openRequests.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-2 border-b border-border-subtle py-2.5 last:border-0"
          >
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-text-primary">
                {r.room} · {r.type}
              </div>
              <div className="text-[11px] text-text-secondary">{r.guest}</div>
            </div>
            <span className="shrink-0 text-[10px] text-text-secondary">{r.sla}</span>
          </li>
        ))}
      </OpsCard>
    </div>
  );
}

function OpsCard({
  title,
  hint,
  to,
  icon: Icon,
  children,
}: {
  title: string;
  hint: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader
        title={title}
        hint={hint}
        action={
          <Link
            to={to}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary-pressed"
          >
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        }
      />
      <ul className="px-4 pb-3">{children}</ul>
    </Card>
  );
}
