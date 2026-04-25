import { promises as fs } from "node:fs";
import path from "node:path";

import { type SourceFeedType } from "@/entities/job/types";

export type SourceFeed = {
  id: string;
  name: string;
  label: string;
  type: SourceFeedType;
  baseUrl: string;
  isActive: boolean;
  siteKey?: string;
  usesFixtureFallback: boolean;
};

type ParsedFeed = {
  key: string;
  label: string;
};

export type SourceFeedConfig = {
  manualImportEnabled: boolean;
  greenhouseBoards: ParsedFeed[];
  leverSites: ParsedFeed[];
};

export type SourceFeedValidationResult = {
  name: string;
  type: SourceFeedType;
  siteKey: string | null;
  status: "success" | "failed";
  message: string;
  httpStatus: number | null;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseFeedList(input: string | undefined) {
  if (!input) return [];

  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map<ParsedFeed>((item) => {
      const [key, label] = item.split(":").map((part) => part.trim());
      return {
        key,
        label: label || key,
      };
    });
}

function createRemoteFeeds(
  type: "greenhouse" | "lever",
  entries: ParsedFeed[],
  fallbackWhenEmpty: boolean,
): SourceFeed[] {
  if (!entries.length && fallbackWhenEmpty) {
    return [
      {
        id: `${type}-fixture`,
        name: type === "greenhouse" ? "Greenhouse" : "Lever",
        label: type === "greenhouse" ? "Greenhouse" : "Lever",
        type,
        baseUrl:
          type === "greenhouse"
            ? "https://boards-api.greenhouse.io"
            : "https://api.lever.co",
        isActive: true,
        usesFixtureFallback: true,
      },
    ];
  }

  if (!entries.length) {
    return [];
  }

  return entries.map((entry) => ({
    id: `${type}-${slugify(entry.key)}`,
    name: `${type === "greenhouse" ? "Greenhouse" : "Lever"} · ${entry.label}`,
    label: entry.label,
    type,
    baseUrl:
      type === "greenhouse"
        ? "https://boards-api.greenhouse.io"
        : "https://api.lever.co",
    isActive: true,
    siteKey: entry.key,
    usesFixtureFallback: false,
  }));
}

function isManualImportEnabled() {
  return process.env.JOB_RADAR_ENABLE_MANUAL_IMPORT !== "false";
}

function defaultEnvConfig(): SourceFeedConfig {
  return {
    manualImportEnabled: isManualImportEnabled(),
    greenhouseBoards: parseFeedList(process.env.JOB_RADAR_GREENHOUSE_BOARDS),
    leverSites: parseFeedList(process.env.JOB_RADAR_LEVER_SITES),
  };
}

function buildSourceFeedsFromConfig(
  config: SourceFeedConfig,
  options: { fallbackWhenEmpty: boolean },
) {
  const manualFeeds = config.manualImportEnabled
    ? [
        {
          id: "manual-curated",
          name: "手动导入",
          label: "手动导入",
          type: "manual" as const,
          baseUrl: "https://example.com/manual-import",
          isActive: true,
          siteKey: undefined,
          usesFixtureFallback: true,
        },
      ]
    : [];

  return [
    ...manualFeeds,
    ...createRemoteFeeds("greenhouse", config.greenhouseBoards, options.fallbackWhenEmpty),
    ...createRemoteFeeds("lever", config.leverSites, options.fallbackWhenEmpty),
  ];
}

function getConfigFilePath() {
  return process.env.JOB_RADAR_SOURCE_CONFIG_PATH
    ? path.resolve(process.env.JOB_RADAR_SOURCE_CONFIG_PATH)
    : path.join(process.cwd(), ".job-radar-source-feeds.json");
}

export async function getSourceFeedConfig() {
  const filePath = getConfigFilePath();

  try {
    const content = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(content) as SourceFeedConfig;

    return {
      config: {
        manualImportEnabled: parsed.manualImportEnabled,
        greenhouseBoards: parsed.greenhouseBoards ?? [],
        leverSites: parsed.leverSites ?? [],
      },
      source: "file" as const,
      path: filePath,
    };
  } catch {
    return {
      config: defaultEnvConfig(),
      source: "env" as const,
      path: filePath,
    };
  }
}

export async function saveSourceFeedConfig(config: SourceFeedConfig) {
  const filePath = getConfigFilePath();
  await fs.writeFile(filePath, JSON.stringify(config, null, 2), "utf8");
  return {
    config,
    source: "file" as const,
    path: filePath,
  };
}

export async function getSourceFeeds() {
  const { config, source } = await getSourceFeedConfig();
  return buildSourceFeedsFromConfig(config, {
    fallbackWhenEmpty: source === "env",
  });
}

export function buildSourceFeeds() {
  return buildSourceFeedsFromConfig(defaultEnvConfig(), {
    fallbackWhenEmpty: true,
  });
}

export async function validateSourceFeedConfig(config: SourceFeedConfig) {
  const feeds = buildSourceFeedsFromConfig(config, {
    fallbackWhenEmpty: false,
  });

  const results = await Promise.all(
    feeds.map(async (feed): Promise<SourceFeedValidationResult> => {
      if (feed.type === "manual") {
        return {
          name: feed.name,
          type: feed.type,
          siteKey: null,
          status: "success",
          message: "Manual import 已启用",
          httpStatus: null,
        };
      }

      const url =
        feed.type === "greenhouse"
          ? `${feed.baseUrl}/v1/boards/${feed.siteKey}/jobs`
          : `${feed.baseUrl}/v0/postings/${feed.siteKey}?mode=json`;

      try {
        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
        });

        if (response.ok) {
          return {
            name: feed.name,
            type: feed.type,
            siteKey: feed.siteKey ?? null,
            status: "success",
            message: "来源可访问",
            httpStatus: response.status,
          };
        }

        return {
          name: feed.name,
          type: feed.type,
          siteKey: feed.siteKey ?? null,
          status: "failed",
          message: `来源返回 ${response.status}`,
          httpStatus: response.status,
        };
      } catch (error) {
        return {
          name: feed.name,
          type: feed.type,
          siteKey: feed.siteKey ?? null,
          status: "failed",
          message: error instanceof Error ? error.message : "未知错误",
          httpStatus: null,
        };
      }
    }),
  );

  return {
    valid: results.every((item) => item.status === "success"),
    results,
  };
}
