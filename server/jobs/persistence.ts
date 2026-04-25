import { type Prisma } from "@prisma/client";

import { type JobPosting, type JobSource } from "@/entities/job/types";
import { getPrismaClient } from "@/server/db/prisma";
import { type SourceFeed } from "@/server/jobs/source-feeds";
import { type RawSourceJob, type SyncRunRecord } from "@/server/jobs/types";

type PersistedSnapshot = {
  jobs: JobPosting[];
  lastSyncedAt: string | null;
  totalRawJobs: number;
  totalAggregatedJobs: number;
  totalSources: number;
  recentRuns: SyncRunRecord[];
};

type SnapshotInput = {
  sourceFeeds: SourceFeed[];
  rawJobs: RawSourceJob[];
  jobs: JobPosting[];
  lastSyncedAt: string;
  syncRun: SyncRunRecord;
};

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function mapJobSource(source: {
  feedId: string;
  sourceName: string;
  sourceType: string;
  sourceUrl: string;
  externalId: string | null;
  isPrimary: boolean;
}): JobSource {
  return {
    feedId: source.feedId,
    sourceName: source.sourceName,
    sourceType: source.sourceType as JobSource["sourceType"],
    sourceUrl: source.sourceUrl,
    externalId: source.externalId ?? undefined,
    isPrimary: source.isPrimary,
  };
}

