import { Card, CardHeader, Button } from "@/components/ui/Primitives";
import { type Guest } from "@/types/pms";

interface GuestDetailsCardProps {
  guest: Guest;
}

export function GuestDetailsCard({ guest }: GuestDetailsCardProps) {
  const avatarInitials = guest.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  return (
    <Card>
      <CardHeader title={guest.name} hint={`${guest.tier} · ${guest.visits} stays`} />
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-[18px] font-semibold text-primary-foreground">
            {avatarInitials}
          </div>
          <div>
            <div className="font-display text-[18px] font-semibold text-text-primary">
              {guest.name}
            </div>
            <div className="text-[12px] text-text-secondary">{guest.country} · Returning guest</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <Stat label="Lifetime spend" value={`₹${guest.ltv.toLocaleString()}`} />
          <Stat
            label="Avg ADR"
            value={`₹${Math.round(guest.ltv / guest.visits).toLocaleString()}`}
          />
          <Stat label="Avg stay" value="3.2 nights" />
          <Stat label="Last stay" value="Mar 2026" />
        </div>
        <div>
          <div className="label-uppercase mb-2">Preferences</div>
          <div className="flex flex-wrap gap-1.5">
            {["High floor", "Pillow menu", "Late checkout", "Spa add-on"].map((p) => (
              <span
                key={p}
                className="rounded-sm border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-secondary"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
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
export default GuestDetailsCard;
