"use client";

import { X } from "lucide-react";

import { type JobPosting, type UserJobState } from "@/entities/job/types";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { JobDetailPanel } from "@/features/jobs/components/job-detail-panel";

export function MobileDetailDrawer({
  open,
  onClose,
  job,
  state,
}: {
  open: boolean;
  onClose: () => void;
  job: JobPosting | null;
  state?: UserJobState;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-[#1c273640] transition xl:hidden",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 right-0 w-full max-w-xl transform overflow-auto bg-canvas p-4 transition sm:p-6",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="mb-4 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            <X size={15} />
            关闭
          </Button>
        </div>
        <JobDetailPanel job={job} state={state} />
      </div>
    </div>
  );
}
