import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  StatusBadge,
  KpiCard,
} from "@/components/ui/Primitives";
import { Plus, X, Building, User, Mail, Phone, Filter } from "lucide-react";
import { crmLeads } from "@/features/core/data/catalog";
import { useState, useMemo } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const toneByStage: Record<string, "info" | "warning" | "success" | "neutral"> = {
  New: "info",
  Qualified: "success",
  Proposal: "warning",
  Negotiation: "warning",
};

export function LeadsFeature() {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("");

  const uniqueSources = useMemo(() => Array.from(new Set(crmLeads.map((l) => l.source))), []);
  const uniqueStages = useMemo(() => Array.from(new Set(crmLeads.map((l) => l.stage))), []);
  const uniqueDates = useMemo(() => Array.from(new Set(crmLeads.map((l) => l.eta))), []);

  const filteredLeads = useMemo(() => {
    return crmLeads.filter((lead) => {
      const matchSource = sourceFilter === "All" || lead.source === sourceFilter;
      const matchStage = stageFilter === "All" || lead.stage === stageFilter;
      const matchDate = dateFilter === "All" || lead.eta === dateFilter;
      
      const leadMonth = 'date' in lead ? (lead.date as string).substring(0, 7) : "";
      const matchMonth = !monthFilter || leadMonth === monthFilter;

      return matchSource && matchStage && matchDate && matchMonth;
    });
  }, [sourceFilter, stageFilter, dateFilter, monthFilter]);

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Leads"
        description="Track upcoming opportunities from inquiry to conversion."
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
                  <h4 className="font-medium text-[13px] text-text-primary">Filter Leads</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-secondary">Source</label>
                    <select
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand"
                    >
                      <option value="All">All Sources</option>
                      {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-secondary">Stage</label>
                    <select
                      value={stageFilter}
                      onChange={(e) => setStageFilter(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand"
                    >
                      <option value="All">All Stages</option>
                      {uniqueStages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-secondary">Date / ETA</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand"
                    >
                      <option value="All">All Dates</option>
                      {uniqueDates.map(d => <option key={d} value={d}>{d}</option>)}
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
                      onClick={() => { setSourceFilter("All"); setStageFilter("All"); setDateFilter("All"); setMonthFilter(""); }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button size="sm" onClick={() => setIsAddLeadOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add lead
            </Button>
          </>
        }
      />

      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Open leads" value="24" accent="brand" />
          <KpiCard label="Qualified" value="11" accent="success" />
          <KpiCard label="Proposal sent" value="7" accent="info" />
          <KpiCard label="Won (MTD)" value="5" accent="warning" />
        </div>

        <Card>
          <CardHeader title="Lead pipeline queue" hint="Sales conversion workflow" />
          <div className="table-scroll-shadow overflow-x-auto">
            <table className="w-full min-w-[820px] text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["Lead ID", "Account", "Source", "Stage", "Owner", "Follow-up"].map((h) => (
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
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border-subtle hover:bg-surface-2/40">
                    <td className="px-4 py-3 font-mono text-[12px]">{lead.id}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{lead.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{lead.source}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={toneByStage[lead.stage] ?? "neutral"}>
                        {lead.stage}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{lead.owner}</td>
                    <td className="px-4 py-3 text-text-secondary">{lead.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Lead Modal */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface-2/50">
              <h2 className="text-lg font-bold text-text-primary">Create New Lead</h2>
              <button onClick={() => setIsAddLeadOpen(false)} className="p-1 hover:bg-surface-2 rounded-md text-text-secondary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-text-primary">Account / Company Name <span className="text-error">*</span></label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <input type="text" placeholder="e.g. Acme Corp" className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-primary">Primary Contact</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                      <input type="text" placeholder="John Doe" className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-primary">Lead Source</label>
                    <select className="w-full h-10 px-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand">
                      <option>Direct Call</option>
                      <option>Website</option>
                      <option>Travel Agent / B2B</option>
                      <option>Referral</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-primary">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                      <input type="email" placeholder="john@acme.com" className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-primary">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                      <input type="tel" placeholder="+1 555-0199" className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-text-primary">Estimated Room Nights</label>
                  <input type="number" placeholder="e.g. 50" className="w-full h-10 px-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand" />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-3 bg-surface-2/50">
              <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => {
                alert("Lead created successfully!");
                setIsAddLeadOpen(false);
              }}>Create Lead</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadsFeature;
