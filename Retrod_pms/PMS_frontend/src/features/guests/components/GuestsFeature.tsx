import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, Button, KpiCard } from "@/components/ui/Primitives";
import { useGuestsQuery } from "@/services/mock/queries";
import { GuestsList } from "./GuestsList";
import { GuestCrmPanel } from "./GuestCrmPanel";
import { type Guest } from "@/types/pms";

export function GuestsFeature() {
  const { data: guests = [] } = useGuestsQuery();

  const [selectedGuestName, setSelectedGuestName] = useState<string | null>(null);
  const selectedGuest: Guest | null =
    guests.find((g) => g.name === selectedGuestName) ?? guests[0] ?? null;

  const kpis = useMemo(() => {
    const repeat = guests.filter((g) => g.visits > 1).length;
    const loyalty = guests.filter((g) => g.tier === "Platinum" || g.tier === "Gold").length;
    const npsAvg =
      guests.filter((g) => g.nps != null).reduce((a, g) => a + (g.nps ?? 0), 0) /
      Math.max(1, guests.filter((g) => g.nps != null).length);
    return { repeat, loyalty, npsAvg: Math.round(npsAvg) };
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Guests"
        title="Guest Profiles"
        description="A CRM-grade view of every guest who has stayed with us."
      />
      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total guests"
            value={guests.length > 0 ? String(guests.length) : "3,142"}
            delta="6 in workspace"
            deltaTone="neutral"
            accent="brand"
          />
          <KpiCard label="Repeat guests" value={String(kpis.repeat)} accent="success" />
          <KpiCard label="Loyalty members" value={String(kpis.loyalty)} accent="info" />
          <KpiCard label="Guest satisfaction" value={`NPS ${kpis.npsAvg}`} accent="success" />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          <GuestsList
            guests={guests}
            selectedName={selectedGuest?.name}
            onSelectGuest={(g) => setSelectedGuestName(g.name)}
          />
          {selectedGuest ? (
            <GuestCrmPanel guest={selectedGuest} />
          ) : (
            <div className="rounded-lg border border-border bg-surface p-5 text-[13px] text-text-secondary">
              No guest profiles available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default GuestsFeature;
