import { NextResponse } from "next/server";

import { getSourceFilterOptions } from "@/server/jobs/service";

export async function GET() {
  const payload = await getSourceFilterOptions();
  return NextResponse.json(payload);
}
