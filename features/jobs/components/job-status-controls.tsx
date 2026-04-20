"use client";

import { Bookmark, BookmarkCheck, Eye, EyeOff, Send, RotateCcw } from "lucide-react";

import { type UserJobStatus } from "@/entities/job/types";
import { useUserJobStore } from "@/stores/user-job-store";
import { Button } from "@/shared/ui/button";

export function JobStatusControls({
  jobId,
  saved,
  status,
  compact = false,
}: {
  jobId: string;
  saved: boolean;
  status: UserJobStatus;
  compact?: boolean;
}) {
  const toggleSaved = useUserJobStore((state) => state.toggleSaved);
  const setStatus = useUserJobStore((state) => state.setStatus);
  const resetState = useUserJobStore((state) => state.resetState);

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "grid gap-2 sm:grid-cols-2"}>
      <Button
        variant={saved ? "primary" : "secondary"}
        size="sm"
        onClick={() => toggleSaved(jobId)}
      >
        {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        {saved ? "已收藏" : "收藏"}
      </Button>
      <Button
        variant={status === "to_review" ? "primary" : "secondary"}
        size="sm"
        onClick={() => setStatus(jobId, "to_review")}
      >
        <Eye size={15} />
        待看
      </Button>
      <Button
        variant={status === "applied" ? "primary" : "secondary"}
        size="sm"
        onClick={() => setStatus(jobId, "applied")}
      >
        <Send size={15} />
        已投
      </Button>
      <Button
        variant={status === "ignored" ? "danger" : "secondary"}
        size="sm"
        onClick={() => setStatus(jobId, "ignored")}
      >
        <EyeOff size={15} />
        忽略
      </Button>
      <Button className="sm:col-span-2" variant="ghost" size="sm" onClick={() => resetState(jobId)}>
        <RotateCcw size={15} />
        恢复默认状态
      </Button>
    </div>
  );
}
