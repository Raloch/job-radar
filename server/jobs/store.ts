import { type JobPosting } from "@/entities/job/types";
import { type RawSourceJob, type SyncRunRecord } from "@/server/jobs/types";

type JobAggregationStore = {
  jobs: JobPosting[];
  rawJobs: RawSourceJob[];
  lastSyncedAt: string | null;
  totalRawJobs: number;
  totalAggregatedJobs: number;
  totalSources: number;
  recentRuns: SyncRunRecord[];
};

declare global {
  var __jobRadarAggregationStore__: JobAggregationStore | undefined;
}

export function getJobStore() {
  if (!globalThis.__jobRadarAggregationStore__) {
    globalThis.__jobRadarAggregationStore__ = {
      jobs: [],
      rawJobs: [],
      lastSyncedAt: null,
      totalRawJobs: 0,
      totalAggregatedJobs: 0,
      totalSources: 0,
      recentRuns: [],
    };
  }

  return globalThis.__jobRadarAggregationStore__;
}
