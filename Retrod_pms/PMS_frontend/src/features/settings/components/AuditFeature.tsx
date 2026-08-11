import { useState, useEffect } from "react";
import { PageHeader, Card, CardHeader, Button } from "@/components/ui/Primitives";
import { auditApi, type AuditLog } from "@/services/api/audit";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export function AuditFeature() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [last24HoursOnly, setLast24HoursOnly] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await auditApi.getAuditLogs({
        page,
        page_size: pageSize,
        last_24_hours: last24HoursOnly,
      });
      
      // Since OptionalPageNumberPagination returns { count, results } when page parameter is present
      if (response && typeof response === "object" && "results" in response) {
        setLogs(response.results || []);
        setTotalCount(response.count || 0);
      } else if (Array.isArray(response)) {
        setLogs(response);
        setTotalCount(response.length);
      } else {
        setLogs([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      toast.error("Failed to load audit logs: " + (err.message || err));
      setLogs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, last24HoursOnly]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const formatFriendlyAction = (l: AuditLog) => {
    const action = l.action_type || "";
    
    // LOGIN / LOGOUT / OTP
    if (action === "LOGIN") return "Logged in successfully";
    if (action === "LOGOUT") return "Logged out successfully";
    if (action === "OTP_VERIFY") return "OTP code verified successfully";
    
    // Auth actions
    if (action.includes("/api/auth/change-password/")) return "Password updated successfully";
    if (action.includes("/api/auth/refresh/")) return "Session token refreshed";
    if (action.includes("/api/auth/login/")) return "Authentication login initiated";
    
    // User profile actions
    if (action.includes("/api/users/")) {
      const isPatch = action.startsWith("PATCH");
      const isPost = action.startsWith("POST");
      const isDelete = action.startsWith("DELETE");
      
      if (isPatch) {
        const payload = l.payload_after;
        if (payload && typeof payload === "object" && ("avatar_url" in payload || "avatarUrl" in payload)) {
          return "Profile picture updated successfully";
        }
        return "Profile details updated successfully";
      }
      if (isPost) return "New staff member registered successfully";
      if (isDelete) return "Staff member deleted successfully";
      return "User record modified";
    }
    
    // Tenant Config
    if (action.includes("/api/tenant-configurations/")) return "Tenant settings updated successfully";
    
    // Department
    if (action.includes("/api/departments/")) {
      if (action.startsWith("POST")) return "New department created successfully";
      if (action.startsWith("PATCH") || action.startsWith("PUT")) return "Department details updated successfully";
      if (action.startsWith("DELETE")) return "Department deleted successfully";
    }

    // Shifts
    if (action.includes("/api/shifts/")) {
      if (action.startsWith("POST")) return "New shift timing created successfully";
      if (action.startsWith("PATCH") || action.startsWith("PUT")) return "Shift timing updated successfully";
      if (action.startsWith("DELETE")) return "Shift timing deleted successfully";
    }

    // Clean formatting fallback for other endpoints
    try {
      const parts = action.split(" ");
      if (parts.length === 2) {
        const method = parts[0];
        const rawPath = parts[1];
        const cleanPath = rawPath
          .split("/")
          .filter(Boolean)
          .filter((p) => !(p.length > 8 && p.includes("-"))) // filter out UUIDs
          .join(" ");
        return `${method} ${cleanPath} successful`;
      }
    } catch {}

    return action;
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Audit Logs"
        description="Every consequential action, recorded with timestamp and actor."
      />
      <div className="p-6 space-y-4">
        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border p-4 rounded-lg shadow-e1">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold mb-1">Timeframe Filter</span>
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    setLast24HoursOnly(true);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-l-md border ${
                    last24HoursOnly
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface text-text-primary border-border hover:bg-surface-2"
                  }`}
                >
                  Last 24 Hours
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLast24HoursOnly(false);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-r-md border-y border-r ${
                    !last24HoursOnly
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface text-text-primary border-border hover:bg-surface-2"
                  }`}
                >
                  All Logs
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold mb-1">Page Size</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-md border border-border px-2.5 py-1.5 text-[12px] font-medium bg-surface text-text-primary outline-none focus:ring-1 focus:ring-primary"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchLogs()} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Audit Log Card / Table */}
        <Card>
          <CardHeader
            title={last24HoursOnly ? "Recent Activity (Last 24 Hours)" : "All System Activity"}
            hint={loading ? "Fetching logs..." : `Showing ${logs.length} of ${totalCount} records`}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["Timestamp", "User / Actor", "Role", "Action Description", "Target Entity", "IP Address"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-surface">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-text-secondary">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-[12px]">Loading audit logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-text-secondary">
                      No matching audit records found.
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id} className="hover:bg-surface-2/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-[12px] text-text-secondary">
                        {formatTimestamp(l.timestamp)}
                      </td>
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {l.actor_name}
                      </td>
                      <td className="px-4 py-3 text-text-secondary font-mono text-[11px] uppercase">
                        {l.actor_role_code?.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-sm bg-primary-tint/10 px-2 py-0.5 text-[12px] font-medium text-primary-pressed border border-primary/10">
                          {formatFriendlyAction(l)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary font-mono text-[11px]">
                        {l.target_entity}
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-text-disabled">
                        {l.ip_address || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-5">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page === 1 || loading}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page === totalPages || loading}>
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-[12px] text-text-secondary">
                    Showing <span className="font-semibold text-text-primary">{(page - 1) * pageSize + 1}</span> to{" "}
                    <span className="font-semibold text-text-primary">
                      {Math.min(page * pageSize, totalCount)}
                    </span>{" "}
                    of <span className="font-semibold text-text-primary">{totalCount}</span> results
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[12px] text-text-secondary">
                    Page <span className="font-semibold text-text-primary">{page}</span> of{" "}
                    <span className="font-semibold text-text-primary">{totalPages}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={page === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={page === totalPages || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AuditFeature;
