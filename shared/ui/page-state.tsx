import { SearchX, Sparkles, WifiOff } from "lucide-react";

import { Button } from "@/shared/ui/button";

type PageStateProps = {
  mode: "loading" | "empty" | "no-result" | "error" | "first-use";
  onReset?: () => void;
};

export function PageState({ mode, onReset }: PageStateProps) {
  if (mode === "loading") {
    return (
      <div className="rounded-[28px] border border-line bg-surface p-8">
        <div className="h-5 w-40 animate-pulse rounded-full bg-[#ebe6db]" />
        <div className="mt-4 space-y-3">
          <div className="h-24 animate-pulse rounded-3xl bg-[#efeae0]" />
          <div className="h-24 animate-pulse rounded-3xl bg-[#efeae0]" />
          <div className="h-24 animate-pulse rounded-3xl bg-[#efeae0]" />
        </div>
      </div>
    );
  }

  const config = {
    empty: {
      icon: Sparkles,
      title: "这里还没有职位数据",
      description: "当前数据源为空，先补充 mock 数据或接入 API 再继续。",
    },
    "no-result": {
      icon: SearchX,
      title: "没有匹配结果",
      description: "换个关键词、放宽标签或清空筛选后再试一次。",
    },
    error: {
      icon: WifiOff,
      title: "职位加载失败",
      description: "数据请求没有成功返回，可以稍后重试。",
    },
    "first-use": {
      icon: Sparkles,
      title: "你的职位面板还是空的",
      description: "去发现页收藏、标记已投或待看之后，这里就会出现记录。",
    },
  } as const;

  const item = config[mode];
  const Icon = item.icon;

  return (
    <div className="rounded-[28px] border border-dashed border-line bg-surface px-8 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ece8de] text-accent">
        <Icon size={24} />
      </div>
      <h3 className="mt-4 font-heading text-xl font-semibold text-ink">{item.title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{item.description}</p>
      {onReset ? (
        <Button className="mt-5" variant="secondary" onClick={onReset}>
          清空筛选
        </Button>
      ) : null}
    </div>
  );
}
