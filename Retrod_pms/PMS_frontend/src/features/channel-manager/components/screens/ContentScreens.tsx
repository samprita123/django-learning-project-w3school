import { useState } from "react";
import { Image, Upload, FileText, RefreshCcw } from "lucide-react";
import { Button, Card, CardHeader, KpiCard, StatusBadge } from "@/components/ui/Primitives";
import { suClient } from "@/services/su/client";
import { SU_CHANNELS, type SuChannel } from "@/types/channel-manager";
import { ChannelManagerShell } from "../ChannelManagerShell";
import { useSuData } from "../../hooks/useSuData";
import { ChannelFilterToolbar, LoadingBlock, ErrorBlock, mapTone } from "../shared";

export function PropertyContentScreen() {
  const { data, loading, error, reload } = useSuData(() => suClient.getPropertyContent());
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await suClient.triggerSync({ types: ["Content"] });
      reload();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ChannelManagerShell
      title="Property Content Management"
      description="Sync property name, description, policies, and check-in details to all OTAs."
      actions={
        <Button size="sm" onClick={handleSync} disabled={syncing}>
          <RefreshCcw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          Push content
        </Button>
      }
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <KpiCard label="Content fields" value={String(data.length)} accent="brand" />
            <KpiCard label="Synced channels" value={String(SU_CHANNELS.length)} accent="success" />
            <KpiCard
              label="Errors"
              value={String(
                data.filter((f) => Object.values(f.channels).some((c) => c?.status === "Error"))
                  .length,
              )}
              accent="error"
            />
          </div>

          <Card>
            <CardHeader title="Property content fields" hint="PMS master → OTA distribution" />
            <div className="table-scroll-shadow overflow-x-auto">
              <table className="w-full min-w-[900px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                      Field
                    </th>
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                      PMS value
                    </th>
                    {SU_CHANNELS.slice(0, 4).map((ch) => (
                      <th
                        key={ch}
                        className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                      >
                        {ch}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr
                      key={row.field}
                      className="border-b border-border-subtle hover:bg-surface-2/30"
                    >
                      <td className="px-4 py-3 font-medium">{row.field}</td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-text-secondary">
                        {row.pmsValue}
                      </td>
                      {SU_CHANNELS.slice(0, 4).map((ch) => {
                        const c = row.channels[ch];
                        return (
                          <td key={ch} className="px-3 py-3">
                            {c ? (
                              <>
                                <StatusBadge tone={mapTone(c.status)}>{c.status}</StatusBadge>
                                <p className="mt-1 max-w-[120px] truncate text-[11px] text-text-secondary">
                                  {c.value}
                                </p>
                              </>
                            ) : (
                              <span className="text-text-disabled">—</span>
                            )}
                          </td>
                        );
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

export function RoomContentScreen() {
  const { data, loading, error, reload } = useSuData(() => suClient.getRoomContent());

  return (
    <ChannelManagerShell
      title="Room Content Management"
      description="Room descriptions, amenities, bed types, and occupancy limits synced to OTAs."
      actions={
        <Button size="sm">
          <FileText className="h-3.5 w-3.5" />
          Edit content
        </Button>
      }
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <KpiCard label="Room types" value={String(data.length)} accent="brand" />
            <KpiCard
              label="Synced"
              value={String(data.filter((r) => r.syncStatus === "Synced").length)}
              accent="success"
            />
            <KpiCard
              label="Warnings"
              value={String(data.filter((r) => r.syncStatus === "Warning").length)}
              accent="warning"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((room) => (
              <Card key={room.roomType} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[14px] font-semibold text-text-primary">{room.roomType}</h3>
                  <StatusBadge tone={mapTone(room.syncStatus)}>{room.syncStatus}</StatusBadge>
                </div>
                <p className="mt-2 text-[12px] text-text-secondary">
                  {room.bedType} · Max {room.maxOccupancy} guests
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {room.amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-sm bg-surface-2 px-2 py-0.5 text-[11px] text-text-secondary"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  Sync to channels
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}
    </ChannelManagerShell>
  );
}

export function ImageManagementScreen() {
  const { data, loading, error, reload } = useSuData(() => suClient.getImages());
  const [channel, setChannel] = useState<SuChannel | "All">("All");

  const pending =
    data?.filter((img) => Object.values(img.channels).some((s) => s === "Pending" || s === "Error"))
      .length ?? 0;

  return (
    <ChannelManagerShell
      title="Image Management"
      description="Manage room and property images distributed to OTAs via SU image sync."
      actions={
        <Button size="sm">
          <Upload className="h-3.5 w-3.5" />
          Upload images
        </Button>
      }
    >
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard label="Total images" value={String(data.length)} accent="brand" />
            <KpiCard
              label="Primary images"
              value={String(data.filter((i) => i.primary).length)}
              accent="info"
            />
            <KpiCard label="Pending / errors" value={String(pending)} accent="warning" />
            <KpiCard
              label="Room types"
              value={String(new Set(data.map((i) => i.roomType)).size)}
              accent="success"
            />
          </div>

          <ChannelFilterToolbar
            channel={channel}
            onChannel={setChannel}
            onSync={async () => {
              await suClient.triggerSync({ types: ["Images"] });
              reload();
            }}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((img) => (
              <Card key={img.id} className="overflow-hidden">
                <div className="flex h-32 items-center justify-center bg-surface-2">
                  <Image className="h-10 w-10 text-text-disabled" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-medium text-text-primary">{img.label}</p>
                      <p className="text-[11px] text-text-secondary">{img.roomType}</p>
                    </div>
                    {img.primary && <StatusBadge tone="success">Primary</StatusBadge>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {Object.entries(img.channels)
                      .filter(([ch]) => channel === "All" || ch === channel)
                      .map(([ch, status]) => (
                        <StatusBadge key={ch} tone={mapTone(status)}>
                          {ch.split(".")[0]}
                        </StatusBadge>
                      ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Push to channels
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </ChannelManagerShell>
  );
}
