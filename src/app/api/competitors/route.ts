
import { getCompetitorCountry } from "@/lib/competitors/countries";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

type TavilyResponse = {
  results?: TavilyResult[];
};

export async function POST(request: Request) {
  // 1. 读取用户输入
  const body: unknown = await request.json().catch(() => null);

  if (
    !body ||
    typeof body !== "object" ||
    !("product" in body) ||
    typeof body.product !== "string"
  ) {
    return Response.json(
      { error: "请提供产品关键词" },
      { status: 400 }
    );
  }

  const product = body.product.trim();
  const countryCode =
    "country" in body && typeof body.country === "string"
      ? body.country.trim().toUpperCase()
      : "DE";
  const country = getCompetitorCountry(countryCode);
  const rawIndustry =
    "industry" in body && typeof body.industry === "string"
      ? body.industry.trim()
      : "";
  const industry = rawIndustry || "护肤品";

  if (!product || product.length > 60) {
    return Response.json(
      { error: "产品关键词长度应为1到60个字符" },
      { status: 400 }
    );
  }

  if (!country) {
    return Response.json(
      { error: "暂不支持该目标国家/地区" },
      { status: 400 }
    );
  }

  if (industry.length > 60) {
    return Response.json(
      { error: "行业名称长度不应超过60个字符" },
      { status: 400 }
    );
  }

  // 2. 读取服务端密钥
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "搜索服务尚未配置" },
      { status: 500 }
    );
  }

  // 3. 按目标市场、行业和产品关键词构造搜索词
  const query =
    `${product} ${industry} ${country.englishName} brands products official site`;

  try {
    // 4. 请求 Tavily 搜索 API
    const response = await fetch(
      "https://api.tavily.com/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          query,
          topic: "general",
          search_depth: "basic",
          max_results: 8,
          ...(country.tavilyCountry
            ? { country: country.tavilyCountry }
            : {}),
          ...(country.language ? { language: country.language } : {}),
          include_answer: false,
          include_raw_content: false,
        }),
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Tavily status:", response.status);

      return Response.json(
        { error: "外部搜索服务暂时不可用" },
        { status: 502 }
      );
    }

    // 5. 解析搜索结果
    const data: TavilyResponse = await response.json();

    const results = (Array.isArray(data?.results)
      ? data.results
      : []
    )
      .filter(
        (item) =>
          typeof item?.url === "string" &&
          typeof item?.title === "string"
      )
      .map((item) => ({
        title: item.title!,
        url: item.url!,
        snippet: item.content ?? "",
        score: item.score ?? null,
        verificationStatus: "unreviewed" as const,
      }))
      .filter((item) => {
        try {
          const protocol = new URL(item.url).protocol;
          return protocol === "https:" || protocol === "http:";
        } catch {
          return false;
        }
      })
      .filter(
        (item, index, array) =>
          array.findIndex((other) => other.url === item.url) === index
      );

    // 6. 将数据返回给前端
    return Response.json({
      market: country.name,
      country: country.code,
      industry,
      product,
      query,
      searchedAt: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("Competitor search failed:", error);

    return Response.json(
      { error: "搜索失败或请求超时，请稍后重试" },
      { status: 504 }
    );
  }
}