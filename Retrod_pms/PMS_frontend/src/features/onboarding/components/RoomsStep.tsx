import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Primitives";
import { type OnboardingState, type RoomTypeConfig } from "@/lib/onboarding-store";

interface RoomsStepProps {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  disabled: boolean;
}

const inputCls =
  "h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:opacity-60";

export function RoomsStep({ state, setState, disabled }: RoomsStepProps) {
  const set = (rt: RoomTypeConfig[]) => setState((s) => ({ ...s, roomTypes: rt }));
  const update = (id: string, patch: Partial<RoomTypeConfig>) =>
    set(state.roomTypes.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => set(state.roomTypes.filter((r) => r.id !== id));
  const add = () =>
    set([
      ...state.roomTypes,
      {
        id: `rt${Date.now()}`,
        name: "New Room Type",
        count: 10,
        capacity: 2,
        baseRate: 5000,
        amenities: "",
        description: "",
      },
    ]);
  const total = state.roomTypes.reduce((s, r) => s + r.count, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-text-secondary">
          Total inventory: <span className="font-semibold text-text-primary">{total} rooms</span>
        </div>
        <Button size="sm" variant="outline" onClick={add} disabled={disabled}>
          <Plus className="h-3.5 w-3.5" />
          Add room type
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-2/40">
            <tr className="border-b border-border-subtle bg-surface-2/40 text-left">
              {["Name", "Count", "Capacity", "Base rate", "Amenities", "Description", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {state.roomTypes.map((r) => (
              <tr key={r.id} className="border-t border-border-subtle">
                <td className="px-3 py-2">
                  <input
                    disabled={disabled}
                    className={inputCls}
                    value={r.name}
                    onChange={(e) => update(r.id, { name: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2 w-24">
                  <input
                    disabled={disabled}
                    type="number"
                    className={inputCls}
                    value={r.count}
                    onChange={(e) => update(r.id, { count: Number(e.target.value) })}
                  />
                </td>
                <td className="px-3 py-2 w-24">
                  <input
                    disabled={disabled}
                    type="number"
                    className={inputCls}
                    value={r.capacity}
                    onChange={(e) => update(r.id, { capacity: Number(e.target.value) })}
                  />
                </td>
                <td className="px-3 py-2 w-32">
                  <input
                    disabled={disabled}
                    type="number"
                    className={inputCls}
                    value={r.baseRate}
                    onChange={(e) => update(r.id, { baseRate: Number(e.target.value) })}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    disabled={disabled}
                    className={inputCls}
                    value={r.amenities}
                    onChange={(e) => update(r.id, { amenities: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    disabled={disabled}
                    className={inputCls}
                    value={r.description}
                    onChange={(e) => update(r.id, { description: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2 w-10">
                  <button
                    disabled={disabled}
                    onClick={() => remove(r.id)}
                    className="rounded p-1.5 text-text-secondary hover:bg-[oklch(0.96_0.06_27)] hover:text-[var(--color-error)] disabled:opacity-30 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default RoomsStep;
