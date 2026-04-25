import { leverFixtureJobs } from "@/server/jobs/fixtures";
import { type SourceFeed } from "@/server/jobs/source-feeds";
import {
  inferEducationLevel,
  inferExperienceLevel,
  inferRemoteMode,
  inferSalaryRange,
  inferTags,
  makeCompanyProfile,
  stripHtml,
  textToLines,
} from "@/server/jobs/source-utils";
import { type AdapterSyncResult, type RawSourceJob } from "@/server/jobs/types";

function mapFixtureJobs(feed: SourceFeed): RawSourceJob[] {
  return leverFixtureJobs.map((job) => ({
    feedId: feed.id,
    sourceType: feed.type,
    sourceName: feed.name,
    externalId: job.leverId,
    sourceUrl: job.applyUrl,
    payload: job,
    fetchedAt: new Date().toISOString(),
  }));
}

export async function fetchLeverJobs(feed: SourceFeed): Promise<AdapterSyncResult> {
  if (feed.siteKey) {
    try {
      const response = await fetch(`${feed.baseUrl}/v0/postings/${feed.siteKey}?mode=json`, {
        next: { revalidate: 1800 },
      });

      if (response.ok) {
        const payload = (await response.json()) as Array<{
          id: string;
          text: string;
          hostedUrl: string;
          categories?: {
            location?: string;
            commitment?: string;
            team?: string;
          };
          descriptionPlain?: string;
          description?: string;
          lists?: Array<{
            text?: string;
            content?: string;
          }>;
          additionalPlain?: string;
          additional?: string;
          createdAt?: number;
        }>;

        return {
          rawJobs: payload.map((job) => {
            const descriptionText = job.descriptionPlain || stripHtml(job.description ?? "");
            const additionalText = job.additionalPlain || stripHtml(job.additional ?? "");
            const listText = (job.lists ?? [])
              .map((item) => `${item.text ?? ""}\n${stripHtml(item.content ?? "")}`)
              .join("\n");
            const mergedText = [descriptionText, additionalText, listText]
              .filter(Boolean)
              .join("\n");
            const lines = textToLines(mergedText);
            const location = job.categories?.location || "未提供";
            const [salaryMin, salaryMax] = inferSalaryRange(
              job.text,
              job.categories?.commitment ?? "",
              mergedText,
            );

            return {
              feedId: feed.id,
              sourceType: feed.type,
              sourceName: feed.name,
              externalId: job.id,
              sourceUrl: job.hostedUrl,
              fetchedAt: new Date().toISOString(),
              payload: {
                text: job.text,
                organization: feed.label,
                categories: {
                  location,
                  commitment: inferRemoteMode(
                    location,
                    job.categories?.commitment ?? "",
                    mergedText,
                  ),
                },
                salaryRange: {
                  min: salaryMin,
                  max: salaryMax,
                },
                tags: inferTags(job.text, mergedText, job.categories?.team ?? ""),
                applyUrl: job.hostedUrl,
                createdAt: job.createdAt
                  ? new Date(job.createdAt).toISOString()
                  : new Date().toISOString(),
                sections: {
                  responsibilities: lines.slice(0, Math.min(lines.length, 4)),
                  requirements: lines.slice(Math.min(lines.length, 4)),
                  bonuses: [],
                },
                profile: makeCompanyProfile(location),
                experienceLevel: inferExperienceLevel(job.text, mergedText),
                educationLevel: inferEducationLevel(mergedText),
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
        errorMessage: `Lever returned ${response.status}`,
      };
    } catch (error) {
      return {
        rawJobs: mapFixtureJobs(feed),
        usedFixtureFallback: true,
        errorMessage: error instanceof Error ? error.message : "Unknown Lever error",
      };
    }
  }

  return {
    rawJobs: mapFixtureJobs(feed),
    usedFixtureFallback: true,
    errorMessage: null,
  };
}
