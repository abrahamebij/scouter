import { PreStockDerived } from "@/lib/prestocks/types";
import { getCompanyName, normalizeSymbol } from "@/lib/prestocks/transforms";
import { ScoutReport, ResearchEvent, ResearchSource } from "./schemas";

// In-memory cache of generated reports to minimize API calls (24 hour TTL)
const reportCache = new Map<string, { report: ScoutReport; cachedAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const GEMINI_API_BASE =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Retrieves a cached ScoutReport if fresh.
 */
export function getCachedScoutReport(symbol: string): ScoutReport | null {
  const norm = normalizeSymbol(symbol);
  const entry = reportCache.get(norm);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    reportCache.delete(norm);
    return null;
  }
  return entry.report;
}

/**
 * Stores a ScoutReport in the server cache.
 */
export function setCachedScoutReport(symbol: string, report: ScoutReport): void {
  const norm = normalizeSymbol(symbol);
  reportCache.set(norm, { report, cachedAt: Date.now() });
}

function extractJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\r?\n?/i, "");
    cleaned = cleaned.replace(/\r?\n?```\s*$/i, "");
    cleaned = cleaned.trim();
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

/**
 * Generates an intelligence Scout Report for a company using Gemini with Google Search Grounding.
 */
export async function generateScoutReport(
  product: PreStockDerived,
  forceRefresh = false
): Promise<ScoutReport> {
  const norm = normalizeSymbol(product.symbol);
  const companyName = getCompanyName(product.name);

  if (!forceRefresh) {
    const cached = getCachedScoutReport(norm);
    if (cached) return cached;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in the server environment. Please set it in .env.local"
    );
  }

  const prompt = `You are Scouter's Private Market Intelligence Engine.
Analyze the following private company which has a tokenised valuation asset on PreStocks (Solana):

Company Name: ${companyName}
Symbol: $${product.symbol}
PreStocks Product Description: ${product.description}
PreStocks Token Price: $${product.tokenPrice.toFixed(2)}
Official Mark Price: $${product.markPrice.toFixed(2)}
Implied Valuation: $${(product.impliedValuation / 1e9).toFixed(1)}B
Solana Mint: ${product.contract_address}

CRITICAL RULES AND GUARDRAILS:
1. Do not provide financial or investment advice.
2. Do not recommend buying, selling, or holding.
3. Do not invent facts, valuation numbers, funding rounds, or sources.
4. PreStocks tokens represent 1:1 backed SPV economic exposure tracking private company valuation, NOT direct equity or voting rights.
5. Use Google Search grounding to retrieve verified current public facts and recent developments (last 6-12 months).
6. Return strictly valid JSON. Do not include markdown commentary or preamble outside the JSON object.

JSON Schema format required:
{
  "overview": "Concise verified summary of what the company does (2-3 sentences)",
  "sector": "e.g. Artificial Intelligence, Defense Tech, Prediction Markets, Aerospace, Robotics",
  "foundedYear": 2015,
  "headquarters": "City, State/Country",
  "businessModel": "Concise 1-2 sentence description of how the company generates revenue",
  "notableFacts": [
    "Fact 1 with verified metrics",
    "Fact 2",
    "Fact 3"
  ],
  "recentDevelopments": [
    {
      "title": "Clear concise event title",
      "summary": "1-2 sentence factual summary of the event",
      "date": "Month Year or specific date",
      "category": "funding | company | product | partnership | acquisition | regulatory | market | prestocks | other",
      "sourceTitle": "Publication or Official Source Name",
      "sourceUrl": "https://..."
    }
  ],
  "sources": [
    {
      "title": "Source page title",
      "url": "https://...",
      "domain": "example.com"
    }
  ]
}

Provide 3 to 5 recent developments if verified sources exist. Always include accurate URLs.`;

  // Note: Gemini API does not allow responseMimeType: "application/json" when tools (googleSearch) are enabled
  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ googleSearch: {} }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  };

  const response = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Research API Error:", response.status, errorText);
    if (response.status === 429) {
      throw new Error("Research service is currently at capacity. Please wait a few seconds and try again.");
    }
    throw new Error(`Research service returned status ${response.status}`);
  }

  const json = await response.json();
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const rawText = parts.map((p: { text?: string }) => p.text || "").join("");

  if (!rawText) {
    throw new Error("Empty or malformed response returned from research service");
  }

  let parsed: Partial<ScoutReport>;
  try {
    const jsonString = extractJson(rawText);
    parsed = JSON.parse(jsonString);
  } catch {
    try {
      const sanitized = extractJson(rawText).replace(/(?<=:\s*"[\s\S]*?)\r?\n(?=[\s\S]*?")/g, "\\n");
      parsed = JSON.parse(sanitized);
    } catch {
      const overviewMatch = rawText.match(/"overview"\s*:\s*"([\s\S]*?)"\s*,\s*"/i);
      parsed = {
        symbol: product.symbol.toUpperCase(),
        companyName: companyName,
        overview: overviewMatch ? overviewMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : rawText.slice(0, 500),
        notableFacts: [],
        recentDevelopments: [],
        sources: [],
      };
    }
  }

  // Extract grounding search metadata / web sources if returned by Gemini
  const groundingChunks =
    json?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const groundedSources: ResearchSource[] = [];

  for (const chunk of groundingChunks) {
    if (chunk?.web?.uri) {
      try {
        const parsedUrl = new URL(chunk.web.uri);
        groundedSources.push({
          title: chunk.web.title || parsedUrl.hostname,
          url: chunk.web.uri,
          domain: parsedUrl.hostname.replace(/^www\./, ""),
        });
      } catch {
        // Skip invalid URL
      }
    }
  }

  // Combine model sources with Google grounding sources
  const mergedSourcesMap = new Map<string, ResearchSource>();
  for (const s of groundedSources) {
    mergedSourcesMap.set(s.url, s);
  }
  if (Array.isArray(parsed.sources)) {
    for (const s of parsed.sources) {
      if (s?.url) {
        try {
          const parsedUrl = new URL(s.url);
          mergedSourcesMap.set(s.url, {
            title: s.title || parsedUrl.hostname,
            url: s.url,
            domain: s.domain || parsedUrl.hostname.replace(/^www\./, ""),
          });
        } catch {
          // ignore
        }
      }
    }
  }

  // Ensure official PreStocks page is included as primary verified reference
  if (product.external_url) {
    try {
      const pUrl = new URL(product.external_url);
      mergedSourcesMap.set(product.external_url, {
        title: `${companyName} on PreStocks`,
        url: product.external_url,
        domain: pUrl.hostname.replace(/^www\./, ""),
      });
    } catch {
      // ignore
    }
  }

  const safeEvents: ResearchEvent[] = Array.isArray(parsed.recentDevelopments)
    ? parsed.recentDevelopments.slice(0, 5).map((e) => ({
        title: String(e.title || "Recent Announcement"),
        summary: String(e.summary || ""),
        date: e.date ? String(e.date) : null,
        category: (e.category || "company") as ResearchEvent["category"],
        sourceTitle: String(e.sourceTitle || companyName),
        sourceUrl: String(e.sourceUrl || product.external_url || "#"),
      }))
    : [];

  const finalReport: ScoutReport = {
    symbol: norm,
    companyName,
    overview: parsed.overview || product.description,
    sector: parsed.sector || undefined,
    foundedYear: typeof parsed.foundedYear === "number" ? parsed.foundedYear : undefined,
    headquarters: parsed.headquarters || undefined,
    businessModel: parsed.businessModel || undefined,
    notableFacts: Array.isArray(parsed.notableFacts)
      ? parsed.notableFacts.map(String)
      : [],
    recentDevelopments: safeEvents,
    sources: Array.from(mergedSourcesMap.values()),
    generatedAt: Date.now(),
  };

  setCachedScoutReport(norm, finalReport);
  return finalReport;
}
