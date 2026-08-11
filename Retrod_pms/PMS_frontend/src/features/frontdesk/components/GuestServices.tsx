import { BellRing, MessageSquare, Package } from "lucide-react";
import { Card, CardHeader, StatusBadge, Button } from "@/components/ui/Primitives";
import type { ComponentProps } from "react";

type BadgeTone = ComponentProps<typeof StatusBadge>["tone"];

export function GuestServices() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader
          title="Messages & wake-up calls"
          action={
            <Button size="sm" variant="outline">
              + New
            </Button>
          }
        />
        <ul className="divide-y divide-border-subtle">
          {[
            { icon: BellRing, t: "06:30 wake-up · Room 204", s: "Scheduled" },
            {
              icon: MessageSquare,
              t: "Message for Tanaka · 'Driver arrived at 09:00'",
              s: "Delivered",
            },
            { icon: BellRing, t: "05:45 wake-up · Room 312", s: "Scheduled" },
          ].map((m, i) => (
            <li key={i} className="flex items-center gap-3 px-5 py-3">
              <m.icon className="h-4 w-4 text-text-secondary" />
              <div className="flex-1 text-[12px] text-text-primary">{m.t}</div>
              <StatusBadge tone="info">{m.s}</StatusBadge>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <CardHeader
          title="Concierge requests"
          action={
            <Button size="sm" variant="outline">
              + New
            </Button>
          }
        />
        <ul className="divide-y divide-border-subtle">
          {[
            { c: "Restaurant", t: "Indian Accent · 8 PM · 4 pax", s: "Confirmed", tone: "success" },
            { c: "Tour", t: "Old Delhi heritage walk · 09:00", s: "In progress", tone: "warning" },
            { c: "Airport", t: "Pickup IGI T3 · BA257 · 14:30", s: "Pending", tone: "neutral" },
          ].map((r, i) => (
            <li key={i} className="px-5 py-3">
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-medium text-text-primary">{r.c}</div>
                <StatusBadge tone={r.tone as BadgeTone}>{r.s}</StatusBadge>
              </div>
              <div className="mt-0.5 text-[11px] text-text-secondary">{r.t}</div>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <CardHeader
          title="Lost & Found"
          action={
            <Button size="sm" variant="outline">
              + Log item
            </Button>
          }
        />
        <ul className="divide-y divide-border-subtle">
          {[
            {
              i: Package,
              item: "Black Ray-Ban sunglasses",
              loc: "Room 204 · housekeeping",
              s: "Found",
              tone: "info",
            },
            {
              i: Package,
              item: "iPhone 15 charger",
              loc: "Lobby table 3",
              s: "Claimed",
              tone: "success",
            },
            {
              i: Package,
              item: "Silk scarf · cream",
              loc: "Pool deck",
              s: "Donated",
              tone: "neutral",
            },
          ].map((x, i) => (
            <li key={i} className="flex items-center gap-3 px-5 py-3">
              <x.i className="h-4 w-4 text-text-secondary" />
              <div className="flex-1">
                <div className="text-[12px] font-medium text-text-primary">{x.item}</div>
                <div className="text-[11px] text-text-secondary">{x.loc}</div>
              </div>
              <StatusBadge tone={x.tone as BadgeTone}>{x.s}</StatusBadge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
export default GuestServices;
