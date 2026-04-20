"use client";

import { useEffect, useMemo, useState } from "react";

import { countMyJobs } from "@/entities/job/model";
import { mockJobs } from "@/mocks/jobs";
import { useUserJobStore } from "@/stores/user-job-store";
import { Badge } from "@/shared/ui/badge";
import { JobCard } from "@/features/jobs/components/job-card";
import { JobDetailPanel } from "@/features/jobs/components/job-detail-panel";
import { MobileDetailDrawer } from "@/features/jobs/components/mobile-detail-drawer";
import { PageState } from "@/shared/ui/page-state";
import { Button } from "@/shared/ui/button";

const tabs = [
  { key: "saved", label: "收藏" },
  { key: "to_review", label: "待看" },
  { key: "applied", label: "已投" },
  { key: "ignored", label: "忽略" },
] as const;

export function MyJobsView() {
  const states = useUserJobStore((store) => store.states);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("saved");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const summary = useMemo(() => countMyJobs(states), [states]);

  const items = useMemo(() => {
    const all = mockJobs.filter((job) => {
      const state = states[job.id];
      if (!state) return false;
      if (activeTab === "saved") return state.saved;
      return state.status === activeTab;
    });
    return all;
  }, [activeTab, states]);

  useEffect(() => {
    const firstId = items[0]?.id;
    const selectedExists = items.some((job) => job.id === selectedId);

    if (firstId && (!selectedId || !selectedExists)) {
      setSelectedId(firstId);
    }
  }, [items, selectedId]);

  const selectedJob = items.find((job) => job.id === selectedId) ?? null;
  const hasStates = Object.keys(states).length > 0;

  return (
    <>
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-5">
          <div className="rounded-[30px] border border-line bg-surface p-5 shadow-panel">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">My Jobs</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-semibold">个人职位面板</h2>
                <p className="mt-2 text-sm text-muted">
                  集中查看你收藏、待看、已投或忽略的职位。
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryCard label="收藏" value={summary.saved} tone="salary" />
                <SummaryCard label="待看" value={summary.toReview} tone="accent" />
                <SummaryCard label="已投" value={summary.applied} tone="success" />
                <SummaryCard label="忽略" value={summary.ignored} tone="muted" />
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-line bg-surface p-5 shadow-panel">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            <div className="mt-5 space-y-4">
              {!hasStates ? <PageState mode="first-use" /> : null}
              {hasStates && !items.length ? <PageState mode="no-result" /> : null}
              {items.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  state={states[job.id]}
                  active={selectedId === job.id}
                  onClick={() => {
                    setSelectedId(job.id);
                    setDrawerOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden xl:block">
          <JobDetailPanel job={selectedJob} state={selectedId ? states[selectedId] : undefined} />
        </div>
      </section>

      <MobileDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        job={selectedJob}
        state={selectedId ? states[selectedId] : undefined}
      />
    </>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "salary" | "accent" | "success" | "muted";
}) {
  return (
    <div className="rounded-3xl border border-line bg-[#f5f2eb] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="font-heading text-2xl font-semibold">{value}</span>
        <Badge tone={tone}>{label}</Badge>
      </div>
    </div>
  );
}
