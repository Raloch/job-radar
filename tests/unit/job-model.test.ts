import { describe, expect, it } from "vitest";

import { filterJobs, sortJobs } from "@/entities/job/model";
import { mockJobs } from "@/mocks/jobs";

describe("job model", () => {
  it("filters by keyword and city", () => {
    const result = filterJobs(mockJobs, {
      keyword: "React",
      city: ["上海"],
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((job) => job.city === "上海")).toBe(true);
  });

  it("sorts by salary descending", () => {
    const result = sortJobs(mockJobs, "salary_desc");
    expect(result[0].salaryMax).toBeGreaterThanOrEqual(result[1].salaryMax);
  });
});
