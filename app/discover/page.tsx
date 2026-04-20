import { Suspense } from "react";

import { DiscoverView } from "@/features/jobs/components/discover-view";
import { PageState } from "@/shared/ui/page-state";

export default function DiscoverPage() {
  return (
    <Suspense fallback={<PageState mode="loading" />}>
      <DiscoverView />
    </Suspense>
  );
}
