import { randomUUID } from "node:crypto";

import { filterJobs, sortJobs } from "@/entities/job/model";
import { type JobSearchParams } from "@/entities/job/types";
import { fetchGreenhouseJobs } from "@/server/jobs/adapters/greenhouse-adapter";
import { fetchLeverJobs } from "@/server/jobs/adapters/lever-adapter";
import { fetchManualImportJobs } from "@/server/jobs/adapters/manual-import-adapter";
import { mergeNormalizedJob } from "@/server/jobs/dedupe";
import { normalizeSourceJob } from "@/server/jobs/normalizers";
import { loadPersistedSnapshot, persistSnapshot } from "@/server/jobs/persistence";
import { getSourceFeedConfig, getSourceFeeds } from "@/server/jobs/source-feeds";
import { getJobStore } from "@/server/jobs/store";
import { type FeedSyncRun, type SyncRunStatus } from "@/server/jobs/types";

function getFeedRunStatus(errorMessage: string | null, rawJobsCount: number): FeedSyncRun["status"] {
  if (errorMessage && rawJobsCount === 0) return "failed";
  if (errorMessage) return "partial";
  return "success";
}

function getRunStatus(sourceRuns: FeedSyncRun[]): SyncRunStatus {
  if (sourceRuns.length && sourceRuns.every((run) => run.status === "failed")) return "failed";
  if (sourceRuns.some((run) => run.status !== "success")) return "partial";
  return "success";
}

async function syncAllSources() {
  const allFeeds = await getSourceFeeds();
  const activeFeeds = allFeeds.filter((feed) => feed.isActive);
  const startedAt = new Date().toISOString();
  const rawJobsByFeed = await Promise.all(
    activeFeeds.map(async (feed) => {
      if (feed.type === "manual") return fetchManualImportJobs(feed);
      if (feed.type === "greenhouse") return fetchGreenhouseJobs(feed);
      return fetchLeverJobs(feed);
    }),
  );

  const sourceRuns: FeedSyncRun[] = activeFeeds.map((feed, index) => {
    const result = rawJobsByFeed[index];
    return {
      feedId: feed.id,
      sourceName: feed.name,
      sourceType: feed.type,
      status: getFeedRunStatus(result.errorMessage, result.rawJobs.length),
      rawJobsCount: result.rawJobs.length,
      usedFixtureFallback: result.usedFixtureFallback,
      errorMessage: result.errorMessage,
    };
  });

  const rawJobs = rawJobsByFeed.flatMap((result) => result.rawJobs);
  const postings = new Map<string, import("@/entities/job/types").JobPosting>();

  for (const rawJob of rawJobs) {
    const normalizedJob = normalizeSourceJob(rawJob);
    mergeNormalizedJob(postings, normalizedJob);
  }

  const store = getJobStore();
  store.rawJobs = rawJobs;
  store.jobs = Array.from(postings.values());
  store.lastSyncedAt = new Date().toISOString();
  store.totalRawJobs = rawJobs.length;
  store.totalAggregatedJobs = store.jobs.length;
  store.totalSources = activeFeeds.length;
  const syncRun = {
    id: randomUUID(),
    mode: process.env.DATABASE_URL ? "database" : "memory",
    status: getRunStatus(sourceRuns),
    startedAt,
    finishedAt: store.lastSyncedAt,
    totalRawJobs: store.totalRawJobs,
    totalAggregatedJobs: store.totalAggregatedJobs,
    totalSources: store.totalSources,
    errorMessage: sourceRuns
      .filter((run) => run.errorMessage)
      .map((run) => `${run.sourceName}: ${run.errorMessage}`)
      .join(" | ") || null,
    sourceRuns,
  } as const;
  store.recentRuns = [syncRun, ...store.recentRuns].slice(0, 10);

  await persistSnapshot({
    sourceFeeds: activeFeeds,
    rawJobs,
    jobs: store.jobs,
    lastSyncedAt: store.lastSyncedAt,
    syncRun,
  });

  return {
    totalRawJobs: store.totalRawJobs,
    totalAggregatedJobs: store.totalAggregatedJobs,
    totalSources: store.totalSources,
    lastSyncedAt: store.lastSyncedAt,
    status: syncRun.status,
    sourceRuns: syncRun.sourceRuns,
  };
}

export async function ensureJobsSynced() {
  const store = getJobStore();
  if (!store.jobs.length) {
    const persisted = await loadPersistedSnapshot();

    if (persisted?.jobs.length) {
      store.jobs = persisted.jobs;
      store.rawJobs = [];
      store.lastSyncedAt = persisted.lastSyncedAt;
      store.totalRawJobs = persisted.totalRawJobs;
      store.totalAggregatedJobs = persisted.totalAggregatedJobs;
      store.totalSources = persisted.totalSources;
      store.recentRuns = persisted.recentRuns;
      return store;
    }

    await syncAllSources();
  }
  return store;
}

export async function syncJobSources() {
  return syncAllSources();
}

export async function listAggregatedJobs(params: JobSearchParams = {}) {
  const store = await ensureJobsSynced();
  const filtered = filterJobs(store.jobs, params);
  const items = sortJobs(filtered, params.sortBy);
  return {
    items,
    total: items.length,
    lastSyncedAt: store.lastSyncedAt,
  };
}

export async function getAggregatedJobById(id: string) {
  const store = await ensureJobsSynced();
  return store.jobs.find((job) => job.id === id) ?? null;
}

export async function getSourceFilterOptions() {
  const store = await ensureJobsSynced();
  return {
    cities: Array.from(new Set(store.jobs.map((job) => job.city))).sort(),
    tags: Array.from(new Set(store.jobs.flatMap((job) => job.tags))).sort(),
    sources: Array.from(
      new Set(store.jobs.flatMap((job) => job.sources.map((source) => source.sourceName))),
    ).sort(),
    lastSyncedAt: store.lastSyncedAt,
  };
}

export async function getSyncDashboardStatus() {
  const store = await ensureJobsSynced();
  const { config, source, path } = await getSourceFeedConfig();
  const activeFeeds = (await getSourceFeeds()).filter((feed) => feed.isActive);

  return {
    mode: process.env.DATABASE_URL ? "database" : "memory",
    configSource: source,
    configPath: path,
    sourceConfig: config,
    lastSyncedAt: store.lastSyncedAt,
    totalRawJobs: store.totalRawJobs,
    totalAggregatedJobs: store.totalAggregatedJobs || store.jobs.length,
    totalSources: store.totalSources || activeFeeds.length,
    recentRuns: store.recentRuns,
    sources: activeFeeds.map((feed) => ({
      id: feed.id,
      name: feed.name,
      label: feed.label,
      type: feed.type,
      baseUrl: feed.baseUrl,
      siteKey: feed.siteKey ?? null,
      usesFixtureFallback: feed.usesFixtureFallback,
      isActive: feed.isActive,
    })),
  };
}
