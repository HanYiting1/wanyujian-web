export interface MarketCatalogEntry {
  code: string;
  name: string;
  englishName: string;
  knowledgeSupported: boolean;
}

/**
 * 内容预检可选择的全部市场：
 * - 前 15 个是 src/data/knowledge 下已有知识库的市场/区域；
 * - 其余为常见出海市场，没有本地知识库时走 DeepSeek 直检。
 */
export const MARKET_CATALOG = [
  { code: "BE", name: "比利时", englishName: "Belgium", knowledgeSupported: true },
  { code: "CH", name: "瑞士", englishName: "Switzerland", knowledgeSupported: true },
  { code: "DE", name: "德国", englishName: "Germany", knowledgeSupported: true },
  { code: "ES", name: "西班牙", englishName: "Spain", knowledgeSupported: true },
  { code: "EU", name: "欧盟", englishName: "European Union", knowledgeSupported: true },
  { code: "FR", name: "法国", englishName: "France", knowledgeSupported: true },
  { code: "ID", name: "印度尼西亚", englishName: "Indonesia", knowledgeSupported: true },
  { code: "LU", name: "卢森堡", englishName: "Luxembourg", knowledgeSupported: true },
  { code: "MAG", name: "马格里布", englishName: "Maghreb", knowledgeSupported: true },
  { code: "MC", name: "摩纳哥", englishName: "Monaco", knowledgeSupported: true },
  { code: "MY", name: "马来西亚", englishName: "Malaysia", knowledgeSupported: true },
  { code: "QC", name: "魁北克", englishName: "Quebec", knowledgeSupported: true },
  { code: "SG", name: "新加坡", englishName: "Singapore", knowledgeSupported: true },
  { code: "TH", name: "泰国", englishName: "Thailand", knowledgeSupported: true },
  { code: "VN", name: "越南", englishName: "Vietnam", knowledgeSupported: true },
  { code: "US", name: "美国", englishName: "United States", knowledgeSupported: false },
  { code: "GB", name: "英国", englishName: "United Kingdom", knowledgeSupported: false },
  { code: "IT", name: "意大利", englishName: "Italy", knowledgeSupported: false },
  { code: "NL", name: "荷兰", englishName: "Netherlands", knowledgeSupported: false },
  { code: "JP", name: "日本", englishName: "Japan", knowledgeSupported: false },
  { code: "KR", name: "韩国", englishName: "South Korea", knowledgeSupported: false },
  { code: "AE", name: "阿联酋", englishName: "United Arab Emirates", knowledgeSupported: false },
  { code: "SA", name: "沙特阿拉伯", englishName: "Saudi Arabia", knowledgeSupported: false },
  { code: "CA", name: "加拿大", englishName: "Canada", knowledgeSupported: false },
  { code: "AU", name: "澳大利亚", englishName: "Australia", knowledgeSupported: false },
  { code: "BR", name: "巴西", englishName: "Brazil", knowledgeSupported: false },
  { code: "MX", name: "墨西哥", englishName: "Mexico", knowledgeSupported: false },
  { code: "IN", name: "印度", englishName: "India", knowledgeSupported: false },
  { code: "PL", name: "波兰", englishName: "Poland", knowledgeSupported: false },
  { code: "SE", name: "瑞典", englishName: "Sweden", knowledgeSupported: false },
  { code: "TR", name: "土耳其", englishName: "Turkey", knowledgeSupported: false },
] as const satisfies readonly MarketCatalogEntry[];

export const DEFAULT_MARKET_CODE = "DE";

export function getMarketEntry(code: string): MarketCatalogEntry | undefined {
  return MARKET_CATALOG.find(
    (entry) => entry.code === code.trim().toUpperCase(),
  );
}

export function getMarketName(code: string): string {
  return getMarketEntry(code)?.name ?? code.toUpperCase();
}
