import { promises as fs } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("source feed config", () => {
  it("builds remote feeds from env config", async () => {
    vi.stubEnv("JOB_RADAR_ENABLE_MANUAL_IMPORT", "false");
    vi.stubEnv("JOB_RADAR_GREENHOUSE_BOARDS", "vercel:Vercel,stripe:Stripe");
    vi.stubEnv("JOB_RADAR_LEVER_SITES", "plaid:Plaid");

    const module = await import("@/server/jobs/source-feeds");
    const feeds = module.buildSourceFeeds();

    expect(feeds.some((feed) => feed.type === "manual")).toBe(false);
    expect(feeds.some((feed) => feed.name === "Greenhouse · Vercel")).toBe(true);
    expect(feeds.some((feed) => feed.name === "Greenhouse · Stripe")).toBe(true);
    expect(feeds.some((feed) => feed.name === "Lever · Plaid")).toBe(true);
  });

  it("keeps manual import enabled by default", async () => {
    vi.stubEnv("JOB_RADAR_GREENHOUSE_BOARDS", "");
    vi.stubEnv("JOB_RADAR_LEVER_SITES", "");

    const module = await import("@/server/jobs/source-feeds");
    const feeds = module.buildSourceFeeds();

    expect(feeds.some((feed) => feed.type === "manual")).toBe(true);
  });

  it("prefers saved file config over env config", async () => {
    const configPath = path.join(process.cwd(), ".tmp-source-feeds.test.json");
    vi.stubEnv("JOB_RADAR_SOURCE_CONFIG_PATH", configPath);
    vi.stubEnv("JOB_RADAR_ENABLE_MANUAL_IMPORT", "true");
    vi.stubEnv("JOB_RADAR_GREENHOUSE_BOARDS", "vercel:Vercel");

    await fs.writeFile(
      configPath,
      JSON.stringify(
        {
          manualImportEnabled: false,
          greenhouseBoards: [{ key: "stripe", label: "Stripe" }],
          leverSites: [{ key: "plaid", label: "Plaid" }],
        },
        null,
        2,
      ),
      "utf8",
    );

    const module = await import("@/server/jobs/source-feeds");
    const { config, source } = await module.getSourceFeedConfig();
    const feeds = await module.getSourceFeeds();

    expect(source).toBe("file");
    expect(config.manualImportEnabled).toBe(false);
    expect(feeds.some((feed) => feed.name === "Greenhouse · Stripe")).toBe(true);
    expect(feeds.some((feed) => feed.name === "Lever · Plaid")).toBe(true);
    expect(feeds.some((feed) => feed.type === "manual")).toBe(false);

    await fs.unlink(configPath);
  });

  it("validates configured source feeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
      })),
    );

    const module = await import("@/server/jobs/source-feeds");
    const result = await module.validateSourceFeedConfig({
      manualImportEnabled: false,
      greenhouseBoards: [{ key: "vercel", label: "Vercel" }],
      leverSites: [{ key: "plaid", label: "Plaid" }],
    });

    expect(result.valid).toBe(true);
    expect(result.results).toHaveLength(2);
    expect(result.results.every((item) => item.status === "success")).toBe(true);
  });
});
