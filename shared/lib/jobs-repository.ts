import { type JobPosting, type JobSearchParams } from "@/entities/job/types";
import { buildJobSearchQuery } from "@/shared/lib/query-params";

type JobListResponse = {
  items: JobPosting[];
  total: number;
  lastSyncedAt?: string | null;
};

type FilterOptionsResponse = {
  cities: string[];
  tags: string[];
  sources: string[];
  lastSyncedAt?: string | null;
};

async function requestJson<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function listJobs(params: JobSearchParams = {}) {
  const query = buildJobSearchQuery(params);
  return requestJson<JobListResponse>(query ? `/api/jobs?${query}` : "/api/jobs");
}

export async function getJobById(id: string) {
  return requestJson<JobPosting>(`/api/jobs/${id}`);
}

export async function getFilterOptions() {
  return requestJson<FilterOptionsResponse>("/api/sources");
}
