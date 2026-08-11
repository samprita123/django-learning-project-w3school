import { suClient } from "@/services/su/client";
import { updateSuAvailabilitySyncJob } from "@/services/su/availability-store";
import type { AvailabilityCell } from "@/types/pms";

export type SuAvailabilitySyncOutcome = {
  jobId: string;
  source: "su-api" | "mock";
};

export async function queueAvailabilitySuSync(
  cells: AvailabilityCell[],
): Promise<SuAvailabilitySyncOutcome> {
  const cellIds = cells.map((cell) => cell.id);
  const syncRes = await suClient.syncAvailability(cellIds);
  return { jobId: syncRes.data.id, source: syncRes.meta.source };
}

export function simulateAvailabilitySyncJobCompletion(
  jobId: string,
  onComplete: (success: boolean) => void,
  delayMs = 1400,
) {
  updateSuAvailabilitySyncJob(jobId, { status: "in_progress" });
  window.setTimeout(() => {
    const success = Math.random() > 0.08;
    updateSuAvailabilitySyncJob(jobId, {
      status: success ? "success" : "error",
      completedAt: new Date().toISOString(),
      message: success
        ? "Availability and restrictions pushed to SU channel manager."
        : "SU availability sync failed — retry from Availability Management.",
    });
    onComplete(success);
  }, delayMs);
}
