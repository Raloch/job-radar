"use client";

import { X } from "lucide-react";

import { type JobSearchParams } from "@/entities/job/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

function renderSalary(value?: [number, number]) {
  if (!value) return null;
  return `${value[0]}k-${value[1]}k`;
}

export function ActiveFilterChips({
  params,
  onRemove,
  onReset,
}: {
  params: JobSearchParams;
  onRemove: (key: keyof JobSearchParams, value?: string) => void;
  onReset: () => void;
}) {
  const items: Array<{ key: keyof JobSearchParams; label: string; value?: string }> = [];

  if (params.keyword) items.push({ key: "keyword", label: params.keyword });
  params.city?.forEach((value) => items.push({ key: "city", label: value, value }));
  params.remoteMode?.forEach((value) => items.push({ key: "remoteMode", label: value, value }));
  params.experienceLevel?.forEach((value) =>
    items.push({ key: "experienceLevel", label: value, value }),
  );
  params.educationLevel?.forEach((value) =>
    items.push({ key: "educationLevel", label: value, value }),
  );
  params.tags?.forEach((value) => items.push({ key: "tags", label: value, value }));
  if (params.salaryRange) {
    items.push({ key: "salaryRange", label: renderSalary(params.salaryRange) ?? "" });
  }
  if (params.postedWithin) {
    items.push({ key: "postedWithin", label: `发布时间 ${params.postedWithin}` });
  }

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => (
        <Badge
          key={`${item.key}-${item.label}-${index}`}
          tone="accent"
          className="inline-flex items-center gap-1 pr-1"
        >
          {item.label}
          <button
            type="button"
            className="rounded-full p-0.5 hover:bg-[#d3ebe5]"
            onClick={() => onRemove(item.key, item.value)}
            aria-label={`移除 ${item.label}`}
          >
            <X size={12} />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={onReset}>
        清空筛选
      </Button>
    </div>
  );
}
