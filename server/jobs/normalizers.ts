import { type JobPosting } from "@/entities/job/types";
import { type NormalizedSourceJob, type RawSourceJob } from "@/server/jobs/types";

function asManualJob(payload: unknown) {
  return payload as JobPosting;
}

export function normalizeSourceJob(rawJob: RawSourceJob): NormalizedSourceJob {
  if (rawJob.sourceType === "manual") {
    const job = asManualJob(rawJob.payload);
    return {
      title: job.title,
      companyName: job.companyName,
      city: job.city,
      remoteMode: job.remoteMode,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      experienceLevel: job.experienceLevel,
      educationLevel: job.educationLevel,
      tags: job.tags,
      postedAt: job.postedAt,
      description: job.description,
      companyProfile: job.companyProfile,
      feedId: rawJob.feedId,
      sourceType: rawJob.sourceType,
      sourceName: rawJob.sourceName,
      sourceUrl: rawJob.sourceUrl,
      externalId: rawJob.externalId,
    };
  }

  if (rawJob.sourceType === "greenhouse") {
    const payload = rawJob.payload as {
      title: string;
      company: string;
      location: string;
      remote: JobPosting["remoteMode"];
      compensation: string;
      tags: string[];
      postedAt: string;
      responsibilities: string[];
      requirements: string[];
      bonuses?: string[];
      companyProfile?: JobPosting["companyProfile"];
      experienceLevel: JobPosting["experienceLevel"];
      educationLevel: JobPosting["educationLevel"];
    };
    const [salaryMin, salaryMax] = payload.compensation.split("-").map(Number);

    return {
      title: payload.title,
      companyName: payload.company,
      city: payload.location,
      remoteMode: payload.remote,
      salaryMin,
      salaryMax,
      experienceLevel: payload.experienceLevel,
      educationLevel: payload.educationLevel,
      tags: payload.tags,
      postedAt: payload.postedAt,
      description: {
        responsibilities: payload.responsibilities,
        requirements: payload.requirements,
        bonuses: payload.bonuses,
      },
      companyProfile: payload.companyProfile,
      feedId: rawJob.feedId,
      sourceType: rawJob.sourceType,
      sourceName: rawJob.sourceName,
      sourceUrl: rawJob.sourceUrl,
      externalId: rawJob.externalId,
    };
  }

  const payload = rawJob.payload as {
    text: string;
    organization: string;
    categories: {
      location: string;
      commitment: JobPosting["remoteMode"];
    };
    salaryRange: {
      min: number;
      max: number;
    };
    tags: string[];
    createdAt: string;
    sections: {
      responsibilities: string[];
      requirements: string[];
      bonuses?: string[];
    };
    profile?: JobPosting["companyProfile"];
    experienceLevel: JobPosting["experienceLevel"];
    educationLevel: JobPosting["educationLevel"];
  };

  return {
    title: payload.text,
    companyName: payload.organization,
    city: payload.categories.location,
    remoteMode: payload.categories.commitment,
    salaryMin: payload.salaryRange.min,
    salaryMax: payload.salaryRange.max,
    experienceLevel: payload.experienceLevel,
    educationLevel: payload.educationLevel,
    tags: payload.tags,
    postedAt: payload.createdAt,
    description: payload.sections,
    companyProfile: payload.profile,
    feedId: rawJob.feedId,
    sourceType: rawJob.sourceType,
    sourceName: rawJob.sourceName,
    sourceUrl: rawJob.sourceUrl,
    externalId: rawJob.externalId,
  };
}
