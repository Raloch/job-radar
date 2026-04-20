import {
  type JobPosting,
  type JobSearchParams,
  type PostedWithin,
  type UserJobState,
} from "@/entities/job/types";

function postedWithinDays(value: PostedWithin) {
  const daysMap: Record<PostedWithin, number> = {
    "1d": 1,
    "3d": 3,
    "7d": 7,
    "14d": 14,
    "30d": 30,
  };

  return daysMap[value];
}

function matchesKeyword(job: JobPosting, keyword: string) {
  const target = [
    job.title,
    job.companyName,
    job.city,
    job.tags.join(" "),
    job.description.responsibilities.join(" "),
    job.description.requirements.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return target.includes(keyword.toLowerCase());
}

export function filterJobs(jobs: JobPosting[], params: JobSearchParams) {
  return jobs.filter((job) => {
    if (params.keyword && !matchesKeyword(job, params.keyword)) return false;
    if (params.city?.length && !params.city.includes(job.city)) return false;
    if (params.remoteMode?.length && !params.remoteMode.includes(job.remoteMode)) return false;
    if (
      params.experienceLevel?.length &&
      !params.experienceLevel.includes(job.experienceLevel)
    ) {
      return false;
    }
    if (
      params.educationLevel?.length &&
      !params.educationLevel.includes(job.educationLevel)
    ) {
      return false;
    }
    if (params.salaryRange) {
      const [min, max] = params.salaryRange;
      if (job.salaryMax < min || job.salaryMin > max) return false;
    }
    if (params.tags?.length && !params.tags.every((tag) => job.tags.includes(tag))) return false;
    if (params.postedWithin) {
      const cutoffDays = postedWithinDays(params.postedWithin);
      const diff =
        (Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (diff > cutoffDays) return false;
    }

    return true;
  });
}

export function sortJobs(jobs: JobPosting[], sortBy: JobSearchParams["sortBy"] = "latest") {
  return [...jobs].sort((a, b) => {
    if (sortBy === "salary_desc") return b.salaryMax - a.salaryMax;
    if (sortBy === "salary_asc") return a.salaryMin - b.salaryMin;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
}

export function deriveJobState(userState?: UserJobState) {
  return (
    userState ?? {
      jobId: "",
      saved: false,
      status: "default" as const,
      updatedAt: new Date(0).toISOString(),
    }
  );
}

export function mergeJobsWithState(jobs: JobPosting[], states: Record<string, UserJobState>) {
  return jobs.map((job) => ({
    ...job,
    userState: deriveJobState(states[job.id]),
  }));
}

export function countMyJobs(states: Record<string, UserJobState>) {
  const values = Object.values(states);
  return {
    saved: values.filter((item) => item.saved).length,
    applied: values.filter((item) => item.status === "applied").length,
    ignored: values.filter((item) => item.status === "ignored").length,
    toReview: values.filter((item) => item.status === "to_review").length,
  };
}
