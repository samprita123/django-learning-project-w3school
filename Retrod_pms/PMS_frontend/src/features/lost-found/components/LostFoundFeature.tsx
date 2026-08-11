import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2, Upload, Calendar, User, MapPin, Phone, ShieldAlert, Award } from "lucide-react";
import {
  PageHeader,
  KpiCard,
  Button,
  Card,
  CardHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lostFoundApi, LostFoundItemPayload } from "@/services/api/lost-found";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const inputCls = "w-full h-10 px-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand";

export function LostFoundFeature() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [isLogItemOpen, setIsLogItemOpen] = useState(false);

  // Forms state
  const [itemType, setItemType] = useState<"LOST" | "FOUND">("FOUND");
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [locationFound, setLocationFound] = useState("");
  const [finderName, setFinderName] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Action Dialogs state
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [claimedBy, setClaimedBy] = useState("");
  const [isDisposeOpen, setIsDisposeOpen] = useState(false);
  const [disposedReason, setDisposedReason] = useState("");

  // Queries
  const { data: lostFoundItems = [], isLoading: isListLoading } = useQuery({
    queryKey: ["lostFoundItems"],
    queryFn: () => lostFoundApi.getAll().then(res => res.results || res || []),
  });

  const { data: stats = { open_items: 0, awaiting_claim: 0, released_mtd: 0, match_suggestions: 0 }, isLoading: isStatsLoading } = useQuery({
    queryKey: ["lostFoundStats"],
    queryFn: () => lostFoundApi.getStats(),
  });

  const selected = lostFoundItems.find((i: any) => i.id === selectedId) ?? lostFoundItems[0] ?? null;

  const { data: suggestions = [] } = useQuery({
    queryKey: ["lostFoundSuggestions", selected?.id],
    queryFn: () => lostFoundApi.getSuggestions(selected.id),
    enabled: !!selected?.id,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: LostFoundItemPayload) => lostFoundApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lostFoundItems"] });
      queryClient.invalidateQueries({ queryKey: ["lostFoundStats"] });
      setIsLogItemOpen(false);
      setItemName("");
      setDescription("");
      setLocationFound("");
      setFinderName("");
      setGuestName("");
      setGuestContact("");
      setImageFile(null);
      toast.success("Item logged successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to log item.");
    }
  });

  const claimMutation = useMutation({
    mutationFn: ({ id, claimedBy }: { id: string | number, claimedBy: string }) => lostFoundApi.claim(id, claimedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lostFoundItems"] });
      queryClient.invalidateQueries({ queryKey: ["lostFoundStats"] });
      setIsClaimOpen(false);
      setClaimedBy("");
      toast.success("Item claimed successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to claim item.");
    }
  });

  const disposeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string | number, reason: string }) => lostFoundApi.dispose(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lostFoundItems"] });
      queryClient.invalidateQueries({ queryKey: ["lostFoundStats"] });
      setIsDisposeOpen(false);
      setDisposedReason("");
      toast.success("Item disposed successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to dispose item.");
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !description || !locationFound) {
      toast.error("Please fill in the item name, location, and description.");
      return;
    }

    createMutation.mutate({
      item_type: itemType,
      item_name: itemName,
      description,
      location_found: locationFound,
      finder_name: finderName,
      guest_name: guestName,
      guest_contact: guestContact,
      image: imageFile,
    });
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimedBy.trim() || !selected?.id) return;
    claimMutation.mutate({ id: selected.id, claimedBy });
  };

  const handleDisposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disposedReason.trim() || !selected?.id) return;
    disposeMutation.mutate({ id: selected.id, reason: disposedReason });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Lost & Found"
        description="Log, match, and release found items."
        actions={
          <Button size="sm" onClick={() => setIsLogItemOpen(true)} className="cursor-pointer">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Log item
          </Button>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Open items" value={isStatsLoading ? "..." : String(stats.open_items || 0)} accent="brand" />
          <KpiCard label="Awaiting claim" value={isStatsLoading ? "..." : String(stats.awaiting_claim || 0)} accent="warning" />
          <KpiCard label="Released · MTD" value={isStatsLoading ? "..." : String(stats.released_mtd || 0)} accent="success" />
          <KpiCard label="Match suggestions" value={isStatsLoading ? "..." : String(stats.match_suggestions || 0)} accent="info" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader title="Registry" />
            {isListLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface-2/40 text-left">
                      {["ID", "Item", "Location", "Found / Reported", "Status"].map((h) => (
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
                    {lostFoundItems.map((i: any) => (
                      <tr
                        key={i.id}
                        onClick={() => setSelectedId(i.id)}
                        className={`cursor-pointer border-b border-border-subtle hover:bg-surface-2/50 ${selected?.id === i.id ? "bg-primary-tint/30" : ""}`}
                      >
                        <td className="px-4 py-3 font-mono text-[12px]">{i.reference_number || `LF-${i.id}`}</td>
                        <td className="px-4 py-3 font-medium">
                          <div>
                            <div>{i.item_name}</div>
                            <div className="text-[11px] text-text-secondary line-clamp-1">{i.description}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{i.location_found || "Lobby"}</td>
                        <td className="px-4 py-3">
                          {i.created_at ? new Date(i.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : "Today"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            tone={
                              i.status === "REPORTED" || i.status === "Open"
                                ? "warning"
                                : i.status === "MATCHED"
                                  ? "info"
                                  : i.status === "CLAIMED"
                                    ? "success"
                                    : "danger"
                            }
                          >
                            {i.status}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          
          <Card className="flex flex-col h-fit">
            <CardHeader title="Item details" />
            {selected ? (
              <div className="flex flex-col text-[13px]">
                {selected.image && (
                  <div className="relative h-48 w-full border-b border-border-subtle bg-surface-2">
                    <img 
                      src={selected.image} 
                      alt={selected.item_name} 
                      className="absolute inset-0 h-full w-full object-cover" 
                    />
                  </div>
                )}
                <div className="p-5 space-y-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-[16px] font-semibold text-text-primary">{selected.item_name}</h3>
                      <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded bg-brand/10 text-brand">
                        {selected.item_type}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-text-secondary">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/> {selected.location_found}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5"/> {selected.created_at ? new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "Today"}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary">Item Description</div>
                    <p className="leading-relaxed text-text-primary whitespace-pre-wrap">{selected.description}</p>
                  </div>

                  {selected.finder_name && (
                    <div>
                      <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary">Reported / Found By</div>
                      <p className="leading-relaxed text-text-primary flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-text-secondary"/> {selected.finder_name}</p>
                    </div>
                  )}

                  {selected.guest_name && (
                    <div className="bg-surface-2/30 p-3 rounded border border-border">
                      <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary">Associated Guest Info</div>
                      <div className="font-medium text-text-primary">{selected.guest_name}</div>
                      {selected.guest_contact && <div className="text-[12px] text-text-secondary flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3"/> {selected.guest_contact}</div>}
                    </div>
                  )}

                  {selected.status === 'CLAIMED' && (
                    <div className="bg-success/5 border border-success/20 p-3 rounded flex items-start gap-2.5">
                      <Award className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-success text-[12px] uppercase">Claimed & Released</div>
                        <div className="mt-0.5 font-medium text-text-primary text-[12px]">Claimed by: {selected.claimed_by}</div>
                        {selected.claimed_date && <div className="text-[11px] text-text-secondary">{new Date(selected.claimed_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>}
                      </div>
                    </div>
                  )}

                  {selected.status === 'DISPOSED' && (
                    <div className="bg-error/5 border border-error/20 p-3 rounded flex items-start gap-2.5">
                      <ShieldAlert className="h-5 w-5 text-error shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-error text-[12px] uppercase">Disposed / Resolved</div>
                        <div className="mt-0.5 text-text-primary text-[12px] font-medium">Reason: {selected.disposed_reason}</div>
                      </div>
                    </div>
                  )}

                  {/* Actions when reported/matched/awaiting claim */}
                  {selected.status !== 'CLAIMED' && selected.status !== 'DISPOSED' && (
                    <div className="border-t border-border-subtle pt-4 flex gap-2">
                      <Button variant="primary" size="sm" className="flex-1 justify-center cursor-pointer" onClick={() => setIsClaimOpen(true)}>
                        Release / Claim
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 justify-center text-error border-error/20 hover:bg-error/5 cursor-pointer" onClick={() => setIsDisposeOpen(true)}>
                        Dispose
                      </Button>
                    </div>
                  )}

                  {/* Suggestions list section */}
                  {selected.status !== 'CLAIMED' && selected.status !== 'DISPOSED' && (
                    <div className="border-t border-border-subtle pt-4">
                      {suggestions.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Suggested Matches ({suggestions.length})</div>
                          <div className="divide-y divide-border border border-border rounded-md overflow-hidden bg-surface">
                            {suggestions.map((s: any, idx: number) => (
                              <div key={idx} className="p-3 text-[12px] space-y-1">
                                <div className="flex justify-between items-start">
                                  <div className="font-medium text-text-primary">{s.item_name || s.description}</div>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${s.item_type === 'LOST' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>{s.item_type}</span>
                                </div>
                                <div className="text-text-secondary text-[11px]">Location: {s.location_found}</div>
                                {s.guest_name && <div className="text-text-secondary text-[11px]">Guest: {s.guest_name} ({s.guest_contact})</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-md border border-dashed border-border-subtle p-4 text-center">
                          <p className="text-[12px] text-text-secondary">No match found in current records.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 text-[13px] text-text-secondary">No items logged yet.</div>
            )}
          </Card>
        </div>
      </div>

      {/* Log Item Slide-out Sheet */}
      {isLogItemOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity" 
            onClick={() => setIsLogItemOpen(false)} 
          />
          <form onSubmit={handleSave} className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-hidden border-l border-border bg-surface shadow-e3 animate-in slide-in-from-right duration-200">
            <div className="shrink-0 border-b border-border-subtle px-5 py-4">
              <div className="text-[16px] font-semibold text-text-primary">Log new item</div>
              <div className="text-[12px] text-text-secondary">
                Enter details for the found item to add it to the registry.
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Item Type</label>
                <select
                  className={inputCls}
                  value={itemType}
                  onChange={(e: any) => setItemType(e.target.value)}
                >
                  <option value="FOUND">Found Item</option>
                  <option value="LOST">Lost Item</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Short Description / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 12 Pro"
                  className={inputCls}
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Location Found / Lost *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 204 or Lobby"
                  className={inputCls}
                  value={locationFound}
                  onChange={(e) => setLocationFound(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Reported / Found By Name</label>
                <input
                  type="text"
                  placeholder="e.g. Housekeeper Mary"
                  className={inputCls}
                  value={finderName}
                  onChange={(e) => setFinderName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Guest Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className={inputCls}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Guest Contact Info (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. +91 9988776655"
                  className={inputCls}
                  value={guestContact}
                  onChange={(e) => setGuestContact(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Detailed Description *</label>
                <textarea
                  required
                  placeholder="Color, brand, distinguishing features, etc."
                  className="w-full rounded-md border border-border bg-surface p-3 text-[13px] min-h-[100px] focus:outline-none focus:border-brand"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Upload Image (Optional)</label>
                <label className="flex items-center gap-2 border border-dashed border-border hover:border-brand/40 bg-surface px-3 py-2.5 rounded-md cursor-pointer transition">
                  <Upload className="h-4 w-4 text-text-secondary" />
                  <span className="text-xs text-text-secondary truncate">{imageFile ? imageFile.name : "Choose File"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
            <div className="shrink-0 flex justify-end gap-2 border-t border-border-subtle bg-surface-2/50 px-5 py-4">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsLogItemOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Save item"}
              </Button>
            </div>
          </form>
        </>
      )}

      {/* Claim Dialog Modal */}
      <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Claim & Release Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleClaimSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-primary">Claimant Name / Guest Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                className={inputCls}
                value={claimedBy}
                onChange={e => setClaimedBy(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsClaimOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={claimMutation.isPending}>
                {claimMutation.isPending ? "Releasing..." : "Release Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dispose Dialog Modal */}
      <Dialog open={isDisposeOpen} onOpenChange={setIsDisposeOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Dispose / Resolve Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDisposeSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-primary">Reason for Disposal *</label>
              <textarea
                required
                placeholder="e.g. Handed over to police, destroyed, donated..."
                className="w-full rounded-md border border-border bg-surface p-3 text-[13px] min-h-[80px] focus:outline-none focus:border-brand"
                value={disposedReason}
                onChange={e => setDisposedReason(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDisposeOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={disposeMutation.isPending} className="bg-error hover:bg-error-dark text-white border-transparent">
                {disposeMutation.isPending ? "Disposing..." : "Dispose Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LostFoundFeature;
