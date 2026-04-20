import { filterJobs, sortJobs } from "@/entities/job/model";
import { type JobSearchParams } from "@/entities/job/types";
import { mockJobs } from "@/mocks/jobs";

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function listJobs(params: JobSearchParams = {}) {
  await wait(150);
  const filtered = filterJobs(mockJobs, params);
  const items = sortJobs(filtered, params.sortBy);
  return {
    items,
    total: items.length,
  };
}

export async function getJobById(id: string) {
  await wait(100);
  return mockJobs.find((job) => job.id === id) ?? null;
}

export async function getFilterOptions() {
  await wait(60);
  return {
    cities: Array.from(new Set(mockJobs.map((job) => job.city))),
    tags: Array.from(new Set(mockJobs.flatMap((job) => job.tags))).sort(),
  };
}
