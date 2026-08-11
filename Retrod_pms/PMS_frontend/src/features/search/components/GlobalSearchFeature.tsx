import { useMemo, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { PageHeader, Card, CardHeader, StatusBadge } from "@/components/ui/Primitives";
import {
  useGuestsQuery,
  useReservationsQuery,
  useActivityFeedQuery,
} from "@/services/mock/queries";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { buildSearchIndex } from "@/features/search/lib/search-index";

export function GlobalSearchFeature() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const href = useRouterState({ select: (s) => s.location.href });
  const { users } = useAuth();
  const { data: guests = [] } = useGuestsQuery();
  const { data: reservations = [] } = useReservationsQuery();
  const { data: activityFeed = [] } = useActivityFeedQuery();
  const data = useMemo(
    () => buildSearchIndex({ guests, reservations, activityFeed, users }),
    [activityFeed, guests, reservations, users],
  );
  const urlTerm = useMemo(
    () => new URL(href, "https://retrod.local").searchParams.get("q") ?? "",
    [href],
  );
  const [query, setQuery] = useState(urlTerm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => `${row.type} ${row.label} ${row.ref}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div>
      <PageHeader
        eyebrow="Global"
        title="Global Search"
        description="Search guests, reservations, channels, tasks, and CRM entities."
      />
      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        <Card>
          <CardHeader
            title="Search query"
            hint={pathname === "/search" ? "Unified entity lookup" : undefined}
          />
          <div className="p-4 sm:p-5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by guest, reservation ID, lead, task, or channel log..."
              className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Results" hint={`${filtered.length} matches`} />
          <div className="divide-y divide-border-subtle">
            {filtered.map((row) => (
              <a
                key={`${row.type}-${row.ref}`}
                href={row.route}
                className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-surface-2/40 sm:px-5"
              >
                <div>
                  <div className="text-[13px] font-medium text-text-primary">{row.label}</div>
                  <div className="text-[11px] text-text-secondary">
                    {row.ref} · Navigate to {row.route}
                  </div>
                </div>
                <StatusBadge tone="info">{row.type}</StatusBadge>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default GlobalSearchFeature;
