type SyncSourceStatus = {
  id: string;
  name: string;
  label: string;
  type: "manual" | "greenhouse" | "lever";
  baseUrl: string;
  siteKey: string | null;
  usesFixtureFallback: boolean;
  isActive: boolean;
};

export type SourceFeedEntry = {
  key: string;
  label: string;
};

export type SourceFeedConfig = {
  manualImportEnabled: boolean;
  greenhouseBoards: SourceFeedEntry[];
  leverSites: SourceFeedEntry[];
};

export type SourceFeedConfigResponse = {
  config: SourceFeedConfig;
  source: "env" | "file";
  path: string;
};

export type SourceFeedValidationResult = {
  name: string;
  type: "manual" | "greenhouse" | "lever";
  siteKey: string | null;
  status: "success" | "failed";
  message: string;
  httpStatus: number | null;
};

export type SourceFeedValidationResponse = {
  valid: boolean;
  results: SourceFeedValidationResult[];
};

type FeedSyncRun = {
  feedId: string;
  sourceName: string;
  sourceType: "manual" | "greenhouse" | "lever";
  status: "success" | "partial" | "failed";
  rawJobsCount: number;
  usedFixtureFallback: boolean;
  errorMessage: string | null;
};

type SyncRunRecord = {
  id: string;
  mode: "memory" | "database";
  status: "success" | "partial" | "failed";
  startedAt: string;
  finishedAt: string;
  totalRawJobs: number;
  totalAggregatedJobs: number;
  totalSources: number;
  errorMessage: string | null;
  sourceRuns: FeedSyncRun[];
};

export type SyncDashboardStatus = {
  mode: "memory" | "database";
  configSource: "env" | "file";
  configPath: string;
  sourceConfig: SourceFeedConfig;
  lastSyncedAt: string | null;
  totalRawJobs: number;
  totalAggregatedJobs: number;
  totalSources: number;
  sources: SyncSourceStatus[];
  recentRuns: SyncRunRecord[];
};

export type SyncJobResponse = {
  totalRawJobs: number;
  totalAggregatedJobs: number;
  totalSources: number;
  lastSyncedAt: string | null;
  status: "success" | "partial" | "failed";
  sourceRuns: FeedSyncRun[];
};

async function requestJson<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getSyncDashboardStatus() {
  return requestJson<SyncDashboardStatus>("/api/admin/sync");
}

export async function triggerSyncJobSources() {
  return requestJson<SyncJobResponse>("/api/admin/sync", {
    method: "POST",
  });
}

export async function getSourceFeedConfig() {
  return requestJson<SourceFeedConfigResponse>("/api/admin/source-feeds");
}

export async function updateSourceFeedConfig(config: SourceFeedConfig) {
  return requestJson<SourceFeedConfigResponse>("/api/admin/source-feeds", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });
}

export async function validateSourceFeedConfig(config: SourceFeedConfig) {
  return requestJson<SourceFeedValidationResponse>("/api/admin/source-feeds/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });
}
