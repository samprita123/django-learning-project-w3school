import { MoveRight } from "lucide-react";
import { Card, CardHeader, Button } from "@/components/ui/Primitives";

export function RoomMove() {
  return (
    <Card>
      <CardHeader title="Room move" hint="Transfer folio + key card to new room" />
      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
        <div>
          <div className="label-uppercase mb-2">Current</div>
          <div className="rounded-md border border-border bg-surface p-4">
            <div className="font-mono text-[20px] font-semibold text-text-primary">204</div>
            <div className="text-[12px] text-text-secondary">Deluxe King · John Mathews</div>
            <div className="mt-3 text-[11px] text-text-secondary">
              Folio balance · ₹26,800 · 3 charges
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <MoveRight className="h-7 w-7 text-text-disabled" />
        </div>
        <div>
          <div className="label-uppercase mb-2">New room</div>
          <select className="h-9 w-full rounded-md border border-primary bg-surface px-3 text-[13px]">
            <option>308 · Premier Suite · Ready · ₹+11,000/night</option>
            <option>402 · Heritage Suite · Ready · ₹+24,000/night</option>
            <option>211 · Deluxe King · Ready · ₹0</option>
          </select>
          <label className="mt-3 block">
            <div className="label-uppercase mb-1">Reason</div>
            <input
              className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
              placeholder="Guest preference / maintenance / upgrade"
            />
          </label>
          <div className="mt-3 flex items-center gap-2">
            <input type="checkbox" id="reissue" defaultChecked />
            <label htmlFor="reissue" className="text-[12px]">
              Re-issue key cards · Lock sync
            </label>
          </div>
          <Button className="mt-4 w-full" size="sm">
            Confirm room move
          </Button>
        </div>
      </div>
    </Card>
  );
}
export default RoomMove;