function mapSyncRun(run: {
  id: string;
  mode: string;
  status: string;
  startedAt: Date;
  finishedAt: Date;
  totalRawJobs: number;
  totalAggregatedJobs: number;
  totalSources: number;
  errorMessage: string | null;
  sourceRuns: Array<{
    feedId: string;
    sourceName: string;
    sourceType: string;
    status: string;
    rawJobsCount: number;
    usedFixtureFallback: boolean;
    errorMessage: string | null;
  }>;
}): SyncRunRecord {
  return {
    id: run.id,
    mode: run.mode as SyncRunRecord["mode"],
    status: run.status as SyncRunRecord["status"],
    startedAt: run.startedAt.toISOString(),
    finishedAt: run.finishedAt.toISOString(),
    totalRawJobs: run.totalRawJobs,
    totalAggregatedJobs: run.totalAggregatedJobs,
    totalSources: run.totalSources,
    errorMessage: run.errorMessage,
    sourceRuns: run.sourceRuns.map((sourceRun) => ({
      feedId: sourceRun.feedId,
      sourceName: sourceRun.sourceName,
      sourceType: sourceRun.sourceType as SyncRunRecord["sourceRuns"][number]["sourceType"],
      status: sourceRun.status as SyncRunRecord["sourceRuns"][number]["status"],
      rawJobsCount: sourceRun.rawJobsCount,
      usedFixtureFallback: sourceRun.usedFixtureFallback,
      errorMessage: sourceRun.errorMessage,
    })),
  };
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export async function loadPersistedSnapshot(): Promise<PersistedSnapshot | null> {
  if (!isDatabaseConfigured()) return null;

  try {
    const prisma = getPrismaClient();
    const [jobPostings, syncMeta, syncRuns] = await Promise.all([
      prisma.jobPosting.findMany({
        include: {
          sources: true,
        },
        orderBy: {
          postedAt: "desc",
        },
      }),
      prisma.syncMeta.findUnique({
        where: {
          id: "default",
        },
      }),
      prisma.syncRun.findMany({
        include: {
          sourceRuns: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),
    ]);
    if (!jobPostings.length && !syncRuns.length) return null;

    return {
      jobs: jobPostings.map((job) => ({
        id: job.id,
        title: job.title,
        companyName: job.companyName,
        city: job.city,
        remoteMode: job.remoteMode as JobPosting["remoteMode"],
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        experienceLevel: job.experienceLevel as JobPosting["experienceLevel"],
        educationLevel: job.educationLevel as JobPosting["educationLevel"],
        tags: job.tags as string[],
        postedAt: job.postedAt.toISOString(),
        sourceName: job.sourceName,
        sourceUrl: job.sourceUrl,
        sources: job.sources.map(mapJobSource),
        description: job.description as JobPosting["description"],
        companyProfile: (job.companyProfile as JobPosting["companyProfile"]) ?? undefined,
      })),
      lastSyncedAt: syncMeta?.lastSyncedAt?.toISOString() ?? null,
      totalRawJobs: syncMeta?.totalRawJobs ?? 0,
      totalAggregatedJobs: syncMeta?.totalAggregatedJobs ?? jobPostings.length,
      totalSources: syncMeta?.totalSources ?? 0,
      recentRuns: syncRuns.map((run) => mapSyncRun(run)),
    };
  } catch (error) {
    console.error("Failed to load persisted job snapshot:", error);
    return null;
  }
}

export async function persistSnapshot(input: SnapshotInput) {
  if (!isDatabaseConfigured()) return false;

  try {
    const prisma = getPrismaClient();

    await prisma.$transaction(async (tx) => {
      await tx.jobSource.deleteMany();
      await tx.rawJob.deleteMany();
      await tx.jobPosting.deleteMany();

      for (const feed of input.sourceFeeds) {
        await tx.sourceFeed.upsert({
          where: { id: feed.id },
          update: {
            name: feed.name,
            label: feed.label,
            type: feed.type,
            baseUrl: feed.baseUrl,
            isActive: feed.isActive,
            siteKey: feed.siteKey,
            usesFixtureFallback: feed.usesFixtureFallback,
          },
          create: {
            id: feed.id,
            name: feed.name,
            label: feed.label,
            type: feed.type,
            baseUrl: feed.baseUrl,
            isActive: feed.isActive,
            siteKey: feed.siteKey,
            usesFixtureFallback: feed.usesFixtureFallback,
          },
        });
      }

      if (input.rawJobs.length) {
        await tx.rawJob.createMany({
          data: input.rawJobs.map((job) => ({
            feedId: job.feedId,
            sourceType: job.sourceType,
            sourceName: job.sourceName,
            externalId: job.externalId,
            sourceUrl: job.sourceUrl,
            payload: toJson(job.payload),
            fetchedAt: new Date(job.fetchedAt),
          })),
        });
      }

      for (const job of input.jobs) {
        await tx.jobPosting.create({
          data: {
            id: job.id,
            title: job.title,
            companyName: job.companyName,
            city: job.city,
            remoteMode: job.remoteMode,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            experienceLevel: job.experienceLevel,
            educationLevel: job.educationLevel,
            tags: toJson(job.tags),
            postedAt: new Date(job.postedAt),
            sourceName: job.sourceName,
            sourceUrl: job.sourceUrl,
            description: toJson(job.description),
            companyProfile: job.companyProfile ? toJson(job.companyProfile) : undefined,
            sources: {
              create: job.sources.map((source) => ({
                feedId: source.feedId,
                sourceName: source.sourceName,
                sourceType: source.sourceType,
                sourceUrl: source.sourceUrl,
                externalId: source.externalId,
                isPrimary: source.isPrimary,
              })),
            },
          },
        });
      }

      await tx.syncMeta.upsert({
        where: { id: "default" },
        update: {
          lastSyncedAt: new Date(input.lastSyncedAt),
          totalRawJobs: input.rawJobs.length,
          totalAggregatedJobs: input.jobs.length,
          totalSources: input.sourceFeeds.length,
        },
        create: {
          id: "default",
          lastSyncedAt: new Date(input.lastSyncedAt),
          totalRawJobs: input.rawJobs.length,
          totalAggregatedJobs: input.jobs.length,
          totalSources: input.sourceFeeds.length,
        },
      });

      await tx.syncRun.create({
        data: {
          id: input.syncRun.id,
          mode: input.syncRun.mode,
          status: input.syncRun.status,
          startedAt: new Date(input.syncRun.startedAt),
          finishedAt: new Date(input.syncRun.finishedAt),
          totalRawJobs: input.syncRun.totalRawJobs,
          totalAggregatedJobs: input.syncRun.totalAggregatedJobs,
          totalSources: input.syncRun.totalSources,
          errorMessage: input.syncRun.errorMessage,
          sourceRuns: {
            create: input.syncRun.sourceRuns.map((sourceRun) => ({
              feedId: sourceRun.feedId,
              sourceName: sourceRun.sourceName,
              sourceType: sourceRun.sourceType,
              status: sourceRun.status,
              rawJobsCount: sourceRun.rawJobsCount,
              usedFixtureFallback: sourceRun.usedFixtureFallback,
              errorMessage: sourceRun.errorMessage,
            })),
          },
        },
      });
    });

    return true;
  } catch (error) {
    console.error("Failed to persist job snapshot:", error);
    return false;
  }
}
