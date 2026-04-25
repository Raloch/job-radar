"use client";

import { Building2, ExternalLink, MapPin, MapPinned, Milestone, Timer } from "lucide-react";

import { type JobPosting, type UserJobState } from "@/entities/job/types";
import {
  formatEducationLevel,
  formatExperienceLevel,
  formatRelativeDate,
  formatRemoteMode,
  formatSalaryRange,
  formatStatusLabel,
} from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Textarea } from "@/shared/ui/textarea";
import { useUserJobStore } from "@/stores/user-job-store";
import { JobStatusControls } from "@/features/jobs/components/job-status-controls";

export function JobDetailPanel({
  job,
  state,
}: {
  job: JobPosting | null;
  state?: UserJobState;
}) {
  const setNote = useUserJobStore((store) => store.setNote);

  if (!job) {
    return (
      <aside className="hidden rounded-[30px] border border-line bg-surface p-6 shadow-panel xl:block">
        <p className="font-heading text-lg font-semibold">选择一条职位查看详情</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          这里会展示职位摘要、技能标签、完整 JD 和你的个人状态操作。
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-[30px] border border-line bg-surface p-6 shadow-panel xl:sticky xl:top-5 xl:h-[calc(100vh-9rem)] xl:overflow-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold">{job.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
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

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{formatExperienceLevel(job.experienceLevel)}</Badge>
        <Badge>{formatEducationLevel(job.educationLevel)}</Badge>
        <Badge tone="accent">{formatRemoteMode(job.remoteMode)}</Badge>
        <Badge tone={state?.status === "applied" ? "success" : "muted"}>
          {formatStatusLabel(state?.status ?? "default")}
        </Badge>
      </div>

      <a
        href={job.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent"
      >
        来源：{job.sourceName}
        <ExternalLink size={14} />
      </a>

      {job.sources.length > 1 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {job.sources.map((source) => (
            <Badge key={`${source.feedId}-${source.sourceUrl}`} tone="muted">
              {source.sourceName}
            </Badge>
          ))}
        </div>
      ) : null}

      <section className="mt-6 border-t border-line pt-6">
        <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-[0.16em] text-muted">
          操作区
        </h3>
        <JobStatusControls
          jobId={job.id}
          saved={state?.saved ?? false}
          status={state?.status ?? "default"}
        />
      </section>

      <section className="mt-6 border-t border-line pt-6">
        <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-[0.16em] text-muted">
          匹配标签
        </h3>
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <Badge key={tag} tone="accent">
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      <section className="mt-6 border-t border-line pt-6">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-muted">
          职位描述
        </h3>
        <div className="mt-4 space-y-5 text-sm leading-7 text-ink">
          <div>
            <p className="mb-2 font-semibold">岗位职责</p>
            <ul className="space-y-2 text-muted">
              {job.description.responsibilities.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 font-semibold">任职要求</p>
            <ul className="space-y-2 text-muted">
              {job.description.requirements.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          {job.description.bonuses?.length ? (
            <div>
              <p className="mb-2 font-semibold">加分项</p>
              <ul className="space-y-2 text-muted">
                {job.description.bonuses.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-6 border-t border-line pt-6">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-muted">
          公司信息
        </h3>
        <div className="mt-4 grid gap-3 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Milestone size={15} />
            <span>{job.companyProfile?.industry ?? "未提供"} / {job.companyProfile?.stage ?? "未提供"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 size={15} />
            <span>{job.companyProfile?.size ?? "未提供"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinned size={15} />
            <span>{job.companyProfile?.location ?? "未提供"}</span>
          </div>
        </div>
      </section>

      <section className="mt-6 border-t border-line pt-6">
        <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-[0.16em] text-muted">
          我的备注
        </h3>
        <Textarea
          placeholder="记录你的判断、沟通节点或投递反馈..."
          value={state?.note ?? ""}
          onChange={(event) => setNote(job.id, event.target.value)}
        />
      </section>

      <section className="mt-6 border-t border-line pt-6 text-xs text-muted">
        <p>职位 ID：{job.id}</p>
        <p className="mt-1">发布时间：{new Date(job.postedAt).toLocaleDateString("zh-CN")}</p>
        <p className="mt-1">数据来源：{job.sourceName}</p>
        <p className="mt-1">聚合来源数：{job.sources.length}</p>
      </section>
    </aside>
  );
}
