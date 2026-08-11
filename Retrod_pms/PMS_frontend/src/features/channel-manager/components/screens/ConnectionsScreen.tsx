import { useMemo, useState } from "react";
import { Plug, RefreshCcw, Settings } from "lucide-react";
import { Button, Card, CardHeader, KpiCard, StatusBadge } from "@/components/ui/Primitives";
import { suClient } from "@/services/su/client";
import type { SuChannel } from "@/types/channel-manager";
import { ChannelManagerShell } from "../ChannelManagerShell";
import { useSuData } from "../../hooks/useSuData";
import { ChannelFilterToolbar, fmtINR, LoadingBlock, ErrorBlock, mapTone } from "../shared";

export function ConnectionsScreen() {
  const { data, loading, error, reload } = useSuData(() => suClient.getConnections());
  const [channel, setChannel] = useState<SuChannel | "All">("All");
  const [syncing, setSyncing] = useState(false);

  const filtered = useMemo(
    () => (channel === "All" ? (data ?? []) : (data ?? []).filter((c) => c.channel === channel)),
    [data, channel],
  );

  const live = data?.filter((c) => c.status === "Connected").length ?? 0;
  const errors =
    data?.filter((c) => c.status === "Error" || c.status === "Disconnected").length ?? 0;

  const handleSync = async () => {
    setSyncing(true);
    try {
      await suClient.triggerSync({
        channels: channel === "All" ? undefined : [channel],
        types: ["Inventory", "Rates"],
      });
      reload();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ChannelManagerShell
      title="OTA Connection Management"
      description="Connect, configure, and monitor all OTA channels through SU Channel Manager."
      actions={
        <Button size="sm">
          <Plug className="h-3.5 w-3.5" />
          Add channel
        </Button>
      }
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Connected" value={String(live)} accent="success" />
            <KpiCard label="Disconnected / error" value={String(errors)} accent="error" />
            <KpiCard
              label="Total bookings · MTD"
              value={String(data.reduce((a, c) => a + c.bookingsMtd, 0))}
              accent="info"
            />
            <KpiCard
              label="Total revenue"
              value={fmtINR(data.reduce((a, c) => a + c.revenueMtd, 0))}
              accent="brand"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <ChannelFilterToolbar
              channel={channel}
              onChannel={setChannel}
              onSync={handleSync}
              syncing={syncing}
            />
            <Button variant="outline" size="sm" onClick={reload}>
              <RefreshCcw className="h-3.5 w-3.5" />
              Refresh status
            </Button>
          </div>

          <Card>
            <CardHeader title="Channel connections" hint="SU property ID · PROP-1001" />
            <div className="table-scroll-shadow overflow-x-auto">
              <table className="w-full min-w-[900px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    {[
                      "Channel",
                      "Status",
                      "Last sync",
                      "Commission",
                      "Bookings",
                      "Revenue",
                      "Parity",
                      "Actions",
                    ].map((h) => (
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
                  {filtered.map((c) => (
                    <tr
                      key={c.channel}
                      className="border-b border-border-subtle hover:bg-surface-2/30"
                    >
                      <td className="px-4 py-3 font-medium">{c.channel}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={mapTone(c.status)}>{c.status}</StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{c.lastSync}</td>
                      <td className="px-4 py-3">{c.commission}</td>
                      <td className="px-4 py-3 font-mono">{c.bookingsMtd}</td>
                      <td className="px-4 py-3 font-mono">{fmtINR(c.revenueMtd)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={mapTone(c.parity)}>
                          {c.parity}
                          {c.parityDelta ? ` · ${c.parityDelta}` : ""}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-3.5 w-3.5" />
                          Configure
                        </Button>
                      </td>
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
