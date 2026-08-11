import { useEffect, useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Star, ArrowUpRight, Building, Layers, CheckCircle2, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { PageHeader, KpiCard, Card, CardHeader, StatusBadge, Button } from "@/components/ui/Primitives";
import { fetchApi } from "@/services/api/core";

const fmtCr = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString()}`;
};

export function MultiPropertyFeature() {
  const [properties, setProperties] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [inventoryUnits, setInventoryUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [propsRes, resvRes, unitsRes] = await Promise.all([
        fetchApi<any>("/api/properties/").catch(() => []),
        fetchApi<any>("/api/reservations/bookings/").catch(() => []),
        fetchApi<any>("/api/inventory/units/?limit=1000").catch(() => []),
      ]);

      const propList = Array.isArray(propsRes) ? propsRes : propsRes.results || [];
      const resvList = Array.isArray(resvRes) ? resvRes : resvRes.results || [];
      const unitList = Array.isArray(unitsRes) ? unitsRes : unitsRes.results || [];

      setProperties(propList);
      setReservations(resvList);
      setInventoryUnits(unitList);
    } catch (err) {
      console.error("Failed to load multi-property portfolio data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const propertyMetrics = useMemo(() => {
    return properties.map((prop) => {
      const propUnits = inventoryUnits.filter((u) => u.property === prop.id);
      const totalRooms = propUnits.length;
      const propResvs = reservations.filter((r) => r.property === prop.id || r.property_id === prop.id);
      const activeResvs = propResvs.filter(
        (r) => r.status === "CHECKED_IN" || r.status === "CONFIRMED" || r.status === "IN_HOUSE"
      );

      const occupiedRoomsCount = activeResvs.reduce((acc, b) => acc + (b.room_allocations?.length || 1), 0);
      const occupancy = totalRooms > 0 ? Math.min(100, Math.round((occupiedRoomsCount / totalRooms) * 100)) : 0;
      const totalRevenue = propResvs.reduce((acc, b) => acc + Number(b.total_amount || b.amount || 0), 0);
      const revpar = totalRooms > 0 ? Math.round(totalRevenue / totalRooms) : 0;

      const alerts = propUnits.filter(
        (u) => u.housekeeping_status === "dirty" || u.operational_status === "out_of_order" || !u.floor_id
      ).length;

      return {
        ...prop,
        totalRooms,
        occupancy,
        totalRevenue,
        revpar,
        alerts,
      };
    });
  }, [properties, reservations, inventoryUnits]);

  const avgOcc = useMemo(() => {
    if (propertyMetrics.length === 0) return 0;
    return Math.round(propertyMetrics.reduce((sum, p) => sum + p.occupancy, 0) / propertyMetrics.length);
  }, [propertyMetrics]);

  const totalRev = useMemo(() => {
    return propertyMetrics.reduce((sum, p) => sum + p.totalRevenue, 0);
  }, [propertyMetrics]);

  const totalAlerts = useMemo(() => {
    return propertyMetrics.reduce((sum, p) => sum + p.alerts, 0);
  }, [propertyMetrics]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Intelligence"
        title="Multi-Property Dashboard"
        description="Real-time portfolio command center dynamically powered by live property records."
        actions={
          <Button variant="primary" size="sm" onClick={loadData} disabled={isLoading} className="gap-1.5">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh Live Metrics
          </Button>
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Portfolio occupancy" title="Portfolio occupancy" value={`${avgOcc}%`} accent="brand" icon={<Building className="w-5 h-5 text-brand" />} />
          <KpiCard label="Portfolio revenue" title="Portfolio revenue" value={fmtCr(totalRev)} accent="info" icon={<Layers className="w-5 h-5 text-blue-500" />} />
          <KpiCard label="Properties" title="Properties" value={String(properties.length)} accent="success" icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} />
          <KpiCard
            label="Critical alerts"
            title="Critical alerts"
            value={String(totalAlerts)}
            deltaTone="error"
            accent="error"
            icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-text-secondary gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brand" /> Loading live multi-property portfolio analytics...
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 text-sm text-text-secondary bg-surface rounded-xl border border-border">
            No active properties found in portfolio context.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {propertyMetrics.map((p) => (
              <Card key={p.id} className="p-5 border-border hover:border-primary/40 transition-all shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-[18px] font-semibold text-text-primary">
                      {p.name}{p.code ? ` (${p.code})` : ""}
                    </h3>
                    <p className="text-[12px] text-text-secondary">{p.city || p.address || "Main Property"}</p>
                  </div>
                  <div className="flex items-center gap-0.5 text-[12px] text-[var(--color-gold)] font-semibold">
                    <Star className="h-3.5 w-3.5 fill-current" /> {p.stars || 5}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-[12px] bg-surface-2/40 p-3 rounded-lg border border-border">
                  <div>
                    <div className="label-uppercase text-[9px] text-text-tertiary">Occ</div>
                    <div className="font-bold text-text-primary text-sm">{p.occupancy}%</div>
                  </div>
                  <div>
                    <div className="label-uppercase text-[9px] text-text-tertiary">RevPAR</div>
                    <div className="font-bold text-text-primary text-sm">₹{p.revpar.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="label-uppercase text-[9px] text-text-tertiary">Alerts</div>
                    <div className="font-bold text-text-primary text-sm">{p.alerts}</div>
                  </div>
                </div>

                <div className="mt-3 font-mono text-[15px] font-bold text-text-primary">{fmtCr(p.totalRevenue)}</div>

                {p.alerts > 0 && (
                  <div className="mt-2">
                    <StatusBadge tone="warning">
                      {p.alerts} alert{p.alerts > 1 ? "s" : ""} requiring attention
                    </StatusBadge>
                  </div>
                )}

                <Link
                  to={`/dashboard?property=${p.id}`}
                  onClick={() => localStorage.setItem("retrod:active-property-id", p.id)}
                  className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:text-primary-pressed transition-colors"
                >
                  Drill into property <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            ))}
          </div>
        )}

        {properties.length > 0 && (
          <Card className="border-border">
            <CardHeader title="Live Portfolio Performance" hint="Real-time backend comparison across properties" />
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["Property", "City / Address", "Total Rooms", "Occ %", "Revenue", "RevPAR", "Alerts"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {propertyMetrics.map((p) => (
                  <tr key={p.id} className="border-b border-border-subtle hover:bg-surface-2/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-text-primary">{p.name}{p.code ? ` (${p.code})` : ""}</td>
                    <td className="px-4 py-3 text-text-secondary">{p.city || p.address || "-"}</td>
                    <td className="px-4 py-3 font-mono font-medium">{p.totalRooms} rooms</td>
                    <td className="px-4 py-3 font-mono font-semibold text-primary">{p.occupancy}%</td>
                    <td className="px-4 py-3 font-mono font-bold text-text-primary">{fmtCr(p.totalRevenue)}</td>
                    <td className="px-4 py-3 font-mono">₹{p.revpar.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono">{p.alerts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
export default MultiPropertyFeature;
