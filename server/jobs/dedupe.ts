import { type JobPosting, type JobSource } from "@/entities/job/types";
import { type NormalizedSourceJob } from "@/server/jobs/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s/]+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export function getCanonicalKey(job: Pick<NormalizedSourceJob, "companyName" | "title" | "city">) {
  return `${slugify(job.companyName)}:${slugify(job.title)}:${slugify(job.city)}`;
}

function toJobSource(job: NormalizedSourceJob, isPrimary: boolean): JobSource {
  return {
    feedId: job.feedId,
    sourceName: job.sourceName,
    sourceType: job.sourceType,
    sourceUrl: job.sourceUrl,
    externalId: job.externalId,
    isPrimary,
  };
}

export function mergeNormalizedJob(groupedJobs: Map<string, JobPosting>, normalizedJob: NormalizedSourceJob) {
  const canonicalKey = getCanonicalKey(normalizedJob);
  const existing = groupedJobs.get(canonicalKey);

  if (!existing) {
    groupedJobs.set(canonicalKey, {
      id: canonicalKey,
      title: normalizedJob.title,
      companyName: normalizedJob.companyName,
      city: normalizedJob.city,
      remoteMode: normalizedJob.remoteMode,
      salaryMin: normalizedJob.salaryMin,
      salaryMax: normalizedJob.salaryMax,
      experienceLevel: normalizedJob.experienceLevel,
      educationLevel: normalizedJob.educationLevel,
      tags: normalizedJob.tags,
      postedAt: normalizedJob.postedAt,
      sourceName: normalizedJob.sourceName,
      sourceUrl: normalizedJob.sourceUrl,
      sources: [toJobSource(normalizedJob, true)],
      description: normalizedJob.description,
      companyProfile: normalizedJob.companyProfile,
    });
    return;
  }

  const sourceExists = existing.sources.some(
    (source) =>
      source.sourceUrl === normalizedJob.sourceUrl ||
      (source.externalId && source.externalId === normalizedJob.externalId),
  );
  if (!sourceExists) {
    existing.sources.push(toJobSource(normalizedJob, false));
  }

  existing.tags = Array.from(new Set([...existing.tags, ...normalizedJob.tags]));
  if (new Date(normalizedJob.postedAt).getTime() > new Date(existing.postedAt).getTime()) {
    existing.postedAt = normalizedJob.postedAt;
    existing.sourceName = normalizedJob.sourceName;
    existing.sourceUrl = normalizedJob.sourceUrl;
  }
}
