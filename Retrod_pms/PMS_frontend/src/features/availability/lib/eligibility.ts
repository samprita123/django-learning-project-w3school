import { ROOM_TYPE_OPTIONS } from "@/features/rate-plans/lib/constants";
import type { AvailabilityCell } from "@/types/pms";

export function getStayDates(checkIn: string, checkOut: string): string[] {
  if (!checkIn || !checkOut) return [];
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  if (end <= start) return [];
  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor < end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function resolveRoomTypeId(roomTypeName: string): string | undefined {
  return ROOM_TYPE_OPTIONS.find((room) => room.name === roomTypeName)?.id;
}

export function isCellBookable(
  cell: AvailabilityCell,
  options: { isArrival?: boolean; isDeparture?: boolean } = {},
): boolean {
  if (cell.status === "closed") return false;
  if (cell.restrictions.includes("stop_sell")) return false;
  if (options.isArrival && cell.restrictions.includes("cta")) return false;
  if (options.isDeparture && cell.restrictions.includes("ctd")) return false;
  if (cell.total - cell.sold <= 0) return false;
  return true;
}

export function availabilityBlockReason(
  cells: AvailabilityCell[],
  roomTypeName: string,
  checkIn: string,
  checkOut: string,
  cellMap?: Map<string, AvailabilityCell>
): string | null {
  const roomTypeId = resolveRoomTypeId(roomTypeName);
  if (!roomTypeId) return null;

  const stayDates = getStayDates(checkIn, checkOut);
  if (stayDates.length === 0) return null;

  const getCell = (rId: string, date: string) => {
    if (cellMap) return cellMap.get(`${rId}_${date}`);
    return cells.find((c) => c.roomTypeId === rId && c.date === date);
  };

  for (let i = 0; i < stayDates.length; i++) {
    const date = stayDates[i];
    const cell = getCell(roomTypeId, date);
    if (!cell) continue;

    const isArrival = date === checkIn;
    const isDeparture = date === checkOut;
    if (!isCellBookable(cell, { isArrival, isDeparture })) {
      if (cell.status === "closed") return `${roomTypeName} is closed on ${date}.`;
      if (cell.restrictions.includes("stop_sell"))
        return `Stop sell on ${date} for ${roomTypeName}.`;
      if (isArrival && cell.restrictions.includes("cta"))
        return `Close to arrival (CTA) on ${date}.`;
      if (cell.total - cell.sold <= 0) return `${roomTypeName} sold out on ${date}.`;
    }
  }

  const departureCell = getCell(roomTypeId, checkOut);
  if (departureCell?.restrictions.includes("ctd")) {
    return `Close to departure (CTD) on ${checkOut}.`;
  }

  return null;
}

export type BookableRoomOption = {
  id: string;
  name: string;
  freeMin: number;
  blocked: boolean;
  blockReason?: string;
};

export function listBookableRoomTypes(
  cells: AvailabilityCell[],
  checkIn: string,
  checkOut: string,
): BookableRoomOption[] {
  const stayDates = getStayDates(checkIn, checkOut);
  const cellMap = new Map<string, AvailabilityCell>();
  for (const c of cells) {
    cellMap.set(`${c.roomTypeId}_${c.date}`, c);
  }

  return ROOM_TYPE_OPTIONS.map((room) => {
    const relevant = stayDates
      .map((date) => cellMap.get(`${room.id}_${date}`))
      .filter((cell): cell is AvailabilityCell => !!cell);

    const freeValues = relevant.map((cell) => cell.total - cell.sold);
    const freeMin = freeValues.length
      ? Math.min(...freeValues)
      : room.id === "rt-deluxe-king"
        ? 12
        : 5;
    const blockReason = availabilityBlockReason(cells, room.name, checkIn, checkOut, cellMap);

    return {
      id: room.id,
      name: room.name,
      freeMin: Math.max(0, freeMin),
      blocked: !!blockReason,
      blockReason: blockReason ?? undefined,
    };
  });
}
