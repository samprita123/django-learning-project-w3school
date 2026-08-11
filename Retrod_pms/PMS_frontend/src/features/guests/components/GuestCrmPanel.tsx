import { useState } from "react";
import { Card, CardHeader, Button, StatusBadge } from "@/components/ui/Primitives";
import { type Guest } from "@/types/pms";

type Tab = "profile" | "stays" | "notes";

export function GuestCrmPanel({ guest }: { guest: Guest }) {
  const [tab, setTab] = useState<Tab>("profile");
  const avatarInitials = guest.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  return (
    <Card>
      <CardHeader title={guest.name} hint={`${guest.tier} · ${guest.visits} stays`} />
      <div className="border-b border-border-subtle px-2">
        <div className="flex gap-1 p-1">
          {(
            [
              { id: "profile" as const, label: "Profile" },
              { id: "stays" as const, label: "Stays" },
              { id: "notes" as const, label: "Notes" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded px-3 py-1.5 text-[12px] font-medium transition ${
                tab === t.id
                  ? "bg-foreground text-background"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {tab === "profile" && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-[18px] font-semibold text-primary-foreground">
                {avatarInitials}
              </div>
              <div>
                <div className="font-display text-[18px] font-semibold text-text-primary">
                  {guest.name}
                </div>
                <div className="text-[12px] text-text-secondary">{guest.country}</div>
                {guest.email && (
                  <div className="text-[12px] text-text-secondary">{guest.email}</div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 text-[12px] sm:grid-cols-2">
              <Stat label="Lifetime spend" value={`₹${guest.ltv.toLocaleString()}`} />
              <Stat label="NPS" value={guest.nps != null ? String(guest.nps) : "—"} />
              <Stat label="Visits" value={String(guest.visits)} />
              <Stat label="Tier" value={guest.tier} />
            </div>
            {(guest.tags?.length ?? 0) > 0 && (
              <div>
                <div className="label-uppercase mb-2">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {guest.tags!.map((p) => (
                    <StatusBadge key={p} tone="brand">
                      {p}
                    </StatusBadge>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="label-uppercase mb-2">Preferences</div>
              <div className="flex flex-wrap gap-1.5">
                {["High floor", "Pillow menu", "Late checkout"].map((p) => (
                  <span
                    key={p}
                    className="rounded-sm border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-secondary"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "stays" && (
          <div className="space-y-2">
            {(guest.stays?.length ?? 0) === 0 ? (
              <p className="text-[13px] text-text-secondary">No stay history recorded.</p>
            ) : (
              guest.stays!.map((s) => (
                <div key={s.id} className="rounded-md border border-border-subtle p-3 text-[12px]">
                  <div className="font-mono text-[11px] text-text-secondary">{s.id}</div>
                  <div className="mt-1 font-medium text-text-primary">Room {s.room}</div>
                  <div className="text-text-secondary">
                    {s.ci} → {s.co}
                  </div>
                  <div className="mt-1 font-mono text-text-primary">
                    ₹{s.amount.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "notes" && (
          <div className="space-y-2">
            {(guest.notes?.length ?? 0) === 0 ? (
              <p className="text-[13px] text-text-secondary">No notes yet.</p>
            ) : (
              guest.notes!.map((n, i) => (
                <div
                  key={i}
                  className="rounded-md border border-border-subtle bg-surface-2/40 p-3 text-[12px]"
                >
                  <div className="text-[10px] text-text-secondary">
                    {n.at} · {n.author}
                  </div>
                  <p className="mt-1 text-text-primary">{n.text}</p>
                </div>
              ))
            )}
            <Button variant="outline" size="sm" className="w-full justify-center">
              Add note
            </Button>
          </div>
        )}

        <Button className="w-full justify-center">Open full profile</Button>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-2/40 p-2.5">
      <div className="label-uppercase text-[9px]">{label}</div>
      <div className="mt-0.5 text-[14px] font-semibold text-text-primary">{value}</div>
    </div>
  );
}
