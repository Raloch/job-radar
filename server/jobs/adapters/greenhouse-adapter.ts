import { greenhouseFixtureJobs } from "@/server/jobs/fixtures";
import { type SourceFeed } from "@/server/jobs/source-feeds";
import {
  inferEducationLevel,
  inferExperienceLevel,
  inferRemoteMode,
  inferSalaryRange,
  inferTags,
  makeCompanyProfile,
  textToLines,
} from "@/server/jobs/source-utils";
import { type AdapterSyncResult, type RawSourceJob } from "@/server/jobs/types";

function mapFixtureJobs(feed: SourceFeed): RawSourceJob[] {
  return greenhouseFixtureJobs.map((job) => ({
    feedId: feed.id,
    sourceType: feed.type,
    sourceName: feed.name,
    externalId: job.ghId,
    sourceUrl: job.jobUrl,
    payload: job,
    fetchedAt: new Date().toISOString(),
  }));
}

export async function fetchGreenhouseJobs(feed: SourceFeed): Promise<AdapterSyncResult> {
  if (feed.siteKey) {
    try {
      const response = await fetch(
        `${feed.baseUrl}/v1/boards/${feed.siteKey}/jobs?content=true`,
        {
          next: { revalidate: 1800 },
        },
      );

      if (response.ok) {
        const payload = (await response.json()) as {
          jobs: Array<{
            id: number;
            title: string;
            location?: { name?: string };
            absolute_url: string;
            updated_at?: string;
            content?: string;
            metadata?: Array<{ name?: string; value?: string }>;
          }>;
        };

        return {
          rawJobs: payload.jobs.map((job) => {
            const metadataText = (job.metadata ?? [])
              .map((item) => `${item.name ?? ""} ${item.value ?? ""}`.trim())
              .join(" ");
            const descriptionText = job.content ?? "";
            const lines = textToLines(descriptionText);
            const [salaryMin, salaryMax] = inferSalaryRange(
              job.title,
              metadataText,
              descriptionText,
            );
            const location = job.location?.name || "未提供";

            return {
              feedId: feed.id,
              sourceType: feed.type,
              sourceName: feed.name,
              externalId: String(job.id),
              sourceUrl: job.absolute_url,
              fetchedAt: new Date().toISOString(),
              payload: {
                title: job.title,
                company: feed.label,
                location,
                remote: inferRemoteMode(location, metadataText, descriptionText),
                compensation: `${salaryMin}-${salaryMax}`,
                tags: inferTags(job.title, metadataText, descriptionText),
                postedAt: job.updated_at ?? new Date().toISOString(),
                jobUrl: job.absolute_url,
                responsibilities: lines.slice(0, Math.min(lines.length, 4)),
                requirements: lines.slice(Math.min(lines.length, 4)),
                bonuses: [],
                companyProfile: makeCompanyProfile(location),
                experienceLevel: inferExperienceLevel(job.title, metadataText, descriptionText),
                educationLevel: inferEducationLevel(metadataText, descriptionText),
              },
            };
          }),
          usedFixtureFallback: false,
          errorMessage: null,
        };
      }

      return {
        rawJobs: mapFixtureJobs(feed),
        usedFixtureFallback: true,
        errorMessage: `Greenhouse returned ${response.status}`,
      };
    } catch (error) {
      return {
        rawJobs: mapFixtureJobs(feed),
        usedFixtureFallback: true,
        errorMessage: error instanceof Error ? error.message : "Unknown Greenhouse error",
      };
    }
  }

  return {
    rawJobs: mapFixtureJobs(feed),
    usedFixtureFallback: true,
    errorMessage: null,
  };
}
