export interface CompetitorCountry {
  code: string;
  name: string;
  englishName: string;
  tavilyCountry: string | null;
  language: string;
  knowledgeSupported: boolean;
}

/**
 * 竞品雷达的国家目录：既覆盖当前本地知识库国家（德国），也覆盖常见出海市场。
 * 竞品雷达不依赖本地知识库，因此这些国家可以实际传入 Tavily 搜索；
 * 内容合规预检是否可用仍以该市场的本地知识库为准。
 */
export const COMPETITOR_COUNTRIES = [
  {
    code: "DE",
    name: "德国",
    englishName: "Germany",
    tavilyCountry: "germany",
    language: "de",
    knowledgeSupported: true,
  },
  {
    code: "BE",
    name: "比利时",
    englishName: "Belgium",
    tavilyCountry: "belgium",
    language: "fr",
    knowledgeSupported: true,
  },
  {
    code: "EU",
    name: "欧盟",
    englishName: "European Union",
    tavilyCountry: null,
    language: "en",
    knowledgeSupported: true,
  },
  {
    code: "ID",
    name: "印度尼西亚",
    englishName: "Indonesia",
    tavilyCountry: "indonesia",
    language: "id",
    knowledgeSupported: true,
  },
  {
    code: "LU",
    name: "卢森堡",
    englishName: "Luxembourg",
    tavilyCountry: null,
    language: "fr",
    knowledgeSupported: true,
  },
  {
    code: "MAG",
    name: "马格里布",
    englishName: "Maghreb",
    tavilyCountry: null,
    language: "fr",
    knowledgeSupported: true,
  },
  {
    code: "MC",
    name: "摩纳哥",
    englishName: "Monaco",
    tavilyCountry: null,
    language: "fr",
    knowledgeSupported: true,
  },
  {
    code: "MY",
    name: "马来西亚",
    englishName: "Malaysia",
    tavilyCountry: "malaysia",
    language: "en",
    knowledgeSupported: true,
  },
  {
    code: "QC",
    name: "魁北克",
    englishName: "Quebec",
    tavilyCountry: null,
    language: "fr",
    knowledgeSupported: true,
  },
  {
    code: "TH",
    name: "泰国",
    englishName: "Thailand",
    tavilyCountry: "thailand",
    language: "th",
    knowledgeSupported: true,
  },
  {
    code: "VN",
    name: "越南",
    englishName: "Vietnam",
    tavilyCountry: "vietnam",
    language: "vi",
    knowledgeSupported: true,
  },
  {
    code: "US",
    name: "美国",
    englishName: "United States",
    tavilyCountry: "united states",
    language: "en",
    knowledgeSupported: false,
  },
  {
    code: "GB",
    name: "英国",
    englishName: "United Kingdom",
    tavilyCountry: "united kingdom",
    language: "en",
    knowledgeSupported: false,
  },
  {
    code: "FR",
    name: "法国",
    englishName: "France",
    tavilyCountry: "france",
    language: "fr",
    knowledgeSupported: false,
  },
  {
    code: "IT",
    name: "意大利",
    englishName: "Italy",
    tavilyCountry: "italy",
    language: "it",
    knowledgeSupported: false,
  },
  {
    code: "ES",
    name: "西班牙",
    englishName: "Spain",
    tavilyCountry: "spain",
    language: "es",
    knowledgeSupported: false,
  },
  {
    code: "NL",
    name: "荷兰",
    englishName: "Netherlands",
    tavilyCountry: "netherlands",
    language: "nl",
    knowledgeSupported: false,
  },
  {
    code: "JP",
    name: "日本",
    englishName: "Japan",
    tavilyCountry: "japan",
    language: "ja",
    knowledgeSupported: false,
  },
  {
    code: "KR",
    name: "韩国",
    englishName: "South Korea",
    tavilyCountry: "south korea",
    language: "ko",
    knowledgeSupported: false,
  },
  {
    code: "AE",
    name: "阿联酋",
    englishName: "United Arab Emirates",
    tavilyCountry: null,
    language: "en",
    knowledgeSupported: false,
  },
  {
    code: "SA",
    name: "沙特阿拉伯",
    englishName: "Saudi Arabia",
    tavilyCountry: null,
    language: "en",
    knowledgeSupported: false,
  },
  {
    code: "CA",
    name: "加拿大",
    englishName: "Canada",
    tavilyCountry: "canada",
    language: "en",
    knowledgeSupported: false,
  },
  {
    code: "AU",
    name: "澳大利亚",
    englishName: "Australia",
    tavilyCountry: "australia",
    language: "en",
    knowledgeSupported: false,
  },
  {
    code: "BR",
    name: "巴西",
    englishName: "Brazil",
    tavilyCountry: "brazil",
    language: "pt",
    knowledgeSupported: false,
  },
  {
    code: "MX",
    name: "墨西哥",
    englishName: "Mexico",
    tavilyCountry: "mexico",
    language: "es",
    knowledgeSupported: false,
  },
  {
    code: "IN",
    name: "印度",
    englishName: "India",
    tavilyCountry: "india",
    language: "en",
    knowledgeSupported: false,
  },
  {
    code: "SG",
    name: "新加坡",
    englishName: "Singapore",
    tavilyCountry: "singapore",
    language: "en",
    knowledgeSupported: false,
  },
  {
    code: "CH",
    name: "瑞士",
    englishName: "Switzerland",
    tavilyCountry: "switzerland",
    language: "de",
    knowledgeSupported: false,
  },
  {
    code: "SE",
    name: "瑞典",
    englishName: "Sweden",
    tavilyCountry: "sweden",
    language: "sv",
    knowledgeSupported: false,
  },
  {
    code: "PL",
    name: "波兰",
    englishName: "Poland",
    tavilyCountry: null,
    language: "pl",
    knowledgeSupported: false,
  },
  {
    code: "TR",
    name: "土耳其",
    englishName: "Turkey",
    tavilyCountry: null,
    language: "tr",
    knowledgeSupported: false,
  },
] as const satisfies readonly CompetitorCountry[];

export const DEFAULT_COMPETITOR_COUNTRY = COMPETITOR_COUNTRIES[0];

export function getCompetitorCountry(
  code: string,
): CompetitorCountry | undefined {
  return COMPETITOR_COUNTRIES.find(
    (country) => country.code === code.trim().toUpperCase(),
  );
}
