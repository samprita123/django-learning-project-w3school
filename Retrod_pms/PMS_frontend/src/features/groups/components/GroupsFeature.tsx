import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Filter } from "lucide-react";
import {
  PageHeader,
  KpiCard,
  Button,
  Card,
  CardHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useGroupBlocksQuery } from "@/services/mock/queries";
import { GroupDetail } from "./GroupDetail";

export function GroupsFeature() {
  const { data: rawBlocks = [] } = useGroupBlocksQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [managerFilter, setManagerFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("");

  // 1. Filter out Room blocks (Conference Block)
  const groupBlocks = useMemo(() => {
    return rawBlocks.filter((b) => b.block_type !== "Conference Block");
  }, [rawBlocks]);

  const uniqueStatuses = useMemo(() => Array.from(new Set(groupBlocks.map((b) => b.status))), [groupBlocks]);
  const uniqueManagers = useMemo(() => Array.from(new Set(groupBlocks.map((b) => b.contact_name).filter(Boolean))), [groupBlocks]);

  const filteredGroups = useMemo(() => {
    return groupBlocks.filter((b) => {
      const matchStatus = statusFilter === "All" || b.status === statusFilter;
      const matchManager = managerFilter === "All" || b.contact_name === managerFilter;
      
      let matchMonth = true;
      if (monthFilter && b.start_date) {
        matchMonth = b.start_date.startsWith(monthFilter);
      }

      return matchStatus && matchManager && matchMonth;
    });
  }, [groupBlocks, statusFilter, managerFilter, monthFilter]);

  if (selectedId) {
    const selected = groupBlocks.find((b) => b.id === selectedId);
    if (selected) {
      return <GroupDetail group={selected} onBack={() => setSelectedId(null)} />;
    }
  }

  const active = filteredGroups.filter((b) => ["OPEN", "Open"].includes(b.status)).length;
  const totalBlocked = filteredGroups.reduce((a, b) => a + (b.total_rooms || 0), 0);
  const totalPicked = filteredGroups.reduce((a, b) => a + (b.pickup_rooms || 0), 0);
  const pickupPct = totalBlocked > 0 ? Math.round((totalPicked / totalBlocked) * 100) : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Group Bookings"
        description="Blocks, rooming lists, cut-offs, and master billing."
        actions={
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-4 space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-[13px] text-text-primary">Filter Groups</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-secondary">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand"
                    >
                      <option value="All">All Statuses</option>
                      {uniqueStatuses.map(s => <option key={s} value={s}>{s === "OPEN" ? "Open" : s === "CLOSED" ? "Closed" : s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-secondary">Manager</label>
                    <select
                      value={managerFilter}
                      onChange={(e) => setManagerFilter(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand"
                    >
                      <option value="All">All Managers</option>
                      {uniqueManagers.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-secondary">Month</label>
                    <input
                      type="month"
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand"
                    />
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setStatusFilter("All"); setManagerFilter("All"); setMonthFilter(""); }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Link to="/reservations/new" search={{ type: "group" } as any}>
              <Button size="sm">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New group block
              </Button>
            </Link>
          </>
        }
      />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Active groups" value={String(active)} accent="brand" />
          <KpiCard label="Rooms blocked" value={String(totalBlocked)} accent="info" />
          <KpiCard label="Pickup %" value={`${pickupPct}%`} accent="success" />
          <KpiCard label="Cut-offs this week" value="2" accent="warning" />
        </div>

        <Card>
          <CardHeader title="Group blocks" hint={`${filteredGroups.length} blocks`} />
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["Block", "Group", "Dates", "Cut-off", "Manager", "Pickup", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((b) => {
                  const blockedCount = b.total_rooms || 0;
                  const pickedCount = b.pickup_rooms || 0;
                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedId(b.id)}
                      className="cursor-pointer border-b border-border-subtle hover:bg-surface-2/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-[12px]">
                        <span className="hover:text-primary hover:underline">{b.code || b.id.substring(0, 8)}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {b.name}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {b.start_date} to {b.end_date}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {b.cutoff_date || b.end_date}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{b.contact_name || "—"}</td>
                      <td className="px-4 py-3 font-mono">
                        <span className="text-text-primary">{pickedCount}</span>
                        <span className="text-text-disabled"> / {blockedCount}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge 
                          tone={b.status === "OPEN" ? "info" : "success"}
                        >
                          {b.status === "OPEN" ? "Open" : b.status === "CLOSED" ? "Closed" : b.status}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default GroupsFeature;
