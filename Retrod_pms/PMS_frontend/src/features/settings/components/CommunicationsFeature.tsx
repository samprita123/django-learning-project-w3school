import { useState } from "react";
import { Send, Plus } from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  StatusBadge,
  Button,
  KpiCard,
} from "@/components/ui/Primitives";
import { useCommThreadsQuery } from "@/services/mock/queries";
import { type CommThread } from "@/types/pms";

export function CommunicationsFeature() {
  const { data: commThreads = [] } = useCommThreadsQuery();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected: CommThread | null =
    commThreads.find((t) => t.id === selectedId) ?? commThreads[0] ?? null;
  const unread = commThreads.reduce((a, t) => a + t.unread, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Guests"
        title="Guest Communication Center"
        description="Unified SMS, email, and WhatsApp threads tied to each stay."
        actions={
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            New message
          </Button>
        }
      />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Unread threads" value={String(unread)} accent="brand" />
          <KpiCard label="Avg response" value="18 min" accent="info" />
          <KpiCard label="Templates sent" value="47" accent="success" />
          <KpiCard label="Failed deliveries" value="2" deltaTone="error" accent="error" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_300px]">
          <Card>
            <CardHeader title="Inbox" hint={`${unread} unread`} />
            <ul className="divide-y divide-border-subtle max-h-[520px] overflow-y-auto scrollbar-thin">
              {commThreads.map((t) => (
                <li
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-surface-2/60 transition ${
                    selected?.id === t.id ? "bg-primary-tint/30" : ""
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                    {t.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-[13px] font-medium text-text-primary">
                        {t.name}
                      </span>
                      <span className="text-[10px] text-text-disabled">{t.time}</span>
                    </div>
                    <div className="truncate text-[12px] text-text-secondary">{t.last}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge tone="neutral">{t.channel}</StatusBadge>
                      {t.unread > 0 && (
                        <span className="rounded-sm bg-primary px-1.5 py-px text-[10px] font-medium text-primary-foreground">
                          {t.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="flex flex-col">
            {selected ? (
              <>
                <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
                  <div>
                    <div className="text-[14px] font-semibold text-text-primary">
                      {selected.name}
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      {selected.resId} · {selected.channel}
                    </div>
                  </div>
                  <StatusBadge tone="info">{selected.stayStatus}</StatusBadge>
                </div>
                <div className="min-h-[400px] flex-1 space-y-3 p-5">
                  {selected.id === "TH-2" ? (
                    <>
                      <Bubble from="them" text="Could I get a late checkout please?" time="09:18" />
                      <Bubble
                        from="me"
                        text="Of course. We can hold your room until 14:00 — is that helpful?"
                        time="09:21"
                      />
                      <Bubble from="them" text="That works perfectly. Thank you." time="09:22" />
                    </>
                  ) : (
                    <Bubble from="them" text={selected.last} time={selected.time} />
                  )}
                </div>
                <div className="border-t border-border-subtle p-3">
                  <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 focus-within:border-primary">
                    <input
                      className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-text-disabled"
                      placeholder="Type a message…"
                    />
                    <button
                      type="button"
                      className="rounded-md bg-primary p-1.5 text-primary-foreground hover:bg-primary-pressed transition"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-5 text-[13px] text-text-secondary">
                No communication threads available.
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Guest context" />
            {selected ? (
              <div className="space-y-3 p-5 text-[13px]">
                <div>
                  <div className="label-uppercase">Reservation</div>
                  <div className="mt-1 font-mono font-medium">{selected.resId}</div>
                </div>
                <div>
                  <div className="label-uppercase">Stay status</div>
                  <div className="mt-1">{selected.stayStatus}</div>
                </div>
                <div>
                  <div className="label-uppercase">Preferred channel</div>
                  <div className="mt-1">{selected.channel}</div>
                </div>
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Use template
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Mark resolved
                </Button>
              </div>
            ) : (
              <div className="p-5 text-[13px] text-text-secondary">
                Select a thread to view guest context.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Bubble({ from, text, time }: { from: "me" | "them"; text: string; time: string }) {
  return (
    <div className={`flex ${from === "me" ? "justify-end" : ""}`}>
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 text-[13px] ${
          from === "me" ? "bg-primary text-primary-foreground" : "bg-surface-2 text-text-primary"
        }`}
      >
        <div>{text}</div>
        <div
          className={`mt-1 text-right text-[10px] ${from === "me" ? "text-primary-foreground/70" : "text-text-disabled"}`}
        >
          {time}
        </div>
      </div>
    </div>
  );
}
export default CommunicationsFeature;
