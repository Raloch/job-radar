import { NextResponse } from "next/server";

import { getAggregatedJobById } from "@/server/jobs/service";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = await getAggregatedJobById(id);

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}
