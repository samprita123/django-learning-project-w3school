import { Card, CardHeader } from "@/components/ui/Primitives";
import { useActivityFeedQuery } from "@/services/mock/queries";

export function ActivityFeed() {
  const { data: activityFeed = [] } = useActivityFeedQuery();

  return (
    <Card>
      <CardHeader title="Activity" hint="Live feed" />
      <ul className="max-h-[180px] space-y-3 overflow-y-auto p-5 scrollbar-thin">
        {activityFeed.map((e, i) => (
          <li key={i} className="flex gap-3 text-[12px]">
            <span className="font-mono text-[11px] text-text-disabled">{e.time}</span>
            <span className="text-text-secondary">{e.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
