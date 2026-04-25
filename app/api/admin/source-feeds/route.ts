import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getSourceFeedConfig,
  saveSourceFeedConfig,
} from "@/server/jobs/source-feeds";

const sourceEntrySchema = z.object({
  key: z.string().trim().min(1),
  label: z.string().trim().min(1),
});

const sourceFeedConfigSchema = z.object({
  manualImportEnabled: z.boolean(),
  greenhouseBoards: z.array(sourceEntrySchema),
  leverSites: z.array(sourceEntrySchema),
});

export async function GET() {
  const payload = await getSourceFeedConfig();
  return NextResponse.json(payload);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const parsed = sourceFeedConfigSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid config payload" }, { status: 400 });
  }

  const payload = await saveSourceFeedConfig(parsed.data);
  return NextResponse.json(payload);
}
