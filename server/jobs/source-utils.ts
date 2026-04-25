import {
  type EducationLevel,
  type ExperienceLevel,
  type JobPosting,
  type RemoteMode,
} from "@/entities/job/types";

const tagKeywords = [
  "React",
  "Vue",
  "TypeScript",
  "Next.js",
  "Node.js",
  "GraphQL",
  "Tailwind",
  "Vite",
  "ECharts",
  "Design System",
  "SSR",
  "BFF",
  "Canvas",
  "Three.js",
];

export function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function textToLines(text: string) {
  const lines = stripHtml(text)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 12);

  return lines.length ? lines : ["职位详情请查看原始链接"];
}

export function inferRemoteMode(...inputs: string[]): RemoteMode {
  const text = inputs.join(" ").toLowerCase();
  if (/(remote|远程|distributed)/.test(text)) return "remote";
  if (/(hybrid|混合)/.test(text)) return "hybrid";
  return "onsite";
}

export function inferTags(...inputs: string[]) {
  const text = inputs.join(" ").toLowerCase();
  return tagKeywords.filter((tag) => text.includes(tag.toLowerCase()));
}

export function inferExperienceLevel(...inputs: string[]): ExperienceLevel {
  const text = inputs.join(" ").toLowerCase();
  if (/(intern|实习)/.test(text)) return "intern";
  if (/(senior|staff|lead|资深|高级)/.test(text)) return "senior";
  if (/(junior|初级|entry)/.test(text)) return "junior";
  return "mid";
}

export function inferEducationLevel(...inputs: string[]): EducationLevel {
  const text = inputs.join(" ").toLowerCase();
  if (/(master|硕士|phd|博士)/.test(text)) return "master_plus";
  if (/(bachelor|本科)/.test(text)) return "bachelor";
  if (/(college|大专|associate)/.test(text)) return "college";
  return "none";
}

export function inferSalaryRange(...inputs: string[]): [number, number] {
  const text = inputs.join(" ");
  const matches = Array.from(text.matchAll(/(\d{1,3})\s*(?:k|K)/g)).map((match) =>
    Number(match[1]),
  );
  if (matches.length >= 2) {
    return [Math.min(matches[0], matches[1]), Math.max(matches[0], matches[1])];
  }
  return [0, 0];
}

export function makeCompanyProfile(location: string): JobPosting["companyProfile"] {
  return {
    location: location || "未提供",
  };
}
