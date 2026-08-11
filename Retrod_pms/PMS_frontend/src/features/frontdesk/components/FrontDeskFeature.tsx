import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, KeyRound, MoveRight, Wrench, ArrowUpCircle, Headset } from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  StatusBadge,
  Button,
  KpiCard,
} from "@/components/ui/Primitives";
import { useArrivalsTodayQuery, useDeparturesTodayQuery } from "@/services/mock/queries";
import type { ComponentProps } from "react";
import { RoomGrid } from "./RoomGrid";
import { RoomMove } from "./RoomMove";
import { OOOManagement } from "./OOOManagement";
import { UpgradeRecs } from "./UpgradeRecs";
import { GuestServices } from "./GuestServices";

const floors = [1, 2, 3, 4];
const sample = (floor: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const num = `${floor}${(i + 1).toString().padStart(2, "0")}`;
    const statuses = ["Ready", "Occupied", "Dirty", "Ready", "Occupied", "Maintenance"];
    return { num, status: statuses[(floor + i) % statuses.length] };
  });

const colorFor = (s: string) =>
  (({
    Ready: "border-[var(--color-success)] bg-[oklch(0.96_0.04_152)] text-[var(--color-success)]",
    Occupied: "border-[var(--color-info)] bg-[oklch(0.95_0.04_263)] text-[var(--color-info)]",
    Dirty: "border-[var(--color-warning)] bg-[oklch(0.96_0.05_70)] text-[var(--color-warning)]",
    Maintenance: "border-border-strong bg-surface-2 text-text-secondary",
  })[s] as string) || "border-border bg-surface text-text-secondary";

type Tab = "checkin" | "move" | "ooo" | "services" | "upgrade";
type TabDef = { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> };
type BadgeTone = ComponentProps<typeof StatusBadge>["tone"];

export function FrontDeskFeature() {
  const { data: arrivalsToday = [] } = useArrivalsTodayQuery();
  const { data: departuresToday = [] } = useDeparturesTodayQuery();

  const [tab, setTab] = useState<Tab>("checkin");

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Front Desk"
        description="Built for speed. Complete any check-in in three clicks."
        actions={
          <Link to="/check-in">
            <Button size="sm">
              Open check-in wizard
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        }
      />

      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        {/* KPI strip */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard label="In House" value="84" accent="info" />
          <KpiCard label="Arrivals" value="24" accent="success" />
          <KpiCard label="Departures" value="18" accent="warning" />
          <KpiCard label="VIPs" value="6" accent="brand" />
          <KpiCard label="Pending key" value="3" accent="error" />
        </div>

        {/* Tabs */}
        <div className="w-full overflow-x-auto">
          <div className="flex min-w-max gap-1 rounded-md border border-border bg-surface p-1">
            {(
              [
                { id: "checkin", label: "Active check-in", icon: KeyRound },
                { id: "move", label: "Room move", icon: MoveRight },
                { id: "ooo", label: "Out of order", icon: Wrench },
                { id: "upgrade", label: "Upgrade", icon: ArrowUpCircle },
                { id: "services", label: "Guest services", icon: Headset },
              ] as TabDef[]
            ).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] font-medium transition ${
                    tab === t.id
                      ? "bg-foreground text-background"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {tab === "checkin" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[35%_1fr]">
            {/* Left queues */}
            <div className="space-y-4">
              <Card>
                <CardHeader title="Arrivals queue" hint="Sorted by ETA" />
                <ul className="divide-y divide-border-subtle">
                  {arrivalsToday.map((r, i) => (
                    <li
                      key={r.id}
                      className={`flex items-center gap-3 px-4 py-3 transition ${i === 0 ? "bg-primary-tint/40" : ""}`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                        {r.guest
                          .split(" ")
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium text-text-primary">
                          {r.guest}
                        </div>
                        <div className="text-[11px] text-text-secondary">
                          {r.id} · {r.room} · {r.nights}N
                        </div>
                      </div>
                      <StatusBadge
                        tone={(r.status === "Confirmed" ? "success" : "warning") as BadgeTone}
                      >
                        {r.status}
                      </StatusBadge>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <CardHeader title="Departures queue" />
                <ul className="divide-y divide-border-subtle">
                  {departuresToday
                    .concat(departuresToday)
                    .slice(0, 4)
                    .map((r, i) => (
                      <li key={i} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <div className="text-[13px] font-medium text-text-primary">{r.guest}</div>
                          <div className="text-[11px] text-text-secondary">
                            Room {r.room} · 11:00
                          </div>
                        </div>
                        <span className="font-mono text-[12px]">
                          {r.balance ? (
                            <span className="text-[var(--color-error)]">
                              ₹{r.balance.toLocaleString()}
                            </span>
                          ) : (
                            "Settled"
                          )}
                        </span>
                      </li>
                    ))}
                </ul>
              </Card>
            </div>

            {/* Right: room grid */}
            <RoomGrid floors={floors} sample={sample} colorFor={colorFor} />
          </div>
        )}

        {tab === "move" && <RoomMove />}

        {tab === "ooo" && <OOOManagement />}

        {tab === "upgrade" && <UpgradeRecs />}

        {tab === "services" && <GuestServices />}
      </div>
    </div>
  );
}
export default FrontDeskFeature;
