import { useMemo, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Filter, UserPlus, Smartphone } from "lucide-react";
import { PageHeader, Button, KpiCard } from "@/components/ui/Primitives";
import { useInventoryUnitsQuery, usePatchInventoryUnitMutation } from "@/hooks/useInventory";
import { toast } from "sonner";
import type { HousekeepingRoom } from "@/types/pms";
import { HousekeepingStatus } from "./HousekeepingStatus";
import { RoomCardGrid } from "./RoomCardGrid";
import { HousekeepingListView } from "./HousekeepingListView";
import { HousekeepingKanban } from "./HousekeepingKanban";
import { fetchApi } from "@/services/api/core";

type StatusTone = "success" | "warning" | "error" | "info" | "neutral" | "brand" | "dark";

const tone = (s: string): StatusTone =>
  (({
    clean: "success",
    dirty: "error",
    inspecting: "info",
  })[s] as StatusTone | undefined) ?? "neutral";

const cardBg = (s: string) =>
  (({
    clean: "border-l-[var(--color-success)] bg-[oklch(0.985_0.025_152)]",
    dirty: "border-l-[var(--color-error)] bg-[oklch(0.985_0.03_27)]",
    inspecting: "border-l-[var(--color-info)] bg-[oklch(0.985_0.025_263)]",
  })[s] as string) || "border-l-border bg-surface";

type View = "board" | "list" | "kanban";

