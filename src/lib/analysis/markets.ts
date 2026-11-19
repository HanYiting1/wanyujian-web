import type { MarketOption } from "@/lib/analysis/types";
import { MARKET_CATALOG } from "@/lib/markets/catalog";

export const MARKET_OPTIONS = MARKET_CATALOG.map((market) => ({
  code: market.code,
  name: market.name,
  englishName: market.englishName,
  status: "available" as const,
  knowledgeSupported: market.knowledgeSupported,
  dimensions: market.knowledgeSupported
    ? ["历史与文化语境", "广告合规", "语言歧义"]
    : ["知识库检测"],
})) satisfies readonly MarketOption[];

export const PLANNED_MARKETS = MARKET_CATALOG.filter(
  (market) => !market.knowledgeSupported,
).map((market) => market.name);
