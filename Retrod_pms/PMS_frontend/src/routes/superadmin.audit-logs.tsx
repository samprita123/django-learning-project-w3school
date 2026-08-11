import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, Card, Button } from "@/components/ui/Primitives";
import { fetchApi } from "@/services/api/core";
import { toast } from "sonner";
import { RefreshCw, Search, Filter, ShieldAlert, ChevronLeft, ChevronRight, Eye, Building2, User, Globe, Calendar } from "lucide-react";

export interface SuperadminAuditLog {
  id: string;
  timestamp: string;
  actor_name: string;
  actor_role_code: string;
  action_type: string;
  target_entity: string;
  target_id: string;
  ip_address?: string;
  user_agent?: string;
  payload_after?: any;
  tenant_id?: string;
}

export interface TenantSimple {
  id: string;
  name: string;
  company_name: string;
}

export const Route = createFileRoute("/superadmin/audit-logs")({
  head: () => ({ meta: [{ title: "Superadmin Detailed Audit Logs — Retrod PMS" }] }),
  component: SuperadminAuditLogsPage,
});

function SuperadminAuditLogsPage() {
  const [logs, setLogs] = useState<SuperadminAuditLog[]>([]);
  const [tenants, setTenants] = useState<TenantSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [selectedTenant, setSelectedTenant] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [last24HoursOnly, setLast24HoursOnly] = useState(false);

  // Modal payload view
  const [activeLog, setActiveLog] = useState<SuperadminAuditLog | null>(null);

  const fetchTenants = async () => {
    try {
      const data = await fetchApi<any>("/api/tenants/");
      setTenants(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      // silently ignore tenant fetch error
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("page", page.toString());
      query.append("page_size", pageSize.toString());

      if (selectedTenant) query.append("tenant_id", selectedTenant);
      if (search.trim()) query.append("search", search.trim());
      if (actionFilter) query.append("action_type", actionFilter);
      if (last24HoursOnly) query.append("last_24_hours", "true");

      const res = await fetchApi<any>(`/api/superadmin-audit-logs/?${query.toString()}`);
      if (res && typeof res === "object" && "results" in res) {
        setLogs(res.results || []);
        setTotalCount(res.count || 0);
      } else if (Array.isArray(res)) {
        setLogs(res);
        setTotalCount(res.length);
      } else {
        setLogs([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      toast.error("Failed to load audit logs: " + (err.message || err));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, selectedTenant, actionFilter, last24HoursOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const getActionBadge = (action: string) => {
    if (action.includes("LOGIN") || action.includes("OTP")) {
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    }
    if (action.includes("LOGOUT")) {
      return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
    if (action.includes("POST") || action.includes("CREATE")) {
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
    if (action.includes("PATCH") || action.includes("PUT") || action.includes("UPDATE")) {
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    }
    if (action.includes("DELETE")) {
      return "bg-rose-500/10 text-rose-600 border-rose-500/20";
    }
    return "bg-primary/10 text-primary border-primary/20";
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Platform Operations"
        title="Cross-Tenant Audit Logs"
        description="Comprehensive audit trail of all platform operations, tenant modifications, authentication events, and administrative changes."
        actions={
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        }
      />

      <div className="responsive-page-x space-y-6">
        {/* Filters Bar */}
        <Card className="p-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search actor, action, IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Tenant Select */}
            <div>
              <select
                value={selectedTenant}
                onChange={(e) => {
                  setSelectedTenant(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary"
              >
                <option value="">All Tenants (Global)</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.company_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Type Filter */}
            <div>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary"
              >
                <option value="">All Action Types</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="POST">POST (Creations)</option>
                <option value="PATCH">PATCH / PUT (Updates)</option>
                <option value="DELETE">DELETE (Removals)</option>
              </select>
            </div>

            {/* Submit & 24h Toggle */}
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-[12px] font-medium text-text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={last24HoursOnly}
                  onChange={(e) => {
                    setLast24HoursOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span>Last 24 Hours</span>
              </label>

              <Button type="submit" size="sm">
                Apply Search
              </Button>
            </div>
          </form>
        </Card>

        {/* Logs Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-text-primary">Audit Log Trail</h3>
            <span className="text-[12px] text-text-secondary">{totalCount} Log Events Found</span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-[13px] text-text-secondary">Retrieving audit events...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <ShieldAlert className="h-10 w-10 text-text-disabled mx-auto" />
              <h4 className="text-[14px] font-bold text-text-primary">No Audit Logs Found</h4>
              <p className="text-[12px] text-text-secondary max-w-sm mx-auto">
                No log entries match the current filter criteria. Try clearing search filters or broadening date selection.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead className="bg-surface-2/50 text-text-secondary text-[11px] uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-2/20 transition-colors">
                      <td className="py-3 px-4 text-text-secondary whitespace-nowrap">
                        <div className="font-medium text-text-primary">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-[10.5px] text-text-disabled font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-text-primary">{log.actor_name}</div>
                        <div className="text-[10px] text-text-muted font-mono uppercase">
                          {log.actor_role_code}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-[11px] font-mono font-medium truncate max-w-[220px] ${getActionBadge(
                            log.action_type
                          )}`}
                          title={log.action_type}
                        >
                          {log.action_type}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-text-secondary font-medium">
                        {log.target_entity}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11.5px] text-text-muted">
                        {log.ip_address || "N/A"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {log.payload_after ? (
                          <button
                            onClick={() => setActiveLog(log)}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition inline-flex items-center gap-1 text-[11.5px] font-medium"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Data
                          </button>
                        ) : (
                          <span className="text-[11px] text-text-disabled italic">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between">
              <span className="text-[12px] text-text-secondary">
                Page {page} of {totalPages} ({totalCount} items)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Payload Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-xl shadow-2xl p-6 w-full max-w-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <div>
                <h3 className="text-[16px] font-bold text-text-primary">Audit Payload Details</h3>
                <p className="text-[12px] text-text-secondary">
                  Event ID: <span className="font-mono">{activeLog.id}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveLog(null)}
                className="text-text-secondary hover:text-text-primary text-sm font-medium"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[12px]">
              <div className="bg-surface-2 p-3 rounded-lg space-y-1">
                <div>
                  <span className="text-text-secondary">Actor:</span>{" "}
                  <strong className="text-text-primary">{activeLog.actor_name}</strong> ({activeLog.actor_role_code})
                </div>
                <div>
                  <span className="text-text-secondary">Action:</span>{" "}
                  <span className="text-primary font-bold">{activeLog.action_type}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Timestamp:</span>{" "}
                  {new Date(activeLog.timestamp).toLocaleString()}
                </div>
                <div>
                  <span className="text-text-secondary">IP Address:</span> {activeLog.ip_address || "N/A"}
                </div>
                {activeLog.user_agent && (
                  <div className="text-[10.5px] text-text-disabled truncate">
                    <span className="text-text-secondary">UA:</span> {activeLog.user_agent}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-text-secondary font-sans font-bold text-[12px]">Recorded Payload Data:</span>
                <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto text-[11.5px] leading-relaxed">
                  {JSON.stringify(activeLog.payload_after, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border shrink-0">
              <Button variant="outline" onClick={() => setActiveLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
