import { useState } from "react";
import { Plus } from "lucide-react";
import {
  PageHeader,
  KpiCard,
  Button,
  Card,
  CardHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import { useLoyaltyMembersQuery } from "@/services/mock/queries";

export function LoyaltyFeature() {
  const { data: loyaltyMembers = [] } = useLoyaltyMembersQuery();

  const [tab, setTab] = useState<"members" | "tiers">("members");
  const platinum = loyaltyMembers.filter((m) => m.tier === "Platinum").length;

  return (
    <div>
      <PageHeader
        eyebrow="Guests"
        title="Loyalty Program"
        description="Tiers, points, redemptions, and member campaigns."
        actions={
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Adjust points
          </Button>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Active members" value="1,842" accent="brand" />
          <KpiCard label="Points issued · MTD" value="284k" accent="info" />
          <KpiCard label="Platinum members" value={String(platinum)} accent="success" />
          <KpiCard label="Redemptions · MTD" value="126" accent="warning" />
        </div>
        <div className="flex rounded-md border border-border bg-surface p-0.5 text-[12px] w-fit">
          {(["members", "tiers"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded px-3 py-1 capitalize ${tab === t ? "bg-foreground text-background" : "text-text-secondary"}`}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "members" && (
          <Card>
            <CardHeader title="Members" hint={`${loyaltyMembers.length} shown`} />
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["Member", "Tier", "Balance", "Lifetime", "Last activity", ""].map((h) => (
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
                {loyaltyMembers.map((m) => (
                  <tr key={m.id} className="border-b border-border-subtle hover:bg-surface-2/50">
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={m.tier === "Platinum" ? "brand" : "warning"}>
                        {m.tier}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 font-mono">{m.points.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono">{m.lifetimePoints.toLocaleString()}</td>
                    <td className="px-4 py-3 text-text-secondary">{m.lastActivity}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-[12px] font-medium text-primary">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
        {tab === "tiers" && (
          <Card className="p-5">
            <div className="grid gap-3 sm:grid-cols-4">
              {["Platinum · 50k pts", "Gold · 20k pts", "Silver · 8k pts", "Bronze · 0 pts"].map(
                (t) => (
                  <div
                    key={t}
                    className="rounded-md border border-border-subtle p-4 text-[13px] font-medium"
                  >
                    {t}
                  </div>
                ),
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
export default LoyaltyFeature;
