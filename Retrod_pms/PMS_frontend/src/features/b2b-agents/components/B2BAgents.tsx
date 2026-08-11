import { useState } from "react";
import { 
  Search, ShieldCheck, Clock, X, FileText, Check, Ban, Eye, 
  Briefcase, Building, MapPin, Mail, Phone, Plus, Loader2, Upload
} from "lucide-react";
import { Card, Button } from "@/components/ui/Primitives";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { b2bApi } from "@/services/api/b2b";

const inputCls = "w-full h-10 px-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand";

export function B2BAgentsFeature() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'All' | 'Pending KYC' | 'Approved' | 'Rejected'>('All');
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{ agentName: string, docName: string, url: string | null } | null>(null);
  const [reviewingAgent, setReviewingAgent] = useState<any | null>(null);
  
  // Add Partner Form State
  const [partnerForm, setPartnerForm] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    location: "",
    status: "Pending KYC",
    commission: 0,
    creditLimit: 0,
  });
  const [incFile, setIncFile] = useState<File | null>(null);
  const [ownerIdFile, setOwnerIdFile] = useState<File | null>(null);
  const [chequeFile, setChequeFile] = useState<File | null>(null);

  // Approval Form State
  const [commissionInput, setCommissionInput] = useState("15");
  const [creditLimitInput, setCreditLimitInput] = useState("100000");

  // Fetch partners
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["b2bPartners"],
    queryFn: () => b2bApi.getAll().then(res => res.results || res || []),
  });

  // Create Partner Mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) => b2bApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["b2bPartners"] });
      setIsAddPartnerOpen(false);
      setPartnerForm({
        name: "",
        contact: "",
        email: "",
        phone: "",
        location: "",
        status: "Pending KYC",
        commission: 0,
        creditLimit: 0,
      });
      setIncFile(null);
      setOwnerIdFile(null);
      setChequeFile(null);
    },
  });

  // Update Partner Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => b2bApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["b2bPartners"] });
      setReviewingAgent(null);
    },
  });

  const filteredAgents = (agents || []).filter((agent: any) => {
    if (activeTab !== 'All' && agent.status !== activeTab) return false;
    
    const term = searchQuery.toLowerCase().trim();
    if (term) {
      const matchName = agent.name?.toLowerCase().includes(term);
      const matchId = agent.id?.toLowerCase().includes(term);
      const matchEmail = agent.email?.toLowerCase().includes(term);
      const matchContact = agent.contact?.toLowerCase().includes(term);
      return matchName || matchId || matchEmail || matchContact;
    }
    return true;
  });

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.name || !partnerForm.email || !partnerForm.phone) return;
    
    createMutation.mutate({
      ...partnerForm,
      incorporation: incFile,
      ownerId: ownerIdFile,
      cheque: chequeFile,
    });
  };

  const handleApprove = () => {
    if (!reviewingAgent) return;
    updateMutation.mutate({
      id: reviewingAgent.id,
      payload: {
        status: 'Approved',
        commission: parseInt(commissionInput) || 0,
        creditLimit: parseFloat(creditLimitInput) || 0,
      }
    });
  };

  const handleReject = () => {
    if (!reviewingAgent) return;
    updateMutation.mutate({
      id: reviewingAgent.id,
      payload: {
        status: 'Rejected',
      }
    });
  };

  const openReviewModal = (agent: any) => {
    setReviewingAgent(agent);
    setCommissionInput(String(agent.commission || 15));
    setCreditLimitInput(String(agent.creditLimit || 100000));
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">B2B Partners & Travel Agents</h1>
          <p className="text-[13px] text-text-secondary mt-1">Manage agent onboarding, verify KYC documents, and set commercials.</p>
        </div>
        <Button size="sm" onClick={() => setIsAddPartnerOpen(true)} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" /> Add Partner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-brand">
          <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Total Approved</div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {isLoading ? "..." : agents.filter((a: any) => a.status === 'Approved').length}
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-warning">
          <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Pending KYC</div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {isLoading ? "..." : agents.filter((a: any) => a.status === 'Pending KYC').length}
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-error">
          <div className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Rejected</div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {isLoading ? "..." : agents.filter((a: any) => a.status === 'Rejected').length}
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 gap-4">
        <div className="flex p-1 bg-surface-2 rounded-lg">
          {['All', 'Pending KYC', 'Approved', 'Rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand"
          />
        </div>
      </Card>

      {/* Agents Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-[13px] text-text-secondary">Fetching B2B partners...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-2/50 text-[12px] font-medium text-text-secondary">
                  <th className="p-4">Agent Details</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Commercials</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-text-secondary text-[13px]">
                      No agents found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent: any) => (
                    <tr key={agent.id} className="hover:bg-surface-2/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand font-bold text-[14px]">
                            {agent.name ? agent.name.charAt(0) : "A"}
                          </div>
                          <div>
                            <div className="font-medium text-[14px] text-text-primary">{agent.name}</div>
                            <div className="text-[12px] text-text-secondary font-mono">{agent.id} • {agent.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-[13px] text-text-primary">{agent.contact}</div>
                        <div className="text-[11px] text-text-secondary">{agent.email}</div>
                        {agent.phone && <div className="text-[11px] text-text-secondary">{agent.phone}</div>}
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                          agent.status === 'Approved' ? 'bg-success/10 text-success' :
                          agent.status === 'Pending KYC' ? 'bg-warning/10 text-warning-dark' :
                          'bg-error/10 text-error'
                        }`}>
                          {agent.status === 'Approved' && <ShieldCheck className="h-3 w-3" />}
                          {agent.status === 'Pending KYC' && <Clock className="h-3 w-3" />}
                          {agent.status === 'Rejected' && <Ban className="h-3 w-3" />}
                          {agent.status}
                        </div>
                      </td>
                      <td className="p-4">
                        {agent.status === 'Approved' ? (
                          <div>
                            <div className="text-[13px] font-medium text-text-primary">{agent.commission}% Comm.</div>
                            <div className="text-[11px] text-text-secondary">Limit: ₹{Number(agent.creditLimit || 0).toLocaleString()}</div>
                          </div>
                        ) : (
                          <div className="text-[12px] text-text-muted italic">Not set</div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {agent.status === 'Pending KYC' ? (
                          <Button variant="primary" size="sm" onClick={() => openReviewModal(agent)} className="cursor-pointer">
                            Review & Approve
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => openReviewModal(agent)} className="cursor-pointer">
                            View Details
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Partner Sheet (Right-side Modal) */}
      <Sheet open={isAddPartnerOpen} onOpenChange={setIsAddPartnerOpen}>
        <SheetContent className="sm:max-w-[460px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add B2B Partner</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleCreatePartner} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-primary">Agency Name *</label>
              <input
                type="text"
                required
                className={inputCls}
                value={partnerForm.name}
                onChange={e => setPartnerForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Travel & Tours Ltd"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-primary">Contact Person *</label>
              <input
                type="text"
                required
                className={inputCls}
                value={partnerForm.contact}
                onChange={e => setPartnerForm(prev => ({ ...prev, contact: e.target.value }))}
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-primary">Email Address *</label>
              <input
                type="email"
                required
                className={inputCls}
                value={partnerForm.email}
                onChange={e => setPartnerForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. travel@agent.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-primary">Phone Number *</label>
              <input
                type="text"
                required
                className={inputCls}
                value={partnerForm.phone}
                onChange={e => setPartnerForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. +91 9876543210"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-primary">Location / City *</label>
              <input
                type="text"
                required
                className={inputCls}
                value={partnerForm.location}
                onChange={e => setPartnerForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Delhi, India"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-text-primary">Default Commission (%)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={partnerForm.commission}
                  onChange={e => setPartnerForm(prev => ({ ...prev, commission: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-text-primary">Credit Limit (₹)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={partnerForm.creditLimit}
                  onChange={e => setPartnerForm(prev => ({ ...prev, creditLimit: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-primary">Status</label>
              <select
                className={inputCls}
                value={partnerForm.status}
                onChange={e => setPartnerForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="Pending KYC">Pending KYC</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* KYC Files */}
            <div className="space-y-3 pt-2">
              <div className="border-t border-border pt-3">
                <div className="text-[13px] font-semibold text-text-primary mb-2">KYC Documents</div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">Incorporation Certificate</label>
                  <label className="flex items-center gap-2 border border-dashed border-border hover:border-brand/40 bg-surface px-3 py-2 rounded-md cursor-pointer transition">
                    <Upload className="h-4 w-4 text-text-secondary" />
                    <span className="text-xs text-text-secondary truncate">{incFile ? incFile.name : "Choose File"}</span>
                    <input type="file" className="hidden" onChange={e => setIncFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">Owner ID Proof</label>
                  <label className="flex items-center gap-2 border border-dashed border-border hover:border-brand/40 bg-surface px-3 py-2 rounded-md cursor-pointer transition">
                    <Upload className="h-4 w-4 text-text-secondary" />
                    <span className="text-xs text-text-secondary truncate">{ownerIdFile ? ownerIdFile.name : "Choose File"}</span>
                    <input type="file" className="hidden" onChange={e => setOwnerIdFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">Cancelled Cheque</label>
                  <label className="flex items-center gap-2 border border-dashed border-border hover:border-brand/40 bg-surface px-3 py-2 rounded-md cursor-pointer transition">
                    <Upload className="h-4 w-4 text-text-secondary" />
                    <span className="text-xs text-text-secondary truncate">{chequeFile ? chequeFile.name : "Choose File"}</span>
                    <input type="file" className="hidden" onChange={e => setChequeFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
            </div>

            <SheetFooter className="pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsAddPartnerOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Save Partner"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Review Agent Modal */}
      {reviewingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border flex justify-between items-center bg-surface-2/50 sticky top-0">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Review Agent: {reviewingAgent.name}</h2>
                <div className="text-[12px] text-text-secondary font-mono">{reviewingAgent.id}</div>
              </div>
              <button onClick={() => setReviewingAgent(null)} className="p-2 hover:bg-surface-2 rounded-md text-text-secondary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Col: Details & Docs */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-[14px] font-bold text-text-primary mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4 text-brand" /> Agency Details
                  </h3>
                  <div className="space-y-3 bg-surface-2/30 p-4 rounded-lg border border-border">
                    <div className="flex gap-2 text-[13px]">
                      <span className="text-text-secondary w-24">Location:</span>
                      <span className="font-medium text-text-primary flex items-center gap-1"><MapPin className="h-3 w-3"/>{reviewingAgent.location}</span>
                    </div>
                    <div className="flex gap-2 text-[13px]">
                      <span className="text-text-secondary w-24">Contact:</span>
                      <span className="font-medium text-text-primary flex items-center gap-1"><Briefcase className="h-3 w-3"/>{reviewingAgent.contact}</span>
                    </div>
                    <div className="flex gap-2 text-[13px]">
                      <span className="text-text-secondary w-24">Email:</span>
                      <span className="font-medium text-text-primary flex items-center gap-1"><Mail className="h-3 w-3"/>{reviewingAgent.email}</span>
                    </div>
                    <div className="flex gap-2 text-[13px]">
                      <span className="text-text-secondary w-24">Phone:</span>
                      <span className="font-medium text-text-primary flex items-center gap-1"><Phone className="h-3 w-3"/>{reviewingAgent.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[14px] font-bold text-text-primary mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand" /> KYC Documents
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(reviewingAgent.documents || {}).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-md border border-border bg-surface hover:border-brand/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded flex items-center justify-center ${val ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                            {val ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="text-[13px] font-medium text-text-primary capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                            <div className="text-[11px] text-text-secondary">{val ? "Uploaded" : 'Not Uploaded'}</div>
                          </div>
                        </div>
                        {val && (
                          <Button variant="ghost" size="sm" className="h-7 px-3 text-[12px]" onClick={() => setViewingDoc({ agentName: reviewingAgent.name, docName: key, url: val as string })}>
                            <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Approval Form */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-[14px] font-bold text-text-primary mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand" /> Set Commercials & Approve
                  </h3>
                  <div className="space-y-4 p-5 rounded-lg border border-border bg-surface-2/30">
                    {reviewingAgent.status === 'Pending KYC' || reviewingAgent.status === 'Rejected' ? (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-medium text-text-primary">Commission Rate (%)</label>
                          <input 
                            type="number" 
                            value={commissionInput}
                            onChange={(e) => setCommissionInput(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand"
                            placeholder="e.g. 15"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-medium text-text-primary">Credit Limit (₹)</label>
                          <input 
                            type="number" 
                            value={creditLimitInput}
                            onChange={(e) => setCreditLimitInput(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand"
                            placeholder="e.g. 200000"
                          />
                        </div>
                        <div className="pt-4 flex gap-3">
                          <Button variant="primary" className="flex-1 justify-center cursor-pointer" onClick={handleApprove} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Approving..." : "Approve Agent"}
                          </Button>
                          <Button variant="outline" className="flex-1 justify-center text-error border-error/30 hover:bg-error/10 cursor-pointer" onClick={handleReject} disabled={updateMutation.isPending}>
                            Reject
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="inline-flex h-12 w-12 rounded-full bg-success/10 text-success items-center justify-center mb-3">
                          <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h4 className="text-[15px] font-bold text-text-primary">Agent Approved</h4>
                        <p className="text-[13px] text-text-secondary mt-1">This agent is active and can book rooms.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal (Nested/Overlay) */}
      {viewingDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface-2/80">
              <div>
                <h3 className="font-bold text-text-primary text-[15px] capitalize">{viewingDoc.docName.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <div className="text-[12px] text-text-secondary">{viewingDoc.agentName}</div>
              </div>
              <button onClick={() => setViewingDoc(null)} className="p-1.5 hover:bg-error/10 hover:text-error rounded-md text-text-secondary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-surface-2/30 p-8 min-h-[400px] flex items-center justify-center">
              {viewingDoc.url ? (
                <div className="w-full text-center space-y-4">
                  <div className="text-xs text-text-secondary">File location:</div>
                  <a href={viewingDoc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 border border-border rounded-md bg-surface text-[13px] text-brand hover:underline">
                    <FileText className="h-4 w-4" /> Open Document in New Tab
                  </a>
                </div>
              ) : (
                <div className="text-center space-y-3 opacity-50">
                  <FileText className="h-16 w-16 mx-auto text-text-secondary" />
                  <p className="text-[14px] font-medium text-text-primary">Document Preview Placeholder</p>
                  <p className="text-[12px]">In production, this will render the PDF or Image.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
