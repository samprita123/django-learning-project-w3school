import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Filter, Plus, Wrench } from "lucide-react";
import { PageHeader, KpiCard, Button, Card, StatusBadge } from "@/components/ui/Primitives";
import { fetchApi } from "@/services/api/core";
import { cn } from "@/lib/utils";

// Columns map to backend choices: REPORTED, IN_PROGRESS, WAITING_PARTS, RESOLVED
const columns = ["Reported", "In Progress", "Waiting Parts", "Resolved"] as const;
type UIStatus = typeof columns[number];

interface DBTicket {
  id: string;
  reference_number: string;
  room_location: string;
  title: string;
  description: string;
  category: "HVAC" | "PLUMBING" | "ELECTRICAL" | "FURNITURE" | "GENERAL";
  priority: "NORMAL" | "HIGH" | "CRITICAL";
  status: "REPORTED" | "IN_PROGRESS" | "WAITING_PARTS" | "RESOLVED";
  assigned_to: string | null;
  assigned_to_name: string | null;
  property: string;
  inventory_unit: string | null;
  created_at: string;
}

const mapDBStatusToUI = (status: DBTicket["status"]): UIStatus => {
  if (status === "REPORTED") return "Reported";
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "WAITING_PARTS") return "Waiting Parts";
  return "Resolved";
};

const mapUIToDBStatus = (status: UIStatus): DBTicket["status"] => {
  if (status === "Reported") return "REPORTED";
  if (status === "In Progress") return "IN_PROGRESS";
  if (status === "Waiting Parts") return "WAITING_PARTS";
  return "RESOLVED";
};

const priorityTone = (p: DBTicket["priority"]) => {
  if (p === "CRITICAL") return "error";
  if (p === "HIGH") return "warning";
  return "neutral";
};

const priorityLabel = (p: DBTicket["priority"]) => {
  if (p === "CRITICAL") return "Critical";
  if (p === "HIGH") return "High";
  return "Normal";
};

