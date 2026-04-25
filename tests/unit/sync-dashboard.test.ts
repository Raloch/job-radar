import { describe, expect, it } from "vitest";

import { getSyncDashboardStatus, syncJobSources } from "@/server/jobs/service";

describe("sync dashboard status", () => {
  it("returns dashboard metrics and source config", async () => {
    await syncJobSources();
    const status = await getSyncDashboardStatus();

    expect(status.totalSources).toBeGreaterThan(0);
    expect(status.totalRawJobs).toBeGreaterThan(0);
    expect(status.totalAggregatedJobs).toBeGreaterThan(0);
    expect(status.sources.length).toBe(status.totalSources);
  });
});
