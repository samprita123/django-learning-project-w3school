import type { OnboardingState } from "@/lib/onboarding-store";
import { ROOM_TYPE_OPTIONS } from "@/features/rate-plans/lib/constants";
import { fetchAvailabilityCells, saveAvailabilityCells } from "@/services/mock/data-layer";
import type { AvailabilityCell } from "@/types/pms";

function resolveRoomTypeId(name: string): string {
  const exact = ROOM_TYPE_OPTIONS.find((room) => room.name.toLowerCase() === name.toLowerCase());
  if (exact) return exact.id;
  if (name.toLowerCase().includes("deluxe") && name.toLowerCase().includes("king")) {
    return "rt-deluxe-king";
  }
  if (name.toLowerCase().includes("suite")) return "rt-premier-suite";
  return `onb-${name.toLowerCase().replace(/\s+/g, "-").slice(0, 20)}`;
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function publishOnboardingToAvailability(
  state: OnboardingState,
): Promise<AvailabilityCell[]> {
  const existing = await fetchAvailabilityCells();
  const startDate = new Date().toISOString().slice(0, 10);
  const horizonDays = 30;

  const roomTypes = state.roomTypes.map((room) => ({
    id: resolveRoomTypeId(room.name),
    name: room.name,
    total: room.count,
  }));

  const withoutOnboarding = existing.filter((cell) => !cell.id.startsWith("onb-"));
  const published: AvailabilityCell[] = [];

  for (let d = 0; d < horizonDays; d++) {
    const date = addDays(startDate, d);
    for (const room of roomTypes) {
      published.push({
        id: `onb-${room.id}-${date}`,
        date,
        roomTypeId: room.id,
        status: "open",
        restrictions: [],
        total: room.total,
        sold: 0,
        allocated: room.total,
        updatedAt: new Date().toISOString(),
        updatedBy: "Onboarding",
      });
    }
  }

  const merged = [...withoutOnboarding.filter((c) => !c.id.startsWith("onb-")), ...published];
  await saveAvailabilityCells(merged);
  return merged;
}

export function onboardingAvailabilityReadiness(state: OnboardingState): {
  roomCount: number;
  totalInventory: number;
} {
  const roomCount = state.roomTypes.length;
  const totalInventory = state.roomTypes.reduce((sum, room) => sum + room.count, 0);
  return { roomCount, totalInventory };
}
