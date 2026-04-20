import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobCard } from "@/features/jobs/components/job-card";
import { mockJobs } from "@/mocks/jobs";

describe("JobCard", () => {
  it("renders key job information", () => {
    render(<JobCard job={mockJobs[0]} />);

    expect(screen.getByText(mockJobs[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockJobs[0].companyName)).toBeInTheDocument();
    expect(screen.getByText(/k-/)).toBeInTheDocument();
  });
});
