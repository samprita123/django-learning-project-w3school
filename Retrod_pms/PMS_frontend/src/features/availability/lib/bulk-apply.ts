import type { AvailabilityCell, AvailabilityRestriction, AvailabilityStatus } from "@/types/pms";

export type BulkAvailabilityInput = {
  dateFrom: string;
  dateTo: string;
  roomTypeIds: string[];
  status: AvailabilityStatus;
  restrictions: AvailabilityRestriction[];
  updatedBy: string;
};

export function applyBulkAvailability(
  cells: AvailabilityCell[],
  input: BulkAvailabilityInput,
): { next: AvailabilityCell[]; affected: number } {
  const { dateFrom, dateTo, roomTypeIds, status, restrictions, updatedBy } = input;
  if (!dateFrom || !dateTo || roomTypeIds.length === 0) {
    return { next: cells, affected: 0 };
  }

  let affected = 0;
  const next = cells.map((cell) => {
    if (!roomTypeIds.includes(cell.roomTypeId)) return cell;
    if (cell.date < dateFrom || cell.date > dateTo) return cell;
    affected += 1;
    return {
      ...cell,
      status,
      restrictions: [...restrictions],
      updatedAt: new Date().toISOString(),
      updatedBy,
    };
  });

  return { next, affected };
}
