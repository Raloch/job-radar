import { describe, expect, it } from "vitest";

import { listAggregatedJobs, syncJobSources } from "@/server/jobs/service";

describe("job sync service", () => {
  it("aggregates jobs from multiple source feeds", async () => {
    const syncResult = await syncJobSources();
    const listResult = await listAggregatedJobs();

    expect(syncResult.totalRawJobs).toBeGreaterThan(syncResult.totalAggregatedJobs);
    expect(listResult.items.length).toBeGreaterThan(0);
    expect(listResult.items.some((job) => job.sources.length > 1)).toBe(true);
  });
});
