import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader, KpiCard, Button, StatusBadge } from "@/components/ui/Primitives";
import { useInventoryUnitsQuery } from "@/hooks/useInventory";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const cardBg = (s: string) =>
  ({
    Ready: "border-l-[var(--color-success)] bg-[oklch(0.985_0.025_152)]",
    Cleaning: "border-l-[var(--color-warning)] bg-[oklch(0.985_0.03_70)]",
    Dirty: "border-l-[var(--color-error)] bg-[oklch(0.985_0.03_27)]",
    OOO: "border-l-text-disabled bg-surface-2",
    Inspected: "border-l-[var(--color-info)] bg-[oklch(0.985_0.025_263)]",
  })[s] ?? "border-l-border bg-surface";

export function HousekeepingMobileFeature() {
  const { data: units = [] } = useInventoryUnitsQuery();
  
  const housekeepingRooms = useMemo(() => {
    return units.map(unit => {
      let status = "Ready";
      if (unit.housekeeping_status === "clean") status = "Ready";
      else if (unit.housekeeping_status === "dirty") status = "Dirty";
      else if (unit.housekeeping_status === "cleaning") status = "Cleaning";
      else if (unit.housekeeping_status === "inspected") status = "Inspected";

      if (unit.maintenance_status === "out_of_order" || unit.maintenance_status === "out_of_service") {
        status = "OOO";
      }

      return {
        id: unit.id,
        num: unit.name || "N/A",
        type: unit.inventory_unit_type || "Room",
        status: status as any,
        staff: "Unassigned",
      };
    });
  }, [units]);

  const [activeRoom, setActiveRoom] = useState<string>("");

  const assigned = housekeepingRooms.filter((r) => r.staff === "Priya" || r.staff === "Lakshmi");
  const myRooms = assigned.length ? assigned.slice(0, 8) : housekeepingRooms.slice(0, 8);
  const nextRoom = useMemo(
    () => myRooms.find((r) => r.status === "Dirty" || r.status === "Cleaning"),
    [myRooms],
  );

  const handleStartNextRoom = () => {
    if (!nextRoom) {
      toast.info("No pending rooms in your queue.");
      return;
    }
    setActiveRoom(nextRoom.num);
    toast.success(`Started room ${nextRoom.num} (${nextRoom.status}).`);
  };

  const handleRoomTap = (roomNum: string) => {
    setActiveRoom(roomNum);
    toast.message(`Opened room ${roomNum} task sheet.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-surface px-4">
        <Link to="/housekeeping" className="rounded-md p-2 text-text-secondary hover:bg-surface-2">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="text-[14px] font-semibold text-text-primary">My rooms</div>
          <div className="text-[11px] text-text-secondary">The Grand Palace · Floor 2</div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Assigned" value={String(myRooms.length)} accent="brand" />
          <KpiCard label="Completed" value="3" accent="success" />
        </div>

        <div className="space-y-3">
          {myRooms.map((r) => (
            <button
              key={r.num}
              type="button"
              onClick={() => handleRoomTap(r.num)}
              className={`flex w-full items-center justify-between rounded-lg border border-l-[4px] border-border p-4 text-left shadow-e1 ${cardBg(r.status)}`}
            >
              <div>
                <div className="font-mono text-[20px] font-semibold">{r.num}</div>
                <div className="text-[12px] text-text-secondary">{r.type}</div>
              </div>
              <StatusBadge
                tone={
                  r.status === "Dirty" ? "error" : r.status === "Cleaning" ? "warning" : "success"
                }
              >
                {activeRoom === r.num ? "In progress" : r.status}
              </StatusBadge>
            </button>
          ))}
        </div>

        <Button
          className="fixed bottom-6 left-4 right-4 h-12 justify-center shadow-e2"
          onClick={handleStartNextRoom}
        >
          Start next room
        </Button>
      </div>
    </div>
  );
}
export default HousekeepingMobileFeature;
