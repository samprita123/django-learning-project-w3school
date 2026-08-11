import { Card, CardHeader } from "@/components/ui/Primitives";

interface DemandCalendarProps {
  heat: number[];
}

export function DemandCalendar({ heat }: DemandCalendarProps) {
  return (
    <Card>
      <CardHeader title="Demand calendar" hint="Next 30 days" />
      <div className="p-5">
        <div className="grid grid-cols-10 gap-1.5">
          {heat.map((v, i) => {
            const intensity = v / 100;
            return (
              <div
                key={i}
                className="aspect-square rounded-sm transition hover:scale-110"
                title={`Day ${i + 1} · ${v}% demand`}
                style={{
                  background: `color-mix(in oklch, var(--color-primary) ${intensity * 100}%, var(--color-surface-2))`,
                }}
              />
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-text-secondary">
          <span>Low</span>
          <div className="flex gap-1">
            {[10, 30, 50, 70, 90].map((v) => (
              <div
                key={v}
                className="h-3 w-6 rounded-sm"
                style={{
                  background: `color-mix(in oklch, var(--color-primary) ${v}%, var(--color-surface-2))`,
                }}
              />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>
    </Card>
  );
}
export default DemandCalendar;
