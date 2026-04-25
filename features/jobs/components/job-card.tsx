"use client";

import { Building2, MapPin, Timer } from "lucide-react";

import { deriveJobState } from "@/entities/job/model";
import { type JobPosting, type UserJobState } from "@/entities/job/types";
import {
  formatEducationLevel,
  formatExperienceLevel,
  formatRelativeDate,
  formatRemoteMode,
  formatSalaryRange,
  formatStatusLabel,
} from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";

export function JobCard({
  job,
  state,
  active,
  onClick,
}: {
  job: JobPosting;
  state?: UserJobState;
  active?: boolean;
  onClick?: () => void;
}) {
  const userState = deriveJobState(state);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-[28px] border bg-surface p-5 text-left transition hover:-translate-y-0.5 hover:shadow-panel",
        active ? "border-accent shadow-panel" : "border-line",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-lg font-semibold text-ink">{job.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="inline-flex items-center gap-1">
              <Building2 size={14} />
              {job.companyName}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} />
              {job.city}
            </span>
            <span className="inline-flex items-center gap-1">
              <Timer size={14} />
              {formatRelativeDate(job.postedAt)}
            </span>
          </div>
        </div>
        <Badge tone="salary" className="font-mono text-sm">
          {formatSalaryRange(job.salaryMin, job.salaryMax)}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Badge>{formatExperienceLevel(job.experienceLevel)}</Badge>
        <Badge>{formatEducationLevel(job.educationLevel)}</Badge>
        <Badge tone="accent">{formatRemoteMode(job.remoteMode)}</Badge>
        <Badge tone={userState.status === "applied" ? "success" : "muted"}>
          {formatStatusLabel(userState.status)}
        </Badge>
        {userState.saved ? <Badge tone="salary">已收藏</Badge> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.tags.map((tag) => (
          <Badge key={tag} tone="muted">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>
          {job.sourceName}
          {job.sources.length > 1 ? ` · 聚合 ${job.sources.length} 个来源` : ""}
        </span>
        <span>状态已同步到本地</span>
      </div>
    </button>
  );
}
