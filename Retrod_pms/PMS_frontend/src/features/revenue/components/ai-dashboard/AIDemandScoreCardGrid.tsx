import type { AIDemandSnapshot } from "@/types/pms";
import { KpiCard } from "@/components/ui/Primitives";

export function AIDemandScoreCardGrid({ snapshot }: { snapshot: AIDemandSnapshot }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4 xl:grid-cols-6">
      <KpiCard label="Demand Score" value={String(snapshot.demandScore)} accent="brand" />
      <KpiCard label="Occupancy %" value={`${snapshot.occupancyPct}%`} accent="info" />
      <KpiCard label="Available Rooms" value={String(snapshot.availableRooms)} accent="warning" />
      <KpiCard
        label="Current ADR"
        value={`₹${snapshot.currentAdr.toLocaleString()}`}
        accent="info"
      />
      <KpiCard
        label="Recommended ADR"
        value={`₹${snapshot.recommendedAdr.toLocaleString()}`}
        accent="success"
      />
      <KpiCard label="Revenue Lift %" value={`+${snapshot.revenueLiftPct}%`} accent="success" />
    </div>
  );
}

export default AIDemandScoreCardGrid;
