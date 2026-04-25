import { describe, expect, it } from "vitest";

import { buildJobSearchQuery, parseJobSearchParams } from "@/shared/lib/query-params";

describe("query params", () => {
  it("parses url params into typed search params", () => {
    const searchParams = new URLSearchParams(
      "keyword=react&city=%E4%B8%8A%E6%B5%B7,%E5%8C%97%E4%BA%AC&source=Greenhouse&sortBy=latest",
    );
    const parsed = parseJobSearchParams(searchParams);

    expect(parsed.keyword).toBe("react");
    expect(parsed.city).toEqual(["上海", "北京"]);
    expect(parsed.source).toEqual(["Greenhouse"]);
  });

  it("builds url query strings", () => {
    const query = buildJobSearchQuery({
      keyword: "next",
      city: ["杭州"],
      source: ["Lever"],
      sortBy: "salary_desc",
    });

    expect(query).toContain("keyword=next");
    expect(query).toContain("city=%E6%9D%AD%E5%B7%9E");
    expect(query).toContain("source=Lever");
  });
});
