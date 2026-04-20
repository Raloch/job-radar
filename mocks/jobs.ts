import { jobPostingSchema, type JobPosting } from "@/entities/job/types";

const titles = [
  "前端工程师",
  "React 开发工程师",
  "Vue 前端工程师",
  "高级前端工程师",
  "前端基础架构工程师",
  "全栈工程师（偏前端）",
  "资深 React 工程师",
  "Web 平台开发工程师",
  "Design System 工程师",
  "可视化前端工程师",
  "Next.js 工程师",
  "前端性能工程师",
];

const companies = [
  "流光科技",
  "山海互动",
  "栈桥数字",
  "光帆网络",
  "零界产品实验室",
  "青木数据",
  "北斗浏览器",
  "星川协作",
  "节奏云",
  "开页工作室",
  "微迹智能",
  "图南科技",
];

const cities = ["上海", "北京", "深圳", "杭州", "远程"];
const tagsPool = [
  ["React", "TypeScript", "Next.js", "Tailwind"],
  ["Vue", "TypeScript", "Vite", "Pinia"],
  ["React", "Node.js", "GraphQL", "Design System"],
  ["TypeScript", "Next.js", "ECharts", "DataViz"],
  ["React", "Web 性能", "监控", "工程化"],
  ["Vue", "低代码", "组件库", "Monorepo"],
  ["React", "Three.js", "Canvas", "交互体验"],
  ["TypeScript", "前端架构", "BFF", "SSR"],
];

const industries = ["企业服务", "协作工具", "数据平台", "AI 工具", "开发者平台"];
const sizes = ["20-99 人", "100-499 人", "500-999 人", "1000+ 人"];
const stages = ["A 轮", "B 轮", "C 轮", "已盈利"];
const sources = ["Boss 直聘", "拉勾", "猎聘", "公司官网"];

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function createJob(index: number): JobPosting {
  const title = titles[index % titles.length];
  const companyName = companies[index % companies.length];
  const city = cities[index % cities.length];
  const tags = tagsPool[index % tagsPool.length];
  const remoteMode =
    city === "远程" ? "remote" : index % 3 === 0 ? "hybrid" : "onsite";
  const experienceLevel = (["intern", "junior", "mid", "senior"] as const)[index % 4];
  const educationLevel = (["none", "college", "bachelor", "master_plus"] as const)[
    (index + 1) % 4
  ];
  const salaryBase = 12 + (index % 8) * 4;
  const postedAt = daysAgo(index % 18);
  const sourceName = sources[index % sources.length];

  return {
    id: `job-${index + 1}`,
    title,
    companyName,
    city,
    remoteMode,
    salaryMin: salaryBase,
    salaryMax: salaryBase + 10 + (index % 3) * 4,
    experienceLevel,
    educationLevel,
    tags,
    postedAt,
    sourceName,
    sourceUrl: `https://example.com/jobs/job-${index + 1}`,
    description: {
      responsibilities: [
        `负责 ${title} 相关产品的桌面与移动 Web 端研发，推动核心业务模块交付。`,
        "与设计、产品、后端协作，推进复杂工作台型页面的信息架构与交互体验。",
        "持续优化列表性能、筛选体验、状态管理和设计系统一致性。",
      ],
      requirements: [
        "熟悉 React / Vue 其一，具备 TypeScript 项目经验。",
        "理解现代前端工程化、组件设计、状态管理和接口联调流程。",
        "关注信息产品的可读性、性能与交互细节。",
      ],
      bonuses: [
        "有 Next.js、SSR、BFF 或设计系统经验优先。",
        "有招聘、协作工具、工作台型产品经验更佳。",
      ],
    },
    companyProfile: {
      size: sizes[index % sizes.length],
      industry: industries[index % industries.length],
      stage: stages[index % stages.length],
      location: city === "远程" ? "分布式办公" : `${city} · 核心商圈`,
    },
  };
}

export const mockJobs = jobPostingSchema.array().parse(
  Array.from({ length: 72 }, (_, index) => createJob(index)),
);
