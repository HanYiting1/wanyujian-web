import type { MarketOption } from "@/lib/analysis/types";

export const MARKET_OPTIONS = [
  {
    code: "DE",
    name: "德国",
    englishName: "Germany",
    status: "available",
    dimensions: ["历史与文化语境", "广告合规", "语言歧义"],
  },
] as const satisfies readonly MarketOption[];

export const PLANNED_MARKETS = ["法国", "日本", "阿联酋"] as const;
