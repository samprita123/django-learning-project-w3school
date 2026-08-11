import type { AIInsight } from "@/types/pms";
import { Card, CardHeader, Button, StatusBadge } from "@/components/ui/Primitives";

function toneFor(
  severity: AIInsight["severity"],
): React.ComponentProps<typeof StatusBadge>["tone"] {
  if (severity === "Critical") return "error";
  if (severity === "Warning") return "warning";
  return "info";
}

export function AIInsightsPanel({ insights }: { insights: AIInsight[] }) {
  return (
    <Card>
      <CardHeader title="AI Insights" hint="Why pricing changed" />
      <div className="space-y-2.5 p-5">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-lg border border-border-subtle bg-surface-2/40 p-3.5"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <StatusBadge tone={toneFor(insight.severity)}>{insight.severity}</StatusBadge>
              <span className="text-[11px] text-text-secondary">
                Confidence {insight.confidence}%
              </span>
            </div>
            <p className="text-[13px] leading-snug text-text-primary">{insight.message}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="line-clamp-1 text-[12px] text-text-secondary">{insight.action}</span>
              <Button variant="outline" size="sm">
                Apply
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default AIInsightsPanel;
