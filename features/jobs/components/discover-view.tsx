"use client";

import { useDeferredValue, useEffect, useMemo, useState, startTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { listJobs, getFilterOptions } from "@/shared/lib/jobs-repository";
import { type JobSearchParams } from "@/entities/job/types";
import { parseJobSearchParams, buildJobSearchQuery } from "@/shared/lib/query-params";
import { ActiveFilterChips } from "@/features/jobs/components/active-filter-chips";
import { FilterPanel } from "@/features/jobs/components/filter-panel";
import { JobCard } from "@/features/jobs/components/job-card";
import { JobDetailPanel } from "@/features/jobs/components/job-detail-panel";
import { MobileDetailDrawer } from "@/features/jobs/components/mobile-detail-drawer";
import { PageState } from "@/shared/ui/page-state";
import { Select } from "@/shared/ui/select";
import { useUserJobStore } from "@/stores/user-job-store";

function hasActiveFilters(params: JobSearchParams) {
  return Boolean(
      params.keyword ||
      params.city?.length ||
      params.source?.length ||
      params.remoteMode?.length ||
      params.experienceLevel?.length ||
      params.educationLevel?.length ||
      params.tags?.length ||
      params.salaryRange ||
      params.postedWithin,
  );
}

function removeFilterValue(params: JobSearchParams, key: keyof JobSearchParams, value?: string) {
  const next = { ...params };

  if (key === "keyword" || key === "salaryRange" || key === "postedWithin") {
    delete next[key];
    return next;
  }

  if (value && Array.isArray(next[key])) {
    const values = (next[key] as string[]).filter((item) => item !== value);
    if (values.length) {
      (next[key] as string[]) = values;
    } else {
      delete next[key];
    }
  }

  return next;
}

export function DiscoverView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentParams = useMemo(() => parseJobSearchParams(searchParams), [searchParams]);
  const deferredKeyword = useDeferredValue(currentParams.keyword);
  const queryParams = useMemo(
    () => ({ ...currentParams, keyword: deferredKeyword }),
    [currentParams, deferredKeyword],
  );
  const states = useUserJobStore((store) => store.states);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const jobsQuery = useQuery({
    queryKey: ["jobs", queryParams],
    queryFn: () => listJobs(queryParams),
  });
  const filtersQuery = useQuery({
    queryKey: ["job-filter-options"],
    queryFn: getFilterOptions,
  });

  useEffect(() => {
    const firstId = jobsQuery.data?.items[0]?.id;
    const selectedExists = jobsQuery.data?.items.some((job) => job.id === selectedId);

    if (firstId && (!selectedId || !selectedExists)) {
      setSelectedId(firstId);
    }
  }, [jobsQuery.data, selectedId]);

  const selectedJob = jobsQuery.data?.items.find((job) => job.id === selectedId) ?? null;

  const updateParams = (next: JobSearchParams) => {
    const query = buildJobSearchQuery(next);
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  };

  const resetFilters = () => {
    setSelectedId(null);
    startTransition(() => {
      router.replace(pathname);
    });
  };

  const noResults = !jobsQuery.isLoading && jobsQuery.data?.total === 0;
  const activeFilters = hasActiveFilters(currentParams);

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-workbench">
        <div className="xl:col-span-1">
          <FilterPanel
            params={currentParams}
            cities={filtersQuery.data?.cities ?? []}
            sources={filtersQuery.data?.sources ?? []}
            tags={filtersQuery.data?.tags ?? []}
            onChange={updateParams}
          />
        </div>

        <section className="min-w-0 xl:col-span-1">
          <div className="rounded-[30px] border border-line bg-surface p-5 shadow-panel">
            <div className="flex flex-col gap-4 border-b border-line pb-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
                    Discover
                  </p>
                  <h2 className="mt-1 font-heading text-2xl font-semibold">
                    {jobsQuery.data?.total ?? 0} 个前端相关岗位
                  </h2>
                </div>
                <Select
                  value={currentParams.sortBy ?? "latest"}
                  onChange={(event) =>
                    updateParams({
                      ...currentParams,
                      sortBy: event.target.value as JobSearchParams["sortBy"],
                    })
                  }
                >
                  <option value="latest">按最新发布</option>
                  <option value="salary_desc">按薪资从高到低</option>
                  <option value="salary_asc">按薪资从低到高</option>
                </Select>
              </div>
              <ActiveFilterChips
                params={currentParams}
                onRemove={(key, value) => updateParams(removeFilterValue(currentParams, key, value))}
                onReset={resetFilters}
              />
            </div>

            <div className="mt-5">
              {jobsQuery.isLoading ? <PageState mode="loading" /> : null}
              {jobsQuery.isError ? <PageState mode="error" /> : null}
              {noResults && activeFilters ? (
                <PageState mode="no-result" onReset={resetFilters} />
              ) : null}
              {noResults && !activeFilters ? (
                <PageState mode="empty" onReset={resetFilters} />
              ) : null}

              <div className="space-y-4">
                {jobsQuery.data?.items.map((job) => (
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
        </section>

        <div className="hidden xl:block">
          <JobDetailPanel job={selectedJob} state={selectedId ? states[selectedId] : undefined} />
        </div>
      </div>

      <MobileDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        job={selectedJob}
        state={selectedId ? states[selectedId] : undefined}
      />
    </>
  );
}
