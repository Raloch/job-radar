import { UserJobStatus } from "@/entities/job/types";

export function formatSalaryRange(min: number, max: number) {
  return `${min}k-${max}k`;
}

export function formatRemoteMode(remoteMode: string) {
  if (remoteMode === "remote") return "远程";
  if (remoteMode === "hybrid") return "混合";
  return "现场";
}

export function formatExperienceLevel(level: string) {
  const labels: Record<string, string> = {
    intern: "实习",
    junior: "1-3 年",
    mid: "3-5 年",
    senior: "5 年以上",
  };

  return labels[level] ?? level;
}

export function formatEducationLevel(level: string) {
  const labels: Record<string, string> = {
    none: "不限",
    college: "大专",
    bachelor: "本科",
    master_plus: "硕士+",
  };

  return labels[level] ?? level;
}

export function formatStatusLabel(status: UserJobStatus) {
  const labels: Record<UserJobStatus, string> = {
    default: "未标记",
    to_review: "待看",
    applied: "已投",
    ignored: "忽略",
  };

  return labels[status];
}

export function formatRelativeDate(isoDate: string) {
  const now = new Date();
  const date = new Date(isoDate);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days <= 0) return "今天";
  if (days === 1) return "1 天前";
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
