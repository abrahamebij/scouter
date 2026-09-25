import { PreStockDerived } from "@/lib/prestocks/types";
import { getCompanyName, normalizeSymbol } from "@/lib/prestocks/transforms";
import { formatCurrency, formatCompactValuation, formatPercentage } from "@/lib/prestocks/format";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  referencedSymbols?: string[];
  sources?: Array<{ title: string; url: string; domain: string }>;
  followUpQuestions?: string[];
}

export interface IntelligenceResponse {
  answer: string;
  referencedSymbols: string[];
  sources: Array<{ title: string; url: string; domain: string }>;
  followUpQuestions: string[];
}

const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function extractJson(text: string): string {
  const cleaned = text.trim();
  const embeddedMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (embeddedMatch) {
    return embeddedMatch[1].trim();
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

/**
 * Intelligently builds target context for the LLM based on user query and conversation history.
 */
function buildScouterContext(
  query: string,
  allProducts: PreStockDerived[],
  watchlistSymbols: string[] = [],
  activeSymbol?: string
): string {
  const lowerQuery = query.toLowerCase();

  // Active terminal company context
  const activeProduct = activeSymbol
    ? allProducts.find((p) => normalizeSymbol(p.symbol) === normalizeSymbol(activeSymbol))
    : undefined;

  // Match companies referenced in query (excluding activeProduct to avoid duplicates)
  const matchedProducts = allProducts.filter((p) => {
    if (activeProduct && normalizeSymbol(p.symbol) === normalizeSymbol(activeProduct.symbol)) {
      return false;
    }
    const sym = p.symbol.toLowerCase();
    const name = getCompanyName(p.name).toLowerCase();
    return lowerQuery.includes(sym) || lowerQuery.includes(name);
  });

  const isWatchlistQuery =
    lowerQuery.includes("watchlist") ||
    lowerQuery.includes("watching") ||
    lowerQuery.includes("portfolio") ||
    lowerQuery.includes("saved");

  const watchlistProducts = allProducts.filter((p) =>
    watchlistSymbols.map(normalizeSymbol).includes(normalizeSymbol(p.symbol))
  );

  let context = `### SCOUTER LIVE PRIVATE-MARKET DATA (SOLANA PRESTOCKS)
Current UTC Timestamp: ${new Date().toISOString()}

All prices and valuations below are LIVE and AUTHENTIC from the PreStocks protocol on Solana.
Use these EXACT numbers. DO NOT invent, fabricate, or recalculate these figures:

`;

  // If inside a dedicated Market Terminal, place active company front and center
  if (activeProduct) {
    context += `#### PRIMARY ACTIVE MARKET TERMINAL COMPANY:
The user is viewing the dedicated Market Terminal for **${getCompanyName(activeProduct.name)}** ($${activeProduct.symbol}).
Unless the user explicitly specifies another company, assume queries like "What changed?", "Why is it trading above/below mark?", "Explain the valuation", "Give me a research brief", or "What are the latest developments?" refer to ${getCompanyName(activeProduct.name)}.
- **${getCompanyName(activeProduct.name)}** ($${activeProduct.symbol}):
  * Token Price: ${formatCurrency(activeProduct.tokenPrice)}
  * Official Benchmark Mark Price: ${formatCurrency(activeProduct.markPrice)}
  * Implied Market Valuation: ${formatCompactValuation(activeProduct.impliedValuation)} (${formatCurrency(activeProduct.impliedValuation)})
  * Benchmark Mark Valuation: ${formatCompactValuation(activeProduct.markValuation)} (${formatCurrency(activeProduct.markValuation)})
  * Premium / Discount vs Mark: ${formatPercentage(activeProduct.premiumPercent)} (${activeProduct.priceDifference >= 0 ? "+" : ""}${formatCurrency(activeProduct.priceDifference)} / token)
  * Token Supply: ${activeProduct.supply.toLocaleString()} SPL tokens
  * Solana Mint Contract: ${activeProduct.contract_address}
  * PreStocks Description: ${activeProduct.description}
  * Official Link: ${activeProduct.external_url || "https://prestocks.com"}

`;
  }

  // Provide high-detail data for specifically requested companies (e.g. cross-company comparison)
  if (matchedProducts.length > 0) {
    context += `#### SPECIFICALLY REFERENCED COMPANIES IN QUERY:\n`;
    for (const p of matchedProducts) {
      context += `- **${getCompanyName(p.name)}** ($${p.symbol}):
  * Token Price: ${formatCurrency(p.tokenPrice)}
  * Official Benchmark Mark Price: ${formatCurrency(p.markPrice)}
  * Implied Market Valuation: ${formatCompactValuation(p.impliedValuation)} (${formatCurrency(p.impliedValuation)})
  * Benchmark Mark Valuation: ${formatCompactValuation(p.markValuation)} (${formatCurrency(p.markValuation)})
  * Premium / Discount vs Mark: ${formatPercentage(p.premiumPercent)} (${p.priceDifference >= 0 ? "+" : ""}${formatCurrency(p.priceDifference)} / token)
  * Token Supply: ${p.supply.toLocaleString()} SPL tokens
  * Solana Mint Contract: ${p.contract_address}
  * PreStocks Description: ${p.description}
  * Official Link: ${p.external_url || "https://prestocks.com"}
`;
    }
  }

  // Provide watchlist data if user asked about their watchlist
  if (isWatchlistQuery) {
    context += `\n#### USER WATCHLIST CONTEXT:\n`;
    if (watchlistProducts.length === 0) {
      context += `The user currently has 0 assets in their local watchlist. If they ask about their watchlist, politely explain that their watchlist is empty and mention they can add companies like OpenAI, Anthropic, or SpaceX using the bookmark button.\n`;
    } else {
      context += `The user is monitoring ${watchlistProducts.length} companies:\n`;
      for (const p of watchlistProducts) {
        context += `- ${getCompanyName(p.name)} ($${p.symbol}): Token ${formatCurrency(p.tokenPrice)}, Implied Val ${formatCompactValuation(p.impliedValuation)}, ${formatPercentage(p.premiumPercent)} vs mark.\n`;
      }
    }
  }

  // Always provide a compact directory of all available PreStocks assets for market-wide awareness
  context += `\n#### ALL CURRENT PRESTOCKS ASSETS ON SCOUTER:\n`;
  for (const p of allProducts) {
    context += `| $${p.symbol} | ${getCompanyName(p.name)} | Token: ${formatCurrency(p.tokenPrice)} | Mark: ${formatCurrency(p.markPrice)} | Implied Val: ${formatCompactValuation(p.impliedValuation)} | Prem/Disc: ${formatPercentage(p.premiumPercent)} |\n`;
  }

  context += `
#### PRESTOCKS ASSET MECHANICS & ARCHITECTURE:
- PreStocks tokens are issued on the Solana blockchain.
- Each PreStocks token represents 1:1 backed economic exposure to private company valuation via Special Purpose Vehicles (SPVs).
- They represent secondary economic exposure, NOT direct registered voting equity.
- Mark prices are benchmark reference valuations established from latest primary private funding rounds or institutional secondary appraisals.
- Token prices reflect continuous 24/7 secondary market pricing on Solana.
`;

  return context;
}

/**
 * Handles a conversation turn with the research service using live Scouter data and Search Grounding.
 */
export async function queryIntelligence(
  userQuery: string,
  history: ChatMessage[],
  allProducts: PreStockDerived[],
  watchlistSymbols: string[] = [],
  activeSymbol?: string
): Promise<IntelligenceResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in the server environment. Please set it in .env.local"
    );
  }

  const scouterContext = buildScouterContext(userQuery, allProducts, watchlistSymbols, activeSymbol);

  const systemInstruction = `You are Scouter Intelligence — an elite private-market research assistant and discovery terminal for PreStocks tokenised pre-IPO assets on Solana.

YOUR MISSION:
Help users discover, analyze, compare, and monitor private companies and their tokenised market data with absolute factual integrity and clarity.

FINANCIAL INTEGRITY & CRITICAL GUARDRAILS:
1. NEVER invent, hallucinate, or alter market metrics. Use ONLY the supplied PreStocks numbers for Token Price, Mark Price, Implied Valuation, Mark Valuation, Supply, and Premium/Discount.
2. DO NOT provide investment advice, financial recommendations, or buy/sell calls.
3. Clearly distinguish verified PreStocks market data from external news, corporate analysis, or general explanations.
4. PreStocks tokens represent 1:1 backed SPV synthetic economic exposure tracking valuation, NOT direct registered equity or shareholder voting rights.
5. If asked about external developments, news, leadership, or recent events, use Google Search Grounding to verify current public information.
6. Provide helpful, conversational, concise, and structured answers. Avoid corporate fluff, repetitive disclaimers, and generic chatbot pleasantries.
7. If mentioning specific companies from Scouter, always use the format [CompanyName](/company/symbol) or mention $SYMBOL so users can navigate to them directly.
8. If relevant charts, diagrams, product snapshots, or company logos exist from verified public web sources or Google Search Grounding, you can embed them directly in-between text using Markdown image syntax: ![Alt description](image_url).

JSON RESPONSE FORMAT REQUIRED:
Return strictly a valid JSON object matching this schema:
{
  "answer": "Your comprehensive, clear response formatted in clean GitHub markdown. Include headings, bullet points, data tables, and embedded images (![Alt](image_url)) where helpful. Link companies like [OpenAI](/company/openai).",
  "referencedSymbols": ["OPENAI", "ANTHROPIC"],
  "sources": [
    {
      "title": "Source name or headline",
      "url": "https://...",
      "domain": "example.com"
    }
  ],
  "followUpQuestions": [
    "Contextual follow-up question 1",
    "Contextual follow-up question 2",
    "Contextual follow-up question 3"
  ]
}

Ensure referencedSymbols contains ONLY valid uppercase symbols from the provided PreStocks assets that were genuinely discussed.`;

  // Format conversation history for context
  let conversationText = "";
  if (history.length > 0) {
    conversationText = "### CONVERSATION HISTORY (Previous turns in this session):\n";
    // Keep last 6 turns to avoid context overflow
    for (const msg of history.slice(-6)) {
      conversationText += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
    }
  }

  const fullPrompt = `${systemInstruction}

${scouterContext}

${conversationText}
USER QUERY:
${userQuery}

Return strictly the valid JSON object. Do not wrap in conversational preamble.`;

  const requestBody = {
    contents: [{ parts: [{ text: fullPrompt }] }],
    tools: [{ googleSearch: {} }],
    generationConfig: {
      temperature: 0.3,
    },
  };

  const response = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Intelligence API Error:", response.status, errorText);
    throw new Error(`Intelligence service returned status ${response.status}`);
  }

  const json = await response.json();
  const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("Empty response returned from research service");
  }

  let parsed: Partial<IntelligenceResponse>;
  try {
    const cleanedJson = extractJson(rawText);
    parsed = JSON.parse(cleanedJson);
  } catch (err) {
    console.error("Failed to parse intelligence JSON output:", rawText, err);
    throw new Error("Unable to parse research intelligence output");
  }

  // Extract grounding search metadata / web sources if returned by Gemini
  const groundingChunks =
    json?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const groundedSources: Array<{ title: string; url: string; domain: string }> = [];

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

  // Merge model sources with Google grounding sources
  const mergedSourcesMap = new Map<string, { title: string; url: string; domain: string }>();
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

  // Validate referenced symbols
  const validSymbols = new Set(allProducts.map((p) => normalizeSymbol(p.symbol)));
  const cleanReferencedSymbols = Array.isArray(parsed.referencedSymbols)
    ? parsed.referencedSymbols
        .map(normalizeSymbol)
        .filter((sym) => validSymbols.has(sym))
    : [];

  return {
    answer: String(parsed.answer || "Unable to formulate a response. Please try rephrasing your question."),
    referencedSymbols: Array.from(new Set(cleanReferencedSymbols)),
    sources: Array.from(mergedSourcesMap.values()).slice(0, 6),
    followUpQuestions: Array.isArray(parsed.followUpQuestions)
      ? parsed.followUpQuestions.slice(0, 3).map(String)
      : [],
  };
}
