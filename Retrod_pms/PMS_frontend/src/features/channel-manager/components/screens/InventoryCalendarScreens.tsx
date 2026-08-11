import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { Button, Card, CardHeader, KpiCard, StatusBadge } from "@/components/ui/Primitives";
import { suClient } from "@/services/su/client";
import { SU_CHANNELS, type SuChannel } from "@/types/channel-manager";
import { ChannelManagerShell } from "../ChannelManagerShell";
import { useSuData } from "../../hooks/useSuData";
import { ChannelFilterToolbar, LoadingBlock, ErrorBlock } from "../shared";

const DAYS = Array.from({ length: 10 }, (_, i) => i + 15);

export function InventoryScreen() {
  const { data, loading, error, reload } = useSuData(() => suClient.getInventory());
  const [channel, setChannel] = useState<SuChannel | "All">("All");
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await suClient.triggerSync({
        types: ["Inventory"],
        channels: channel === "All" ? undefined : [channel],
      });
      reload();
    } finally {
      setSyncing(false);
    }
  };

  const totals = useMemo(() => {
    if (!data) return { allocated: 0, sold: 0, available: 0 };
    return data.reduce(
      (acc, row) => {
        const chs = channel === "All" ? SU_CHANNELS : [channel];
        for (const ch of chs) {
          acc.allocated += row.channels[ch].allocated;
          acc.sold += row.channels[ch].sold;
          acc.available += row.channels[ch].available;
        }
        return acc;
      },
      { allocated: 0, sold: 0, available: 0 },
    );
  }, [data, channel]);

  return (
    <ChannelManagerShell
      title="Inventory Management"
      description="Channel-level allocation, sold counts, and available inventory synced via SU."
      actions={
        <Button size="sm" onClick={handleSync} disabled={syncing}>
          <RefreshCcw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          Push inventory
        </Button>
      }
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Allocated" value={String(totals.allocated)} accent="info" />
            <KpiCard label="Sold" value={String(totals.sold)} accent="brand" />
            <KpiCard label="Available" value={String(totals.available)} accent="success" />
            <KpiCard label="Room types" value={String(data.length)} accent="warning" />
          </div>

          <ChannelFilterToolbar
            channel={channel}
            onChannel={setChannel}
            onSync={handleSync}
            syncing={syncing}
          />

          <Card>
            <CardHeader title="Channel inventory" hint="Allocated / sold / available per OTA" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                      Room type
                    </th>
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                      Total
                    </th>
                    {(channel === "All" ? SU_CHANNELS.slice(0, 4) : [channel]).map((ch) => (
                      <th
                        key={ch}
                        colSpan={3}
                        className="border-l border-border-subtle px-3 py-2.5 text-center text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                      >
                        {ch}
                      </th>
                    ))}
                  </tr>
                  <tr className="border-b border-border bg-surface-2/20 text-left">
                    <th colSpan={2} />
                    {(channel === "All" ? SU_CHANNELS.slice(0, 4) : [channel]).map((ch) =>
                      ["Alloc", "Sold", "Avail"].map((h) => (
                        <th
                          key={`${ch}-${h}`}
                          className="border-l border-border-subtle px-2 py-1.5 text-[9px] font-medium uppercase text-text-disabled"
                        >
                          {h}
                        </th>
                      )),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr
                      key={row.roomType}
                      className="border-b border-border-subtle hover:bg-surface-2/30"
                    >
                      <td className="px-4 py-3 font-medium">{row.roomType}</td>
                      <td className="px-4 py-3 font-mono">{row.total}</td>
                      {(channel === "All" ? SU_CHANNELS.slice(0, 4) : [channel]).flatMap((ch) => {
                        const inv = row.channels[ch];
                        return [
                          <td
                            key={`${row.roomType}-${ch}-a`}
                            className="border-l border-border-subtle px-2 py-3 font-mono text-center"
                          >
                            {inv.allocated}
                          </td>,
                          <td
                            key={`${row.roomType}-${ch}-s`}
                            className="px-2 py-3 font-mono text-center"
                          >
                            {inv.sold}
                          </td>,
                          <td
                            key={`${row.roomType}-${ch}-v`}
                            className="px-2 py-3 font-mono text-center text-primary-pressed"
                          >
                            {inv.available}
                          </td>,
                        ];
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </ChannelManagerShell>
  );
}

function CalendarNav() {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5">
      <button
        type="button"
        className="rounded p-1 text-text-secondary hover:bg-surface-2 transition"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      <span className="px-2 text-[12px] font-medium text-text-primary">15 May → 24 May</span>
      <button
        type="button"
        className="rounded p-1 text-text-secondary hover:bg-surface-2 transition"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function AvailabilityCalendarScreen() {
  const { data, loading, error, reload } = useSuData(() => suClient.getAvailability(15, 24));
  const [roomFilter, setRoomFilter] = useState("All");

  const roomTypes = useMemo(() => [...new Set(data?.map((c) => c.roomType) ?? [])], [data]);
  const filteredTypes =
    roomFilter === "All" ? roomTypes : roomTypes.filter((t) => t === roomFilter);

  return (
    <ChannelManagerShell
      title="Availability Calendar"
      description="Daily availability and stop-sell status pushed to OTAs via SU inventory sync."
      actions={<CalendarNav />}
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Days in view" value={String(DAYS.length)} accent="info" />
            <KpiCard
              label="Stop-sell cells"
              value={String(data.filter((c) => c.stopSell).length)}
              accent="error"
            />
            <KpiCard
              label="Avg availability"
              value={`${Math.round((data.reduce((a, c) => a + c.available / c.total, 0) / data.length) * 100)}%`}
              accent="success"
            />
            <KpiCard label="Room types" value={String(roomTypes.length)} accent="brand" />
          </div>

          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="h-8 rounded-md border border-border bg-surface px-2 text-[12px]"
          >
            <option value="All">All room types</option>
            {roomTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <Card>
            <CardHeader title="Availability grid" hint="Available rooms · red = stop sell" />
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div
                  className="grid border-b border-border-subtle bg-surface-2/40"
                  style={{ gridTemplateColumns: `160px repeat(${DAYS.length}, 1fr)` }}
                >
                  <div className="label-uppercase px-4 py-2.5">Room type</div>
                  {DAYS.map((d) => (
                    <div
                      key={d}
                      className="border-l border-border-subtle py-2 text-center text-[11px] text-text-secondary"
                    >
                      {d} May
                    </div>
                  ))}
                </div>
                {filteredTypes.map((rt) => (
                  <div
                    key={rt}
                    className="grid border-b border-border-subtle hover:bg-surface-2/40"
                    style={{ gridTemplateColumns: `160px repeat(${DAYS.length}, 1fr)` }}
                  >
                    <div className="px-4 py-3 text-[13px] font-medium">{rt}</div>
                    {DAYS.map((d) => {
                      const cell = data.find((c) => c.date === d && c.roomType === rt);
                      const stop = cell?.stopSell;
                      return (
                        <div key={d} className="border-l border-border-subtle px-1 py-2">
                          <button
                            type="button"
                            className={`w-full rounded px-1.5 py-1.5 text-center text-[11px] font-mono transition hover:ring-2 hover:ring-primary/20 ${
                              stop
                                ? "bg-[oklch(0.985_0.03_27)] text-[var(--color-error)] line-through"
                                : "bg-surface-2/50 text-text-primary"
                            }`}
                          >
                            {cell ? `${cell.available}/${cell.total}` : "—"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}
    </ChannelManagerShell>
  );
}

export function RateCalendarScreen() {
  const { data, loading, error, reload } = useSuData(() => suClient.getRates(15, 24));
  const [channel, setChannel] = useState<SuChannel | "All">("All");

  const roomTypes = useMemo(() => [...new Set(data?.map((c) => c.roomType) ?? [])], [data]);

  return (
    <ChannelManagerShell
      title="Rate Management Calendar"
      description="Daily BAR rates synced to OTAs. Edit and push rate changes via SU rate sync."
      actions={
        <Button variant="outline" size="sm">
          Bulk update rates
        </Button>
      }
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Rate cells" value={String(data.length)} accent="brand" />
            <KpiCard
              label="Avg BAR"
              value={`₹${Math.round(data.reduce((a, c) => a + c.amount, 0) / data.length / 1000)}k`}
              accent="success"
            />
            <KpiCard label="Weekend uplift" value="18%" accent="warning" />
            <KpiCard label="Rate plan" value="BAR Flexible" accent="info" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ChannelFilterToolbar
              channel={channel}
              onChannel={setChannel}
              onSync={async () => {
                await suClient.triggerSync({ types: ["Rates"] });
                reload();
              }}
            />
            <CalendarNav />
          </div>

          <Card>
            <CardHeader title="Rate calendar" hint="₹ per night · BAR Flexible" />
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div
                  className="grid border-b border-border-subtle bg-surface-2/40"
                  style={{ gridTemplateColumns: `160px repeat(${DAYS.length}, 1fr)` }}
                >
                  <div className="label-uppercase px-4 py-2.5">Room type</div>
                  {DAYS.map((d) => (
                    <div
                      key={d}
                      className="border-l border-border-subtle py-2 text-center text-[11px] text-text-secondary"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                {roomTypes.map((rt) => (
                  <div
                    key={rt}
                    className="grid border-b border-border-subtle hover:bg-surface-2/40"
                    style={{ gridTemplateColumns: `160px repeat(${DAYS.length}, 1fr)` }}
                  >
                    <div className="px-4 py-3 text-[13px] font-medium">{rt}</div>
                    {DAYS.map((d) => {
                      const cell = data.find((c) => c.date === d && c.roomType === rt);
                      const wknd = d % 7 === 6 || d % 7 === 0;
                      return (
                        <div key={d} className="border-l border-border-subtle px-1 py-2">
                          <button
                            type="button"
                            className={`w-full rounded px-1.5 py-1.5 text-center text-[11px] font-mono transition hover:bg-primary-tint ${
                              wknd
                                ? "bg-primary-tint/40 text-primary-pressed font-medium"
                                : "text-text-primary"
                            }`}
                          >
                            {cell ? `${(cell.amount / 1000).toFixed(1)}k` : "—"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}
    </ChannelManagerShell>
  );
}
