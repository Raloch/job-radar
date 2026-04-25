import { NextResponse } from "next/server";

import { listAggregatedJobs } from "@/server/jobs/service";
import { jobSearchParamsSchema } from "@/entities/job/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = Object.fromEntries(searchParams.entries());
  const params = jobSearchParamsSchema.safeParse({
    keyword: raw.keyword,
    city: raw.city ? raw.city.split(",") : undefined,
    source: raw.source ? raw.source.split(",") : undefined,
    remoteMode: raw.remoteMode ? raw.remoteMode.split(",") : undefined,
    experienceLevel: raw.experienceLevel ? raw.experienceLevel.split(",") : undefined,
    educationLevel: raw.educationLevel ? raw.educationLevel.split(",") : undefined,
    tags: raw.tags ? raw.tags.split(",") : undefined,
    sortBy: raw.sortBy,
    postedWithin: raw.postedWithin,
    salaryRange:
      raw.salaryMin && raw.salaryMax ? [Number(raw.salaryMin), Number(raw.salaryMax)] : undefined,
  });

  if (!params.success) {
    return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
  }

  const payload = await listAggregatedJobs(params.data);
  return NextResponse.json(payload);
}
