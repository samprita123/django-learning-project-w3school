import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardHeader, StatusBadge } from "@/components/ui/Primitives";
import { type Guest } from "@/types/pms";

interface GuestsListProps {
  guests: Guest[];
  selectedName?: string;
  onSelectGuest: (g: Guest) => void;
}

export function GuestsList({ guests, selectedName, onSelectGuest }: GuestsListProps) {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredGuests = guests.filter(g => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    
    if (fromDate || toDate) {
      if (!g.stays || g.stays.length === 0) return false;
      const hasStayInRange = g.stays.some(stay => {
        const stayCi = new Date(stay.ci);
        const stayCo = new Date(stay.co);
        let inRange = true;
        if (fromDate) {
          const from = new Date(fromDate);
          if (stayCo < from) inRange = false;
        }
        if (toDate) {
          const to = new Date(toDate);
          if (stayCi > to) inRange = false;
        }
        return inRange;
      });
      if (!hasStayInRange) return false;
    }
    
    return true;
  });

  return (
    <Card>
      <CardHeader
        title="All guests"
        hint={`${filteredGuests.length} profiles`}
        action={
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input 
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-8 w-full sm:w-auto rounded-md border border-border px-2 text-[12px] focus:border-primary focus:outline-none"
                title="From date"
              />
              <span className="text-text-disabled text-[12px]">-</span>
              <input 
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-8 w-full sm:w-auto rounded-md border border-border px-2 text-[12px] focus:border-primary focus:outline-none"
                title="To date"
              />
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-disabled" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full rounded-md border border-border pl-8 pr-2 text-[12px] focus:border-primary focus:outline-none"
                placeholder="Search…"
              />
            </div>
          </div>
        }
      />
      <div className="space-y-2 p-3 md:hidden">
        {filteredGuests.map((g) => (
          <div key={g.name} className="rounded-md border border-border-subtle bg-surface p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                  {g.name
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <span className="text-[13px] font-medium text-text-primary">{g.name}</span>
              </div>
              <StatusBadge
                tone={g.tier === "Platinum" ? "brand" : g.tier === "Gold" ? "warning" : "neutral"}
              >
                {g.tier}
              </StatusBadge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div className="text-text-disabled">Country</div>
                <div className="text-text-secondary">{g.country}</div>
              </div>
              <div>
                <div className="text-text-disabled">Visits</div>
                <div className="font-mono text-text-primary">{g.visits}</div>
              </div>
              <div className="col-span-2">
                <div className="text-text-disabled">Lifetime value</div>
                <div className="font-mono text-text-primary">₹{g.ltv.toLocaleString()}</div>
              </div>
            </div>
            <button
              onClick={() => onSelectGuest(g)}
              className="mt-2 w-full rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-primary"
            >
              View
            </button>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-2/40 text-left">
              {["Guest", "Country", "Visits", "Lifetime Value", "Tier", ""].map((h) => (
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
            {filteredGuests.map((g) => (
              <tr
                key={g.name}
                className={`border-b border-border-subtle hover:bg-surface-2/50 ${selectedName === g.name ? "bg-primary-tint/30" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                      {g.name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <span className="font-medium text-text-primary">{g.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary">{g.country}</td>
                <td className="px-4 py-3 font-mono text-text-primary">{g.visits}</td>
                <td className="px-4 py-3 font-mono text-text-primary">₹{g.ltv.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    tone={
                      g.tier === "Platinum" ? "brand" : g.tier === "Gold" ? "warning" : "neutral"
                    }
                  >
                    {g.tier}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onSelectGuest(g)}
                    className="text-[12px] font-medium text-primary hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
export default GuestsList;
