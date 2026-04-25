import { NextResponse } from "next/server";

import { getSyncDashboardStatus, syncJobSources } from "@/server/jobs/service";

export async function GET() {
  const payload = await getSyncDashboardStatus();
  return NextResponse.json(payload);
}

export async function POST() {
  const payload = await syncJobSources();
  return NextResponse.json(payload);
}
