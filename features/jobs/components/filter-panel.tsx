"use client";

import { type JobSearchParams, type PostedWithin } from "@/entities/job/types";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";

const experienceOptions = [
  { value: "intern", label: "实习" },
  { value: "junior", label: "1-3 年" },
  { value: "mid", label: "3-5 年" },
  { value: "senior", label: "5 年以上" },
] as const;

const educationOptions = [
  { value: "none", label: "不限" },
  { value: "college", label: "大专" },
  { value: "bachelor", label: "本科" },
  { value: "master_plus", label: "硕士+" },
] as const;

const remoteOptions = [
  { value: "onsite", label: "现场" },
  { value: "hybrid", label: "混合" },
  { value: "remote", label: "远程" },
] as const;

const postedOptions: Array<{ value: PostedWithin; label: string }> = [
  { value: "1d", label: "1 天内" },
  { value: "3d", label: "3 天内" },
  { value: "7d", label: "7 天内" },
  { value: "14d", label: "14 天内" },
  { value: "30d", label: "30 天内" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-4 first:border-none first:pt-0">
      <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-[0.16em] text-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Pill({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-2 text-sm transition",
        active
          ? "border-accent bg-[#e7f3f1] text-accent"
          : "border-line bg-[#f5f2eb] text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

type FilterPanelProps = {
  params: JobSearchParams;
  cities: string[];
  tags: string[];
  onChange: (next: JobSearchParams) => void;
};

function toggleArray<T extends string>(items: T[] | undefined, value: T) {
  if (!items?.includes(value)) return [...(items ?? []), value];
  const next = items.filter((item) => item !== value);
  return next.length ? next : undefined;
}

export function FilterPanel({ params, cities, tags, onChange }: FilterPanelProps) {
  return (
    <aside className="rounded-[30px] border border-line bg-surface p-5 shadow-panel">
      <Section title="关键词">
        <Input
          value={params.keyword ?? ""}
          onChange={(event) =>
            onChange({
              ...params,
              keyword: event.target.value || undefined,
            })
          }
          placeholder="React、Next.js、Design System..."
        />
      </Section>

      <Section title="城市">
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <Pill
              key={city}
              active={params.city?.includes(city)}
              onClick={() =>
                onChange({
                  ...params,
                  city: toggleArray(params.city, city),
                })
              }
            >
              {city}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="远程模式">
        <div className="flex flex-wrap gap-2">
          {remoteOptions.map((item) => (
            <Pill
              key={item.value}
              active={params.remoteMode?.includes(item.value)}
              onClick={() =>
                onChange({
                  ...params,
                  remoteMode: toggleArray(params.remoteMode, item.value),
                })
              }
            >
              {item.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="经验">
        <div className="flex flex-wrap gap-2">
          {experienceOptions.map((item) => (
            <Pill
              key={item.value}
              active={params.experienceLevel?.includes(item.value)}
              onClick={() =>
                onChange({
                  ...params,
                  experienceLevel: toggleArray(params.experienceLevel, item.value),
                })
              }
            >
              {item.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="学历">
        <div className="flex flex-wrap gap-2">
          {educationOptions.map((item) => (
            <Pill
              key={item.value}
              active={params.educationLevel?.includes(item.value)}
              onClick={() =>
                onChange({
                  ...params,
                  educationLevel: toggleArray(params.educationLevel, item.value),
                })
              }
            >
              {item.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="薪资范围">
        <div className="grid grid-cols-2 gap-2">
          <Input
            inputMode="numeric"
            value={params.salaryRange?.[0] ?? ""}
            placeholder="最低 k"
            onChange={(event) => {
              const nextMin = Number(event.target.value);
              onChange({
                ...params,
                salaryRange:
                  event.target.value || params.salaryRange?.[1]
                    ? [nextMin || 0, params.salaryRange?.[1] ?? 80]
                    : undefined,
              });
            }}
          />
          <Input
            inputMode="numeric"
            value={params.salaryRange?.[1] ?? ""}
            placeholder="最高 k"
            onChange={(event) => {
              const nextMax = Number(event.target.value);
              onChange({
                ...params,
                salaryRange:
                  params.salaryRange?.[0] || event.target.value
                    ? [params.salaryRange?.[0] ?? 0, nextMax || 80]
                    : undefined,
              });
            }}
          />
        </div>
      </Section>

      <Section title="发布时间">
        <div className="flex flex-wrap gap-2">
          {postedOptions.map((item) => (
            <Pill
              key={item.value}
              active={params.postedWithin === item.value}
              onClick={() =>
                onChange({
                  ...params,
                  postedWithin: params.postedWithin === item.value ? undefined : item.value,
                })
              }
            >
              {item.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="技术标签">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Pill
              key={tag}
              active={params.tags?.includes(tag)}
              onClick={() =>
                onChange({
                  ...params,
                  tags: toggleArray(params.tags, tag),
                })
              }
            >
              {tag}
            </Pill>
          ))}
        </div>
      </Section>
    </aside>
  );
}
