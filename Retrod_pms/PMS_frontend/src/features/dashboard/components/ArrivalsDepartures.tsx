import { Link } from "@tanstack/react-router";
import { Crown, AlertTriangle } from "lucide-react";
import { Card, CardHeader, StatusBadge } from "@/components/ui/Primitives";
import { useArrivalsTodayQuery, useDeparturesTodayQuery } from "@/services/mock/queries";

export function ArrivalsDepartures() {
  const { data: arrivalsToday = [] } = useArrivalsTodayQuery();
  const { data: departuresToday = [] } = useDeparturesTodayQuery();

  return (
    <Card>
      <CardHeader
        title="Arrivals · Departures"
        hint={`${arrivalsToday.length} arr · ${departuresToday.length} dep`}
        action={
          <Link
            to="/front-desk"
            className="text-[12px] font-medium text-primary hover:text-primary-pressed"
          >
            Open Front Desk →
          </Link>
        }
      />
      <div className="grid grid-cols-2 divide-x divide-border-subtle">
        <div>
          <div className="border-b border-border-subtle bg-surface-2/40 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Arrivals · 24
          </div>
          <ul className="divide-y divide-border-subtle">
            {arrivalsToday.slice(0, 4).map((r) => (
              <li key={r.id} className="flex items-center gap-2 px-3 py-2.5">
                {r.guest === "Sophie Laurent" || r.id === "RES-2042" ? (
                  <Crown className="h-3 w-3 shrink-0 text-gold" />
                ) : (
                  <span className="h-3 w-3" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium text-text-primary">
                    {r.guest}
                  </div>
                  <div className="text-[10px] text-text-secondary">
                    {r.room} · {r.type}
                  </div>
                </div>
                <StatusBadge tone={r.status === "Confirmed" ? "success" : "warning"}>
                  {r.status}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="border-b border-border-subtle bg-surface-2/40 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            Departures · 18
          </div>
          <ul className="divide-y divide-border-subtle">
            {departuresToday
              .concat(departuresToday)
              .slice(0, 4)
              .map((r, i) => (
                <li key={i} className="flex items-center gap-2 px-3 py-2.5">
                  {r.balance > 0 ? (
                    <AlertTriangle className="h-3 w-3 shrink-0 text-[var(--color-warning)]" />
                  ) : (
                    <span className="h-3 w-3" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-medium text-text-primary">
                      {r.guest}
                    </div>
                    <div className="text-[10px] text-text-secondary">{r.room} · 11:00</div>
                  </div>
                  <span
                    className={`font-mono text-[11px] ${
                      r.balance ? "text-[var(--color-error)]" : "text-text-disabled"
                    }`}
                  >
                    {r.balance ? `₹${r.balance.toLocaleString()}` : "Settled"}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