export function MaintenanceFeature() {
  const [tickets, setTickets] = useState<DBTicket[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState({
    open_work_orders: 0,
    critical_count: 0,
    rooms_ooo: 0,
    avg_resolution: "0.0h",
    pm_due_this_week: 0
  });

  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWoRoom, setNewWoRoom] = useState("");
  const [newWoCategory, setNewWoCategory] = useState("HVAC");
  const [newWoTitle, setNewWoTitle] = useState("");
  const [newWoAssignee, setNewWoAssignee] = useState("");
  const [newWoPriority, setNewWoPriority] = useState<"NORMAL" | "HIGH" | "CRITICAL">("NORMAL");
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);

  const activePropertyId = useMemo(() => {
    return localStorage.getItem("retrod:active-property-id") || "";
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const activeProp = localStorage.getItem("retrod:active-property-id") || "";
      
      // Fetch stats
      const statsRes = await fetchApi<any>(`/api/maintenance/tickets/stats/?property=${activeProp}`);
      if (statsRes) {
        setStats({
          open_work_orders: statsRes.open_work_orders || 0,
          critical_count: statsRes.critical_count || 0,
          rooms_ooo: statsRes.rooms_ooo || 0,
          avg_resolution: statsRes.avg_resolution || "0.0h",
          pm_due_this_week: statsRes.pm_due_this_week || 0
        });
      }

      // Fetch tickets
      const ticketsRes = await fetchApi<any>(`/api/maintenance/tickets/?property=${activeProp}`);
      setTickets(Array.isArray(ticketsRes) ? ticketsRes : ticketsRes?.results || []);

      // Fetch users / staff
      const usersRes = await fetchApi<any>("/api/users/");
      setStaffUsers(Array.isArray(usersRes) ? usersRes : usersRes?.results || []);

      // Fetch rooms
      const roomsRes = await fetchApi<any>("/api/inventory/units/?limit=1000");
      setRooms(Array.isArray(roomsRes) ? roomsRes : roomsRes?.results || []);

      // Fetch properties
      const propsRes = await fetchApi<any>("/api/properties/");
      const propList = Array.isArray(propsRes) ? propsRes : propsRes?.results || [];
      setProperties(propList);
    } catch (err) {
      console.error("Failed to load maintenance data:", err);
      toast.error("Failed to load maintenance data from database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activePropertyId]);

  const handleCreate = async () => {
    if (!newWoRoom.trim() || !newWoTitle.trim()) {
      toast.error("Please fill in Room/Location and Title.");
      return;
    }

    const activeProp = activePropertyId || properties[0]?.id;
    if (!activeProp) {
      toast.error("No active property context found.");
      return;
    }

    // Attempt to match room name to inventory unit UUID
    const matchedRoom = rooms.find(r => r.name.toLowerCase() === newWoRoom.trim().toLowerCase());

    const payload = {
      property: activeProp,
      inventory_unit: matchedRoom ? matchedRoom.id : null,
      location: matchedRoom ? null : newWoRoom.trim(),
      title: newWoTitle.trim(),
      category: newWoCategory.toUpperCase(),
      priority: newWoPriority,
      status: "REPORTED",
      assigned_to: newWoAssignee || null,
    };

    try {
      const createdTicket = await fetchApi<DBTicket>("/api/maintenance/tickets/", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (createdTicket && newWoAssignee) {
        // If assigned staff was selected, hit assign endpoint to sync state
        await fetchApi("/api/maintenance/assign/", {
          method: "POST",
          body: JSON.stringify({ ticket_id: createdTicket.id, user_id: newWoAssignee })
        });
      }

      toast.success("Work order created successfully.");
      setIsCreateOpen(false);
      setNewWoRoom("");
      setNewWoTitle("");
      setNewWoCategory("HVAC");
      setNewWoAssignee("");
      setNewWoPriority("NORMAL");
      loadData();
    } catch (err: any) {
      toast.error("Failed to create work order: " + err.message);
    }
  };

  const filtered = useMemo(() => {
    return tickets.filter((w) => {
      if (priorityFilter === "All") return true;
      return w.priority === priorityFilter.toUpperCase();
    });
  }, [tickets, priorityFilter]);

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Maintenance"
        description="Work orders, preventive tasks, and room out-of-order tracking."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={loadData}>
              <Filter className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Create work order
            </Button>
          </>
        }
      />

      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard
            label="Open work orders"
            value={String(stats.open_work_orders)}
            delta={stats.critical_count ? `${stats.critical_count} critical` : undefined}
            deltaTone="error"
            accent="warning"
          />
          <KpiCard label="Critical" value={String(stats.critical_count)} accent="error" />
          <KpiCard label="Rooms OOO" value={String(stats.rooms_ooo)} accent="warning" />
          <KpiCard label="Avg resolution" value={stats.avg_resolution} accent="info" />
          <KpiCard label="PM due this week" value={String(stats.pm_due_this_week)} accent="brand" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 rounded-md border border-border bg-surface px-2 text-[12px] cursor-pointer"
          >
            {["All", "Critical", "High", "Normal"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {columns.map((col) => {
            const items = filtered.filter((w) => mapDBStatusToUI(w.status) === col);
            return (
              <div key={col}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-[12px] font-semibold text-text-primary">{col}</span>
                  <span className="rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-secondary">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <Card className="border-dashed p-4 text-center text-[12px] text-text-secondary">
                      No items
                    </Card>
                  ) : (
                    items.map((wo) => (
                      <WorkOrderCard 
                        key={wo.id} 
                        wo={wo} 
                        staffUsers={staffUsers} 
                        onRefresh={loadData} 
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isCreateOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity" 
            onClick={() => setIsCreateOpen(false)} 
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-hidden border-l border-border bg-surface shadow-e3 animate-in slide-in-from-right duration-200">
            <div className="shrink-0 border-b border-border-subtle px-5 py-4">
              <div className="text-[16px] font-semibold text-text-primary">Create work order</div>
              <div className="text-[12px] text-text-secondary">
                Report a maintenance issue or request repairs.
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="relative block">
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Room / Location *
                </div>
                <input
                  type="text"
                  placeholder="e.g. 101 or Lobby"
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={newWoRoom}
                  onFocus={() => setIsRoomDropdownOpen(true)}
                  onChange={(e) => {
                    setNewWoRoom(e.target.value);
                    setIsRoomDropdownOpen(true);
                  }}
                />
                {isRoomDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsRoomDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-md z-20">
                      {rooms
                        .filter(r => r.name.toLowerCase().includes(newWoRoom.toLowerCase()))
                        .map(r => (
                          <div
                            key={r.id}
                            className="px-3 py-2 text-[13px] hover:bg-surface-2 cursor-pointer text-text-primary transition-colors"
                            onClick={() => {
                              setNewWoRoom(r.name);
                              setIsRoomDropdownOpen(false);
                            }}
                          >
                            Room {r.name}
                          </div>
                        ))
                      }
                      {rooms.filter(r => r.name.toLowerCase().includes(newWoRoom.toLowerCase())).length === 0 && (
                        <div
                          className="px-3 py-2 text-[13px] italic text-text-secondary cursor-pointer hover:bg-surface-2"
                          onClick={() => setIsRoomDropdownOpen(false)}
                        >
                          Use custom location "{newWoRoom}"
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <label className="block">
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Category
                </div>
                <select
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                  value={newWoCategory}
                  onChange={(e) => setNewWoCategory(e.target.value)}
                >
                  <option value="HVAC">HVAC</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Furniture">Furniture</option>
                  <option value="General">General</option>
                </select>
              </label>

              <label className="block">
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Title / Description *
                </div>
                <input
                  type="text"
                  placeholder="Brief description of the issue"
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                  value={newWoTitle}
                  onChange={(e) => setNewWoTitle(e.target.value)}
                />
              </label>

              <label className="block">
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Assign To
                </div>
                <select
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                  value={newWoAssignee}
                  onChange={(e) => setNewWoAssignee(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {staffUsers.map((u) => (
                    <option key={u.id || u.user_id} value={u.id || u.user_id}>
                      {u.first_name ? `${u.first_name} ${u.last_name || ""}`.trim() : u.username || u.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Priority
                </div>
                <select
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                  value={newWoPriority}
                  onChange={(e) => setNewWoPriority(e.target.value as any)}
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </label>
            </div>
            <div className="shrink-0 flex justify-end gap-2 border-t border-border-subtle bg-surface-2/50 px-5 py-4">
              <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate}>
                Create order
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function WorkOrderCard({ 
  wo, 
  staffUsers, 
  onRefresh 
}: { 
  wo: DBTicket; 
  staffUsers: any[]; 
  onRefresh: () => void; 
}) {
  const handleStatusChange = async (nextStatus: UIStatus) => {
    try {
      const dbStatus = mapUIToDBStatus(nextStatus);
      if (dbStatus === "RESOLVED") {
        await fetchApi("/api/maintenance/complete/", {
          method: "POST",
          body: JSON.stringify({ ticket_id: wo.id })
        });
      } else {
        await fetchApi(`/api/maintenance/tickets/${wo.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ status: dbStatus })
        });
      }
      toast.success("Work order status updated.");
      onRefresh();
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleAssigneeChange = async (userId: string) => {
    try {
      if (userId) {
        await fetchApi("/api/maintenance/assign/", {
          method: "POST",
          body: JSON.stringify({ ticket_id: wo.id, user_id: userId })
        });
        toast.success("Staff assigned successfully.");
      } else {
        await fetchApi(`/api/maintenance/tickets/${wo.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ assigned_to: null, status: "REPORTED" })
        });
        toast.success("Ticket unassigned.");
      }
      onRefresh();
    } catch (err: any) {
      toast.error("Failed to update assignment: " + err.message);
    }
  };

  const createdLabel = useMemo(() => {
    if (!wo.created_at) return "Just now";
    return new Date(wo.created_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }, [wo.created_at]);

  return (
    <Card className="p-3 shadow-e1">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] text-text-secondary">{wo.reference_number || wo.id.substring(0, 8)}</span>
        <div className="flex items-center gap-2">
          <StatusBadge tone={priorityTone(wo.priority)}>{priorityLabel(wo.priority)}</StatusBadge>
          <select
            value={mapDBStatusToUI(wo.status)}
            onChange={(e) => handleStatusChange(e.target.value as UIStatus)}
            className="h-6 rounded border border-border-subtle bg-surface-2 px-1 text-[11px] font-medium text-text-primary outline-none cursor-pointer"
          >
            {columns.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-text-primary">
        <Wrench className="h-3.5 w-3.5 text-text-secondary" />
        {wo.room_location}
      </div>
      <p className="mt-1 text-[12px] text-text-primary">{wo.title}</p>
      {wo.description && (
        <p className="mt-0.5 text-[11px] text-text-secondary truncate">{wo.description}</p>
      )}
      <p className="mt-1 text-[11px] text-text-secondary">
        {wo.category} · {createdLabel}
      </p>
      
      <div className="mt-2.5 border-t border-border-subtle pt-2 flex items-center justify-between text-[11px]">
        <span className="text-text-secondary font-medium">Assignee:</span>
        <select
          value={wo.assigned_to || ""}
          onChange={(e) => handleAssigneeChange(e.target.value)}
          className="h-5 rounded border border-border bg-surface text-[10px] outline-none cursor-pointer max-w-[130px]"
        >
          <option value="">Unassigned</option>
          {staffUsers.map((u) => (
            <option key={u.id || u.user_id} value={u.id || u.user_id}>
              {u.first_name ? `${u.first_name} ${u.last_name || ""}`.trim() : u.username || u.name}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
}

export default MaintenanceFeature;
