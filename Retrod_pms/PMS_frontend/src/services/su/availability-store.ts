import type { SuAvailabilitySyncJob } from "@/types/channel-manager";

const LS_SU_AVAIL_SYNC_JOBS = "retrod:su:availability-sync-jobs:v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function listSuAvailabilitySyncJobs(): SuAvailabilitySyncJob[] {
  return readJson<SuAvailabilitySyncJob[]>(LS_SU_AVAIL_SYNC_JOBS, []);
}

export function enqueueSuAvailabilitySyncJob(
  cellIds: string[],
  recordsPushed: number,
): SuAvailabilitySyncJob {
  const job: SuAvailabilitySyncJob = {
    id: `AV-JOB-${Date.now()}`,
    cellIds,
    status: "queued",
    queuedAt: new Date().toISOString(),
    recordsPushed,
  };
  writeJson(LS_SU_AVAIL_SYNC_JOBS, [job, ...listSuAvailabilitySyncJobs()].slice(0, 50));
  return job;
}

export function updateSuAvailabilitySyncJob(
  jobId: string,
  patch: Partial<SuAvailabilitySyncJob>,
): SuAvailabilitySyncJob | undefined {
  const jobs = listSuAvailabilitySyncJobs();
  let updated: SuAvailabilitySyncJob | undefined;
  const next = jobs.map((job) => {
    if (job.id !== jobId) return job;
    updated = { ...job, ...patch };
    return updated;
  });
  if (updated) writeJson(LS_SU_AVAIL_SYNC_JOBS, next);
  return updated;
}

export function getSuAvailabilitySyncJob(jobId: string): SuAvailabilitySyncJob | undefined {
  return listSuAvailabilitySyncJobs().find((job) => job.id === jobId);
}