export function HousekeepingFeature() {
  const { data: units = [] } = useInventoryUnitsQuery();
  const patchMutation = usePatchInventoryUnitMutation();
  const [staffUsers, setStaffUsers] = useState<any[]>([]);

  const housekeepingRooms = useMemo(() => {
    return units.map(unit => {
      let status = "Ready";
      if (unit.housekeeping_status === "clean") status = "clean";
      else if (unit.housekeeping_status === "dirty") status = "dirty";
      else if (unit.housekeeping_status === "inspecting") status = "inspecting";

      if (unit.maintenance_status === "out_of_order" || unit.maintenance_status === "out_of_service") {
        status = "OOO";
      }

      let staffName = "Unassigned";
      const staffId = (unit as any).assigned_staff || (unit as any).housekeeping_staff || (unit as any).assigned_to;
      if (staffId && staffUsers.length > 0) {
        const staff = staffUsers.find(u => u.id === staffId || u.user_id === staffId);
        if (staff) {
          staffName = staff.first_name ? `${staff.first_name} ${staff.last_name || ""}`.trim() : staff.username || staff.name || "Assigned";
        } else {
          staffName = "Assigned";
        }
      }

      return {
        id: unit.id,
        num: unit.name || "N/A",
        type: unit.inventory_unit_type || "Room",
        status: status as any,
        staff: staffName,
        floor: unit.floor || "Floor 1",
      };
    });
  }, [units, staffUsers]);

  const [view, setView] = useState<View>("board");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  useEffect(() => {
    fetchApi<any[]>("/api/users/")
      .then((data: any) => {
        if (Array.isArray(data)) {
          setStaffUsers(data);
        } else if (data && Array.isArray(data.results)) {
          setStaffUsers(data.results);
        }
      })
      .catch(err => console.error("Failed to fetch users:", err));
  }, []);

  const [staffName, setStaffName] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [staffOverrides, setStaffOverrides] = useState<Record<string, string>>({});
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const [selectedRoomNums, setSelectedRoomNums] = useState<string[]>([]);

  const effectiveRooms = useMemo(
    () =>
      housekeepingRooms.map((room) => ({
        ...room,
        staff: staffOverrides[room.num] ?? room.staff,
        status: (statusOverrides[room.num] as any) ?? room.status,
      }) as HousekeepingRoom),
    [housekeepingRooms, staffOverrides, statusOverrides],
  );

  const stats = useMemo(() => {
    const ready = effectiveRooms.filter((r) => r.status === "Ready" || (r.status as string) === "clean").length;
    const dirty = effectiveRooms.filter((r) => r.status === "Dirty" || (r.status as string) === "dirty").length;
    const inspected = effectiveRooms.filter((r) => r.status === "Inspected" || (r.status as string) === "inspecting").length;
    return { ready, dirty, inspected, total: effectiveRooms.length };
  }, [effectiveRooms]);

  const filtered = useMemo(
    () => {
      if (statusFilter === "All") return effectiveRooms;
      return effectiveRooms.filter((r) => {
        const s = r.status as string;
        if (statusFilter === "Ready") return s === "Ready" || s === "clean";
        if (statusFilter === "Dirty") return s === "Dirty" || s === "dirty";
        if (statusFilter === "Inspected") return s === "Inspected" || s === "inspecting";
        if (statusFilter === "Cleaning") return s === "Cleaning" || s === "cleaning";
        return s === statusFilter;
      });
    },
    [statusFilter, effectiveRooms],
  );

  const openAssignModalForRooms = (rooms: string[]) => {
    setSelectedRoomNums(rooms);
    setIsAssignOpen(true);
  };

  const handleHeaderAssign = () => {
    const targetRooms =
      filtered.filter((r) => r.status === "Dirty" || r.status === "Cleaning").map((r) => r.num) ||
      [];
    openAssignModalForRooms(targetRooms.slice(0, 8));
  };

  const handleQuickRoomUpdate = async (room: HousekeepingRoom) => {
    if (room.id) {
      try {
        const freshData = await fetchApi<any>(`/api/inventory/units/${room.id}`, { method: "GET" });
        console.log("Fetched fresh room data:", freshData);
        
        if (freshData.housekeeping_status) {
          setNewStatus(freshData.housekeeping_status);
        } else {
          setNewStatus("");
        }
        
        const staffId = freshData.assigned_staff || freshData.housekeeping_staff || freshData.assigned_to;
        if (staffId && staffUsers.length > 0) {
          const staff = staffUsers.find(u => u.id === staffId || u.user_id === staffId);
          if (staff) {
            setStaffName(staff.first_name ? `${staff.first_name} ${staff.last_name || ""}`.trim() : staff.username || staff.name || "");
          } else {
            setStaffName("");
          }
        } else {
          setStaffName("");
        }
      } catch (err) {
        console.error("Failed to fetch fresh room data", err);
        setNewStatus("");
        setStaffName("");
      }
    }
    openAssignModalForRooms([room.num]);
  };

  const toggleRoomSelection = (roomNum: string) => {
    setSelectedRoomNums((prev) =>
      prev.includes(roomNum) ? prev.filter((num) => num !== roomNum) : [...prev, roomNum],
    );
  };

  const handleAssignSave = () => {
    if (!selectedRoomNums.length) {
      toast.error("Select at least one room to update.");
      return;
    }
    if (staffName) {
      setStaffOverrides((prev) => {
        const next = { ...prev };
        selectedRoomNums.forEach((num) => {
          next[num] = staffName;
        });
        return next;
      });
    }
    // Resolve staff ID from staff name selection
    let staffId: string | null = null;
    if (staffName) {
      const staffObj = staffUsers.find(
        (u) =>
          u.name === staffName ||
          u.username === staffName ||
          `${u.first_name} ${u.last_name || ""}`.trim() === staffName
      );
      if (staffObj) {
        staffId = staffObj.id || staffObj.user_id;
      }
    }

    // Resolve room IDs from selectedRoomNums
    const roomIds: string[] = [];
    selectedRoomNums.forEach((num) => {
      const room = housekeepingRooms.find((r) => r.num === num);
      if (room && room.id) {
        roomIds.push(room.id);
      }
    });

    if (roomIds.length > 0) {
      const payload = {
        room_ids: roomIds,
        assigned_staff: staffId || "No change",
        housekeeping_status: newStatus || "No change",
      };

      fetchApi<any>("/api/housekeeping/tasks/bulk-assign/", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          console.log("Bulk update response:", res);
        })
        .catch((err) => {
          console.error("Bulk update failed:", err);
          toast.error("Failed to update rooms on server.");
        });
    }

    if (newStatus) {
      setStatusOverrides((prev) => {
        const next = { ...prev };
        selectedRoomNums.forEach((num) => {
          next[num] = newStatus;
        });
        return next;
      });
    }

    if (staffName && newStatus) {
      toast.success(`Assigned ${staffName} and set status to ${newStatus} for ${selectedRoomNums.length} room(s).`);
    } else if (staffName) {
      toast.success(`${staffName} assigned to ${selectedRoomNums.length} room(s).`);
    } else if (newStatus) {
      toast.success(`Set status to ${newStatus} for ${selectedRoomNums.length} room(s).`);
    } else {
      toast.info("No changes made.");
    }
    
    setIsAssignOpen(false);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Housekeeping"
        description="Floor-level room status across The Grand Palace."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowFilterPanel((prev) => !prev)}>
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
            <Button size="sm" onClick={handleHeaderAssign}>
              <UserPlus className="h-3.5 w-3.5" />
              Assign staff
            </Button>
          </>
        }
      />

      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">

        <HousekeepingStatus stats={{ total: stats.total, clean: stats.ready, dirty: stats.dirty, inspected: stats.inspected }} />

        {showFilterPanel ? (
          <div className="rounded-md border border-border bg-surface p-3">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
              Quick status filter
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", "Ready", "Dirty", "Inspected"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full border px-3 py-1 text-[12px] transition ${
                    statusFilter === s
                      ? "border-primary bg-primary-tint text-primary"
                      : "border-border text-text-secondary hover:border-primary hover:text-primary"
                  }`}
                >
                  {s}
                </button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setStatusFilter("All")}>
                Reset
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full overflow-x-auto sm:w-auto">
            <div className="flex min-w-max rounded-md border border-border bg-surface p-0.5 text-[12px]">
              {(
                [
                  { id: "board" as const, label: "Board" },
                  { id: "list" as const, label: "List" },
                  { id: "kanban" as const, label: "By attendant" },
                ] as const
              ).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  className={`rounded px-3 py-1 transition ${
                    view === v.id
                      ? "bg-foreground text-background"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-md border border-border bg-surface px-2 text-[12px]"
          >
            {["All", "Ready", "Dirty", "Inspected"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {view === "board" && (
          <RoomCardGrid housekeepingRooms={filtered} tone={tone} cardBg={cardBg} onUpdateRoom={handleQuickRoomUpdate} />
        )}
        {view === "list" && (
          <HousekeepingListView rooms={filtered} tone={tone} onUpdateRoom={handleQuickRoomUpdate} />
        )}
        {view === "kanban" && <HousekeepingKanban rooms={filtered} tone={tone} />}
      </div>

      {isAssignOpen ? (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity" 
            onClick={() => setIsAssignOpen(false)} 
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-hidden border-l border-border bg-surface shadow-e3 animate-in slide-in-from-right duration-200">
            <div className="shrink-0 border-b border-border-subtle px-5 py-4">
              <div className="text-[16px] font-semibold text-text-primary">Update rooms</div>
              <div className="text-[12px] text-text-secondary">
                Select rooms and update their status or assigned staff.
              </div>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                    Staff member
                  </div>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                  >
                    <option value="">No change</option>
                    {staffUsers.map((staff) => {
                      const name = staff.name || staff.username || staff.first_name || staff.email;
                      return (
                        <option key={staff.id || name} value={name}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </label>
                <label className="block">
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                    Room Status
                  </div>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="">No change</option>
                    {["clean", "dirty", "inspecting"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Rooms
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {filtered.map((room) => (
                    <label
                      key={room.num}
                      className={`flex cursor-pointer items-center justify-between gap-1 rounded border px-2 py-2 text-[12px] transition ${
                        selectedRoomNums.includes(room.num)
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border-subtle hover:border-primary/50 hover:bg-surface-2"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedRoomNums.includes(room.num)}
                        onChange={() => toggleRoomSelection(room.num)}
                      />
                      <span className={`font-mono ${selectedRoomNums.includes(room.num) ? "font-semibold text-primary" : "text-text-primary"}`}>{room.num}</span>
                      <span className="text-[10px] text-text-secondary truncate">{room.status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="shrink-0 flex justify-end gap-2 border-t border-border-subtle bg-surface-2/50 px-5 py-4">
              <Button variant="outline" size="sm" onClick={() => setIsAssignOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAssignSave}>
                Save changes
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
export default HousekeepingFeature;
