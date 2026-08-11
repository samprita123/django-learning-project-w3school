import type { SuRatePlanDefinition, SuRatePlanSyncJob } from "@/types/channel-manager";

const LS_SU_RATE_PLANS = "retrod:su:rate-plans:v1";
const LS_SU_SYNC_JOBS = "retrod:su:rate-plan-sync-jobs:v1";

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

export function listSuRatePlanDefinitions(): SuRatePlanDefinition[] {
  return readJson<SuRatePlanDefinition[]>(LS_SU_RATE_PLANS, []);
}

export function getSuRatePlanDefinition(code: string): SuRatePlanDefinition | undefined {
  return listSuRatePlanDefinitions().find(
    (item) => item.externalRatePlanCode.toUpperCase() === code.toUpperCase(),
  );
}

export function upsertSuRatePlanDefinition(definition: SuRatePlanDefinition): SuRatePlanDefinition {
  const list = listSuRatePlanDefinitions();
  const idx = list.findIndex(
    (item) =>
      item.externalRatePlanCode.toUpperCase() === definition.externalRatePlanCode.toUpperCase(),
  );
  const next =
    idx >= 0 ? list.map((item, i) => (i === idx ? definition : item)) : [...list, definition];
  writeJson(LS_SU_RATE_PLANS, next);
  return definition;
}

export function listSuRatePlanSyncJobs(): SuRatePlanSyncJob[] {
  return readJson<SuRatePlanSyncJob[]>(LS_SU_SYNC_JOBS, []);
}

export function enqueueSuRatePlanSyncJob(
  codes: string[],
  recordsPushed: number,
): SuRatePlanSyncJob {
  const job: SuRatePlanSyncJob = {
    id: `RP-JOB-${Date.now()}`,
    ratePlanCodes: codes,
    status: "queued",
    queuedAt: new Date().toISOString(),
    recordsPushed,
  };
  writeJson(LS_SU_SYNC_JOBS, [job, ...listSuRatePlanSyncJobs()].slice(0, 50));
  return job;
}

export function updateSuRatePlanSyncJob(
  jobId: string,
  patch: Partial<SuRatePlanSyncJob>,
): SuRatePlanSyncJob | undefined {
  const jobs = listSuRatePlanSyncJobs();
  let updated: SuRatePlanSyncJob | undefined;
  const next = jobs.map((job) => {
    if (job.id !== jobId) return job;
    updated = { ...job, ...patch };
    return updated;
  });
  if (updated) writeJson(LS_SU_SYNC_JOBS, next);
  return updated;
}

export function getSuRatePlanSyncJob(jobId: string): SuRatePlanSyncJob | undefined {
  return listSuRatePlanSyncJobs().find((job) => job.id === jobId);
}
