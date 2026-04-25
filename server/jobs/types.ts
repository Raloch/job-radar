import { type JobPosting, type SourceFeedType } from "@/entities/job/types";

export type RawSourceJob = {
  feedId: string;
  sourceType: SourceFeedType;
  sourceName: string;
  externalId?: string;
  sourceUrl: string;
  payload: unknown;
  fetchedAt: string;
};

export type NormalizedSourceJob = Omit<JobPosting, "id" | "sources" | "sourceName" | "sourceUrl"> & {
  feedId: string;
  sourceType: SourceFeedType;
  sourceName: string;
  sourceUrl: string;
  externalId?: string;
};

export type AdapterSyncResult = {
  rawJobs: RawSourceJob[];
  usedFixtureFallback: boolean;
  errorMessage: string | null;
};

export type FeedSyncStatus = "success" | "partial" | "failed";

export type FeedSyncRun = {
  feedId: string;
  sourceName: string;
  sourceType: SourceFeedType;
  status: FeedSyncStatus;
  rawJobsCount: number;
  usedFixtureFallback: boolean;
  errorMessage: string | null;
};

export type SyncRunStatus = "success" | "partial" | "failed";

export type SyncRunRecord = {
  id: string;
  mode: "memory" | "database";
  status: SyncRunStatus;
  startedAt: string;
  finishedAt: string;
  totalRawJobs: number;
  totalAggregatedJobs: number;
  totalSources: number;
  errorMessage: string | null;
  sourceRuns: FeedSyncRun[];
};
