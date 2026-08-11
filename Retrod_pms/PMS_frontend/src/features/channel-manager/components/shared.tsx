import { Filter } from "lucide-react";
import { Button } from "@/components/ui/Primitives";
import { SU_CHANNELS, type SuChannel } from "@/types/channel-manager";

export function ChannelFilterToolbar({
  channel,
  onChannel,
  onSync,
  syncing,
}: {
  channel: SuChannel | "All";
  onChannel: (c: SuChannel | "All") => void;
  onSync?: () => void;
  syncing?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={channel}
        onChange={(e) => onChannel(e.target.value as SuChannel | "All")}
        className="h-8 rounded-md border border-border bg-surface px-2 text-[12px]"
      >
        <option value="All">All channels</option>
        {SU_CHANNELS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {onSync && (
        <Button variant="outline" size="sm" onClick={onSync} disabled={syncing}>
          <Filter className="h-3.5 w-3.5" />
          {syncing ? "Syncing…" : "Sync via SU"}
        </Button>
      )}
    </div>
  );
}

export function LoadingBlock() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-lg border border-border bg-surface-2/60"
        />
      ))}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-[var(--color-error)]/30 bg-[oklch(0.985_0.03_27)] p-4 text-[13px]">
      <p className="font-medium text-text-primary">Sync error</p>
      <p className="mt-1 text-text-secondary">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-[12px] font-medium text-primary hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function mapTone(s: string) {
  if (s === "Mapped" || s === "Synced" || s === "Connected" || s === "Success")
    return "success" as const;
  if (s === "Mismatch" || s === "Warning" || s === "Pending" || s === "Conflict" || s === "Drift")
    return "warning" as const;
  if (s === "Unmapped" || s === "Error" || s === "Failed" || s === "Disconnected")
    return "error" as const;
  return "neutral" as const;
}

export const fmtINR = (n: number) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(1)} L`
    : n >= 1000
      ? `₹${(n / 1000).toFixed(1)}k`
      : `₹${n}`;
