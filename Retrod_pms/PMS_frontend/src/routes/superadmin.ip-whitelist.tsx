import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, Card, Button } from "@/components/ui/Primitives";
import { fetchApi } from "@/services/api/core";
import { toast } from "sonner";
import { ShieldCheck, Plus, Trash2, CheckCircle, XCircle, Globe, RefreshCw, AlertTriangle } from "lucide-react";

export interface SuperadminIPItem {
  id: string;
  ip_address: string;
  description: string | null;
  created_by_name: string;
  created_at: string;
  is_active: boolean;
}

export const Route = createFileRoute("/superadmin/ip-whitelist")({
  head: () => ({ meta: [{ title: "Superadmin IP Whitelisting — Retrod PMS" }] }),
  component: SuperadminIPWhitelistPage,
});

function SuperadminIPWhitelistPage() {
  const [ips, setIps] = useState<SuperadminIPItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIp, setNewIp] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [clientIp, setClientIp] = useState<string | null>(null);

  const fetchIPs = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<SuperadminIPItem[]>("/api/superadmin-ip-whitelist/");
      setIps(Array.isArray(data) ? data : (data as any).results || []);
    } catch (err: any) {
      toast.error("Failed to load IP whitelist: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIPs();
    // Fetch client's current IP
    fetch("https://api.ipify.org?format=json")
      ? fetch("https://api.ipify.org?format=json")
          .then((res) => res.json())
          .then((data) => setClientIp(data.ip))
          .catch(() => setClientIp(null))
      : null;
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) {
      toast.error("IP Address is required");
      return;
    }
    setSubmitting(true);
    try {
      await fetchApi("/api/superadmin-ip-whitelist/", {
        method: "POST",
        body: JSON.stringify({
          ip_address: newIp.trim(),
          description: newDescription.trim() || null,
          is_active: true,
        }),
      });
      toast.success("IP Address whitelisted successfully");
      setIsModalOpen(false);
      setNewIp("");
      setNewDescription("");
      fetchIPs();
    } catch (err: any) {
      toast.error("Failed to add IP: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (item: SuperadminIPItem) => {
    try {
      await fetchApi(`/api/superadmin-ip-whitelist/${item.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      toast.success(`IP status updated to ${!item.is_active ? "Active" : "Inactive"}`);
      fetchIPs();
    } catch (err: any) {
      toast.error("Failed to update IP status: " + (err.message || err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this IP from the whitelist?")) return;
    try {
      await fetchApi(`/api/superadmin-ip-whitelist/${id}/`, {
        method: "DELETE",
      });
      toast.success("IP address removed from whitelist");
      fetchIPs();
    } catch (err: any) {
      toast.error("Failed to delete IP: " + (err.message || err));
    }
  };

  const handleAddCurrentIp = () => {
    if (clientIp) {
      setNewIp(clientIp);
      setNewDescription("My Current IP Location");
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Platform Security"
        title="Superadmin IP Whitelisting"
        description="Restrict access to Platform Superadmin operations to explicitly authorized IP addresses."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchIPs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Whitelisted IP
            </Button>
          </div>
        }
      />

      <div className="responsive-page-x space-y-6">
        {/* Info Banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1 text-[13px]">
            <span className="font-semibold text-text-primary block">
              Superadmin Security Enforcement Status
            </span>
            <p className="text-text-secondary leading-relaxed">
              {ips.filter((i) => i.is_active).length > 0 ? (
                <span className="text-emerald-600 font-medium">
                  Enforcement Active — Superadmin APIs are restricted to {ips.filter((i) => i.is_active).length} whitelisted IP(s).
                </span>
              ) : (
                <span className="text-amber-600 font-medium">
                  Enforcement Inactive — No active IP rules set. Superadmin APIs are currently accessible from any IP address.
                </span>
              )}
            </p>
            {clientIp && (
              <div className="pt-1 flex items-center gap-2 text-[12px] text-text-muted">
                <Globe className="h-3.5 w-3.5" />
                <span>Your detected IP: <strong className="font-mono text-text-primary">{clientIp}</strong></span>
                {!ips.some((i) => i.ip_address === clientIp && i.is_active) && (
                  <button
                    onClick={handleAddCurrentIp}
                    className="text-primary hover:underline text-[11px] font-medium ml-1"
                  >
                    + Whitelist Current IP
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* IP List Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-text-primary">Whitelisted IP Addresses</h3>
            <span className="text-[12px] text-text-secondary">{ips.length} Total Rules</span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-[13px] text-text-secondary">Loading whitelist rules...</p>
            </div>
          ) : ips.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto opacity-70" />
              <div className="space-y-1">
                <h4 className="text-[14px] font-bold text-text-primary">No IP Restrictions Configured</h4>
                <p className="text-[12px] text-text-secondary max-w-md mx-auto">
                  Add your IP address to ensure unauthorized devices cannot access sensitive platform administrative controls.
                </p>
              </div>
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add First IP
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-surface-2/50 text-text-secondary text-[11px] uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Added By</th>
                    <th className="py-3 px-4">Date Added</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {ips.map((item) => {
                    const isMyIp = clientIp === item.ip_address;
                    return (
                      <tr key={item.id} className="hover:bg-surface-2/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-text-primary">
                          <div className="flex items-center gap-2">
                            {item.ip_address}
                            {isMyIp && (
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans font-medium">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {item.description || <span className="text-text-disabled italic">No description</span>}
                        </td>
                        <td className="py-3 px-4 text-text-secondary font-medium">
                          {item.created_by_name || "Superadmin"}
                        </td>
                        <td className="py-3 px-4 text-text-muted text-[12px]">
                          {new Date(item.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleActive(item)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                              item.is_active
                                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                : "bg-surface-2 text-text-muted hover:bg-surface-3"
                            }`}
                          >
                            {item.is_active ? (
                              <>
                                <CheckCircle className="h-3 w-3" /> Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" /> Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg text-text-disabled hover:text-destructive hover:bg-destructive/10 transition"
                            title="Delete Rule"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Whitelist IP Address
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary text-sm font-medium"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-text-primary uppercase tracking-wide">
                  IP Address *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.1 or 203.0.113.195"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  required
                />
                {clientIp && (
                  <button
                    type="button"
                    onClick={() => setNewIp(clientIp)}
                    className="text-[11px] text-primary hover:underline mt-0.5 inline-block"
                  >
                    Use my current IP ({clientIp})
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-text-primary uppercase tracking-wide">
                  Description / Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Office HQ VPN, Admin Laptop"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Add to Whitelist"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
