import { manualFixtureJobs } from "@/server/jobs/fixtures";
import { type SourceFeed } from "@/server/jobs/source-feeds";
import { type AdapterSyncResult } from "@/server/jobs/types";

export async function fetchManualImportJobs(feed: SourceFeed): Promise<AdapterSyncResult> {
  return {
    rawJobs: manualFixtureJobs.map((job) => ({
      feedId: feed.id,
      sourceType: feed.type,
      sourceName: feed.name,
      externalId: job.id,
      sourceUrl: job.sourceUrl,
      payload: job,
      fetchedAt: new Date().toISOString(),
    })),
    usedFixtureFallback: true,
    errorMessage: null,
  };
}
