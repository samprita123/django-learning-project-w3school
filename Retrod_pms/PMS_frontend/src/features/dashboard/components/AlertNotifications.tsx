import { Crown, Clock, Wrench, Bell, ArrowRight, AlertTriangle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Primitives";
import { useDashboardAlertsQuery } from "@/services/mock/queries";

export function AlertNotifications() {
  const { data: dashboardAlerts = [] } = useDashboardAlertsQuery();

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Alert Notifications"
        hint="Filtered to your role · GM"
        action={
          <button className="text-[12px] font-medium text-primary hover:text-primary-pressed">
            Mark all read
          </button>
        }
      />
      <ul className="divide-y divide-border-subtle">
        {dashboardAlerts.map((a) => {
          const Icon =
            a.tone === "brand"
              ? Crown
              : a.tone === "warning"
                ? Clock
                : a.tone === "error"
                  ? Wrench
                  : a.tone === "info"
                    ? Bell
                    : AlertTriangle;
          return (
            <li key={a.id} className="flex items-start gap-3 px-5 py-3 hover:bg-surface-2/40">
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                  a.tone === "brand"
                    ? "bg-primary-tint text-primary-pressed"
                    : a.tone === "warning"
                      ? "bg-[oklch(0.96_0.06_70)] text-[var(--color-warning)]"
                      : a.tone === "error"
                        ? "bg-[oklch(0.96_0.06_27)] text-[var(--color-error)]"
                        : "bg-[oklch(0.95_0.04_263)] text-[var(--color-info)]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="truncate text-[13px] font-medium text-text-primary">
                    {a.title}
                  </div>
                  <div className="font-mono text-[10px] text-text-disabled">{a.at}</div>
                </div>
                <div className="text-[11px] text-text-secondary">{a.body}</div>
              </div>
              <button className="shrink-0 text-text-disabled hover:text-text-primary">
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
