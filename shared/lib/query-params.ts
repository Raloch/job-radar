"use client";

import { type JobSearchParams, jobSearchParamsSchema } from "@/entities/job/types";

function readArray(value: string | null) {
  if (!value) return undefined;
  const items = value.split(",").filter(Boolean);
  return items.length ? items : undefined;
}

export function parseJobSearchParams(searchParams: URLSearchParams): JobSearchParams {
  const salaryMin = searchParams.get("salaryMin");
  const salaryMax = searchParams.get("salaryMax");
  const raw: JobSearchParams = {
    keyword: searchParams.get("keyword") || undefined,
    city: readArray(searchParams.get("city")),
    source: readArray(searchParams.get("source")),
    remoteMode: readArray(searchParams.get("remoteMode")) as JobSearchParams["remoteMode"],
    experienceLevel: readArray(
      searchParams.get("experienceLevel"),
    ) as JobSearchParams["experienceLevel"],
    educationLevel: readArray(
      searchParams.get("educationLevel"),
    ) as JobSearchParams["educationLevel"],
    tags: readArray(searchParams.get("tags")),
    sortBy: (searchParams.get("sortBy") as JobSearchParams["sortBy"]) || "latest",
    postedWithin:
      (searchParams.get("postedWithin") as JobSearchParams["postedWithin"]) || undefined,
  };

  if (salaryMin && salaryMax) {
    raw.salaryRange = [Number(salaryMin), Number(salaryMax)];
  }

  return jobSearchParamsSchema.parse(raw);
}

export function buildJobSearchQuery(params: JobSearchParams) {
  const next = new URLSearchParams();

  if (params.keyword) next.set("keyword", params.keyword);
  if (params.city?.length) next.set("city", params.city.join(","));
  if (params.source?.length) next.set("source", params.source.join(","));
  if (params.remoteMode?.length) next.set("remoteMode", params.remoteMode.join(","));
  if (params.experienceLevel?.length) {
    next.set("experienceLevel", params.experienceLevel.join(","));
  }
  if (params.educationLevel?.length) {
    next.set("educationLevel", params.educationLevel.join(","));
  }
  if (params.tags?.length) next.set("tags", params.tags.join(","));
  if (params.sortBy) next.set("sortBy", params.sortBy);
  if (params.postedWithin) next.set("postedWithin", params.postedWithin);
  if (params.salaryRange) {
    next.set("salaryMin", String(params.salaryRange[0]));
    next.set("salaryMax", String(params.salaryRange[1]));
  }

  return next.toString();
}
