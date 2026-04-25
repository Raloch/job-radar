"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Database, HardDriveDownload, RefreshCcw, Server } from "lucide-react";

import {
  getSyncDashboardStatus,
  getSourceFeedConfig,
  triggerSyncJobSources,
  updateSourceFeedConfig,
  validateSourceFeedConfig,
  type SourceFeedConfig,
  type SourceFeedEntry,
  type SourceFeedValidationResponse,
} from "@/shared/lib/admin-repository";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { PageState } from "@/shared/ui/page-state";
import { Input } from "@/shared/ui/input";

function formatSyncTime(value: string | null) {
  if (!value) return "尚未同步";
  return new Date(value).toLocaleString("zh-CN");
}

function modeLabel(mode: "memory" | "database") {
  return mode === "database" ? "PostgreSQL 持久化" : "内存模式";
}

function statusTone(status: "success" | "partial" | "failed") {
  if (status === "success") return "success" as const;
  if (status === "partial") return "salary" as const;
  return "muted" as const;
}

function statusLabel(status: "success" | "partial" | "failed") {
  if (status === "success") return "成功";
  if (status === "partial") return "部分回退";
  return "失败";
}

export function SyncAdminView() {
  const queryClient = useQueryClient();
  const statusQuery = useQuery({
    queryKey: ["sync-dashboard-status"],
    queryFn: getSyncDashboardStatus,
  });
  const configQuery = useQuery({
    queryKey: ["source-feed-config"],
    queryFn: getSourceFeedConfig,
  });
  const [formState, setFormState] = useState<SourceFeedConfig | null>(null);
  const [validationResult, setValidationResult] = useState<SourceFeedValidationResponse | null>(
    null,
  );

  useEffect(() => {
    if (configQuery.data) {
      setFormState(configQuery.data.config);
    }
  }, [configQuery.data]);

  const syncMutation = useMutation({
    mutationFn: triggerSyncJobSources,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sync-dashboard-status"] }),
        queryClient.invalidateQueries({ queryKey: ["jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["job-filter-options"] }),
        queryClient.invalidateQueries({ queryKey: ["my-jobs-source"] }),
      ]);
    },
  });
  const validateMutation = useMutation({
    mutationFn: validateSourceFeedConfig,
    onSuccess: (result) => {
      setValidationResult(result);
    },
  });
  const saveAndSyncMutation = useMutation({
    mutationFn: async (config: SourceFeedConfig) => {
      const validation = await validateSourceFeedConfig(config);
      if (!validation.valid) {
        const error = new Error("配置校验未通过");
        (error as Error & { validation?: SourceFeedValidationResponse }).validation = validation;
        throw error;
      }

      const saved = await updateSourceFeedConfig(config);
      const sync = await triggerSyncJobSources();
      return {
        saved,
        sync,
        validation,
      };
    },
    onSuccess: async (result) => {
      setFormState(result.saved.config);
      setValidationResult(result.validation);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["source-feed-config"] }),
        queryClient.invalidateQueries({ queryKey: ["sync-dashboard-status"] }),
        queryClient.invalidateQueries({ queryKey: ["jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["job-filter-options"] }),
        queryClient.invalidateQueries({ queryKey: ["my-jobs-source"] }),
      ]);
    },
    onError: (error) => {
      const maybeValidation = (error as Error & { validation?: SourceFeedValidationResponse })
        .validation;
      if (maybeValidation) {
        setValidationResult(maybeValidation);
      }
    },
  });

  if (statusQuery.isLoading || configQuery.isLoading) return <PageState mode="loading" />;
  if (statusQuery.isError || !statusQuery.data) return <PageState mode="error" />;
  if (configQuery.isError || !configQuery.data || !formState) return <PageState mode="error" />;

  const status = statusQuery.data;

  return (
    <section className="space-y-5">
      <div className="rounded-[30px] border border-line bg-surface p-5 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
              Sync Admin
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold">多来源同步管理</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              统一查看当前启用的数据源、同步模式和聚合结果，并手动触发一次新的聚合同步。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={status.mode === "database" ? "success" : "muted"}>
              {modeLabel(status.mode)}
            </Badge>
            <Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
              <RefreshCcw size={15} className={syncMutation.isPending ? "animate-spin" : ""} />
              {syncMutation.isPending ? "同步中..." : "立即同步"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Server size={18} />}
          label="启用来源"
          value={String(status.totalSources)}
          helper="当前会参与同步的数据源数量"
        />
        <MetricCard
          icon={<HardDriveDownload size={18} />}
          label="原始抓取"
          value={String(status.totalRawJobs)}
          helper="同步阶段抓到的原始职位记录"
        />
        <MetricCard
          icon={<Database size={18} />}
          label="聚合职位"
          value={String(status.totalAggregatedJobs)}
          helper="去重归并后的职位总数"
        />
        <MetricCard
          icon={<RefreshCcw size={18} />}
          label="上次同步"
          value={formatSyncTime(status.lastSyncedAt)}
          helper="最近一次同步完成时间"
        />
      </div>

      {syncMutation.isError ? (
        <div className="rounded-[24px] border border-[#e2c8bb] bg-[#fff3ee] px-5 py-4 text-sm text-[#8c4d32]">
          同步失败，请检查终端日志或当前来源配置。
        </div>
      ) : null}

      {syncMutation.isSuccess ? (
        <div className="rounded-[24px] border border-[#b9d8c7] bg-[#eff8f2] px-5 py-4 text-sm text-success">
          同步已完成：抓取 {syncMutation.data.totalRawJobs} 条原始记录，聚合为{" "}
          {syncMutation.data.totalAggregatedJobs} 条职位，状态为
          {statusLabel(syncMutation.data.status)}。
        </div>
      ) : null}

      <div className="rounded-[30px] border border-line bg-surface p-5 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-heading text-lg font-semibold">来源配置</p>
            <p className="mt-1 text-sm text-muted">
              已配置真实站点时优先抓取公开职位板，否则自动回退到 fixture。
            </p>
          </div>
          <Badge tone="accent">{status.sources.length} 个来源</Badge>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {status.sources.map((source) => (
            <div
              key={source.id}
              className="rounded-[24px] border border-line bg-[#f7f4ed] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-lg font-semibold">{source.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    类型：{source.type} · {source.isActive ? "启用中" : "已停用"}
                  </p>
                </div>
                <Badge tone={source.usesFixtureFallback ? "muted" : "success"}>
                  {source.usesFixtureFallback ? "Fixture Fallback" : "Live Source"}
                </Badge>
              </div>

              <div className="mt-4 space-y-2 text-sm text-muted">
                <p>展示名：{source.label}</p>
                <p>站点 Key：{source.siteKey ?? "未配置"}</p>
                <p className="break-all">Base URL：{source.baseUrl}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[30px] border border-line bg-surface p-5 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-heading text-lg font-semibold">来源配置表单</p>
            <p className="mt-1 text-sm text-muted">
              保存后立即生效，下一次点击“立即同步”会按这里的配置抓取真实源。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={status.configSource === "file" ? "success" : "muted"}>
              {status.configSource === "file" ? "文件配置" : "环境变量配置"}
            </Badge>
            <span className="text-xs text-muted">{status.configPath}</span>
          </div>
        </div>

        <div className="mt-5 space-y-6">
          <div className="rounded-[24px] border border-line bg-[#f8f6f1] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ink">Manual Import</p>
                <p className="mt-1 text-sm text-muted">
                  关闭后只保留真实公开源，不再注入本地 manual fixture。
                </p>
              </div>
              <Button
                variant={formState.manualImportEnabled ? "primary" : "secondary"}
                size="sm"
                onClick={() =>
                  setFormState((current) =>
                    current
                      ? { ...current, manualImportEnabled: !current.manualImportEnabled }
                      : current,
                  )
                }
              >
                {formState.manualImportEnabled ? "已开启" : "已关闭"}
              </Button>
            </div>
          </div>

          <SourceFeedEditor
            title="Greenhouse 站点"
            helper="使用 board token 和展示名配置多个 Greenhouse 职位板。"
            items={formState.greenhouseBoards}
            onChange={(items) => setFormState((current) => (current ? { ...current, greenhouseBoards: items } : current))}
          />

          <SourceFeedEditor
            title="Lever 站点"
            helper="使用 site key 和展示名配置多个 Lever 公共职位板。"
            items={formState.leverSites}
            onChange={(items) => setFormState((current) => (current ? { ...current, leverSites: items } : current))}
          />

          {validateMutation.isError ? (
            <div className="rounded-[24px] border border-[#e2c8bb] bg-[#fff3ee] px-5 py-4 text-sm text-[#8c4d32]">
              配置校验失败，请稍后重试。
            </div>
          ) : null}

          {validationResult ? (
            <div className="rounded-[24px] border border-line bg-[#f8f6f1] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-ink">来源校验结果</p>
                <Badge tone={validationResult.valid ? "success" : "salary"}>
                  {validationResult.valid ? "全部通过" : "存在失败项"}
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 xl:grid-cols-2">
                {validationResult.results.map((item) => (
                  <div
                    key={`${item.type}-${item.siteKey ?? "manual"}`}
                    className="rounded-[20px] border border-line bg-white px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-ink">{item.name}</p>
                      <Badge tone={item.status === "success" ? "success" : "salary"}>
                        {item.status === "success" ? "通过" : "失败"}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-muted">
                      <p>类型：{item.type}</p>
                      <p>站点 Key：{item.siteKey ?? "manual"}</p>
                      <p>结果：{item.message}</p>
                      {item.httpStatus ? <p>HTTP：{item.httpStatus}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {saveAndSyncMutation.isError ? (
            <div className="rounded-[24px] border border-[#e2c8bb] bg-[#fff3ee] px-5 py-4 text-sm text-[#8c4d32]">
              保存并同步失败，请先修复校验未通过的来源配置。
            </div>
          ) : null}

          {saveAndSyncMutation.isSuccess ? (
            <div className="rounded-[24px] border border-[#b9d8c7] bg-[#eff8f2] px-5 py-4 text-sm text-success">
              配置已保存并自动同步：抓取 {saveAndSyncMutation.data.sync.totalRawJobs} 条原始记录，
              聚合 {saveAndSyncMutation.data.sync.totalAggregatedJobs} 条职位。
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => validateMutation.mutate(formState)}
              disabled={validateMutation.isPending || saveAndSyncMutation.isPending}
            >
              {validateMutation.isPending ? "校验中..." : "校验配置"}
            </Button>
            <Button
              onClick={() => saveAndSyncMutation.mutate(formState)}
              disabled={saveAndSyncMutation.isPending || validateMutation.isPending}
            >
              {saveAndSyncMutation.isPending ? "保存并同步中..." : "保存并同步"}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-[30px] border border-line bg-surface p-5 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-heading text-lg font-semibold">最近同步记录</p>
            <p className="mt-1 text-sm text-muted">
              展示最近 10 次同步结果，包括来源级回退和错误信息。
            </p>
          </div>
          <Badge tone="accent">{status.recentRuns.length} 条记录</Badge>
        </div>

        <div className="mt-5 space-y-4">
          {status.recentRuns.length ? (
            status.recentRuns.map((run) => (
              <div key={run.id} className="rounded-[24px] border border-line bg-[#f8f6f1] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-lg font-semibold">
                        {formatSyncTime(run.finishedAt)}
                      </p>
                      <Badge tone={statusTone(run.status)}>{statusLabel(run.status)}</Badge>
                      <Badge tone={run.mode === "database" ? "success" : "muted"}>
                        {modeLabel(run.mode)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      原始抓取 {run.totalRawJobs} 条，聚合 {run.totalAggregatedJobs} 条，来源{" "}
                      {run.totalSources} 个。
                    </p>
                  </div>
                  <p className="text-xs text-muted">
                    开始：{formatSyncTime(run.startedAt)} / 结束：{formatSyncTime(run.finishedAt)}
                  </p>
                </div>

                {run.errorMessage ? (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl border border-[#e7cfbf] bg-[#fff6ef] px-4 py-3 text-sm text-[#8c4d32]">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span>{run.errorMessage}</span>
                  </div>
                ) : null}

                <div className="mt-4 grid gap-3 xl:grid-cols-2">
                  {run.sourceRuns.map((sourceRun) => (
                    <div
                      key={`${run.id}-${sourceRun.feedId}`}
                      className="rounded-[20px] border border-line bg-white px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-ink">{sourceRun.sourceName}</p>
                        <Badge tone={statusTone(sourceRun.status)}>
                          {statusLabel(sourceRun.status)}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-muted">
                        <p>
                          类型：{sourceRun.sourceType} · 原始记录：{sourceRun.rawJobsCount}
                        </p>
                        <p>
                          数据模式：
                          {sourceRun.usedFixtureFallback ? "Fixture Fallback" : "Live Source"}
                        </p>
                        {sourceRun.errorMessage ? <p>错误：{sourceRun.errorMessage}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <PageState mode="first-use" />
          )}
        </div>
      </div>
    </section>
  );
}

function SourceFeedEditor({
  title,
  helper,
  items,
  onChange,
}: {
  title: string;
  helper: string;
  items: SourceFeedEntry[];
  onChange: (items: SourceFeedEntry[]) => void;
}) {
  return (
    <div className="rounded-[24px] border border-line bg-[#f8f6f1] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{title}</p>
          <p className="mt-1 text-sm text-muted">{helper}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange([...items, { key: "", label: "" }])}
        >
          新增站点
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item, index) => (
            <div key={`${title}-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Input
                value={item.key}
                placeholder="site key / board token"
                onChange={(event) =>
                  onChange(
                    items.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, key: event.target.value } : entry,
                    ),
                  )
                }
              />
              <Input
                value={item.label}
                placeholder="展示名"
                onChange={(event) =>
                  onChange(
                    items.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, label: event.target.value } : entry,
                    ),
                  )
                }
              />
              <Button
                variant="danger"
                size="sm"
                onClick={() => onChange(items.filter((_, entryIndex) => entryIndex !== index))}
              >
                删除
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">当前未配置站点。</p>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[26px] border border-line bg-surface p-5 shadow-panel">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ede8de] text-accent">
        {icon}
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-heading text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{helper}</p>
    </div>
  );
}
