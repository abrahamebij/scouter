"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { PreStockDerived } from "@/lib/prestocks/types";
import { getCompanyName, normalizeSymbol } from "@/lib/prestocks/transforms";
import { formatCompactValuation } from "@/lib/prestocks/format";
import { useWatchlist } from "@/lib/prestocks/watchlist";
import TypewriterMarkdown from "@/components/ui/TypewriterMarkdown";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";
import ContextualCompanyCard from "@/components/intelligence/ContextualCompanyCard";

export interface MarketMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  referencedSymbols?: string[];
  sources?: Array<{ title: string; url: string; domain: string }>;
  followUpQuestions?: string[];
  timestamp: number;
}

interface MarketTerminalIntelligenceProps {
  product: PreStockDerived;
  allProducts: PreStockDerived[];
}

export default function MarketTerminalIntelligence({
  product,
  allProducts,
}: MarketTerminalIntelligenceProps) {
  // Compartmentalized chat storage by symbol
  const [conversationsBySymbol, setConversationsBySymbol] = useState<
    Record<string, MarketMessage[]>
  >({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const { symbols: watchlistSymbols } = useWatchlist();
  const { toast } = useToast();

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUserScrolledUpRef = useRef(false);

  const normSymbol = normalizeSymbol(product.symbol);
  const companyName = getCompanyName(product.name);

  // Active messages for this company
  const messages = useMemo(() => {
    return conversationsBySymbol[normSymbol] || [];
  }, [conversationsBySymbol, normSymbol]);

  // Set messages for current company
  const setMessagesForCurrent = useCallback(
    (updater: (prev: MarketMessage[]) => MarketMessage[]) => {
      setConversationsBySymbol((prev) => {
        const currentList = prev[normSymbol] || [];
        return {
          ...prev,
          [normSymbol]: updater(currentList),
        };
      });
    },
    [normSymbol]
  );

  // Dynamic Contextual Suggested Prompts tailored to active company (Phase 19)
  const contextualPrompts = useMemo(() => {
    const isAboveMark = product.premiumPercent >= 0;
    const otherProduct = allProducts.find(
      (p) => normalizeSymbol(p.symbol) !== normSymbol
    );
    const otherName = otherProduct ? getCompanyName(otherProduct.name) : "Anthropic";

    return [
      {
        title: "Recent Developments",
        prompt: `What changed recently for ${companyName} and what are its latest announcements?`,
        icon: "update",
      },
      {
        title: "Valuation Analysis",
        prompt: `Explain ${companyName}'s current valuation (${formatCompactValuation(
          product.impliedValuation
        )}) and token pricing.`,
        icon: "analytics",
      },
      {
        title: isAboveMark ? "Trading Above Mark" : "Trading Below Mark",
        prompt: `Why is the ${companyName} token trading ${
          isAboveMark ? "above" : "below"
        } its official benchmark mark price?`,
        icon: "trending_up",
      },
      {
        title: "Research Brief",
        prompt: `Give me a comprehensive private-market research brief on ${companyName}.`,
        icon: "radar",
      },
      {
        title: `Compare with ${otherName}`,
        prompt: `Compare ${companyName} with ${otherName} across valuation, revenue model, and market exposure.`,
        icon: "compare_arrows",
      },
    ];
  }, [companyName, product, allProducts, normSymbol]);

  // Monitor internal panel scroll to detect user reading up
  const handlePanelScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - (container.scrollTop + container.clientHeight);
    if (distanceFromBottom > 120) {
      isUserScrolledUpRef.current = true;
    } else {
      isUserScrolledUpRef.current = false;
    }
  };

  // Streaming typewriter tick scroll
  const handleStreamingTick = useCallback(() => {
    if (isUserScrolledUpRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, []);

  // When messages change, scroll to bottom unless user scrolled up
  useEffect(() => {
    if (!isUserScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }
  }, [messages.length, loading]);

  const handleSubmit = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    isUserScrolledUpRef.current = false;
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);

    const userMessage: MarketMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessagesForCurrent((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: historyPayload,
          watchlistSymbols,
          activeSymbol: product.symbol,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Intelligence error ${res.status}`);
      }

      const data = await res.json();
      const result = data.result;

      const assistantMessage: MarketMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: result.answer,
        referencedSymbols: result.referencedSymbols || [],
        sources: result.sources || [],
        followUpQuestions: result.followUpQuestions || [],
        timestamp: Date.now(),
      };

      setStreamingMessageId(assistantMessage.id);
      setMessagesForCurrent((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to run research assistant";
      toast("Intelligence query failed. Please retry.", "error");

      const errorMessage: MarketMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `**Research Service Temporarily Unavailable**\n\n${msg}\n\nPlease verify your connection and try again.`,
        timestamp: Date.now(),
      };
      setMessagesForCurrent((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClearSession = () => {
    setConversationsBySymbol((prev) => ({
      ...prev,
      [normSymbol]: [],
    }));
  };

  const getReferencedProducts = (symbols: string[] = []): PreStockDerived[] => {
    if (!symbols || symbols.length === 0) return [];
    return symbols
      .map((sym) =>
        allProducts.find((p) => normalizeSymbol(p.symbol) === normalizeSymbol(sym))
      )
      .filter((p): p is PreStockDerived => Boolean(p));
  };

  return (
    <div className="flex flex-col h-full bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm">
      {/* Intelligence Panel Header (Phases 13 & 22) */}
      <div className="flex items-center justify-between p-4 border-b border-outline-variant/15 bg-surface-container-high/40 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface flex-shrink-0">
            <MaterialIcon icon="psychology" size="sm" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-sm text-on-surface truncate">
                Intelligence
              </span>
              <span className="font-mono text-[10px] text-accent font-semibold px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/20">
                ${product.symbol}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-light truncate">
              Contextual assistant for {companyName}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearSession}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="Reset conversation for this market"
          >
            <MaterialIcon icon="delete_sweep" size="sm" />
          </button>
        )}
      </div>

      {/* Messages Scroll Container */}
      <div
        ref={messagesContainerRef}
        onScroll={handlePanelScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[320px] max-h-[calc(100vh-16rem)]"
      >
        {/* Empty State: Contextual Suggested Questions (Phase 19) */}
        {messages.length === 0 && (
          <div className="py-6 space-y-5">
            <div className="space-y-1.5 text-center">
              <h3 className="font-headline font-semibold text-sm text-on-surface">
                Ask about {companyName}
              </h3>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto font-light leading-relaxed">
                Grounded in live PreStocks market data, valuation benchmarks, and verified search updates.
              </p>
            </div>

            {/* Suggested Prompts List */}
            <div className="space-y-2">
              <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/70 font-semibold px-1">
                Suggested Prompts
              </div>
              {contextualPrompts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSubmit(item.prompt)}
                  className="w-full text-left p-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 hover:border-outline-variant/40 transition-colors flex items-start gap-2.5 group"
                >
                  <MaterialIcon
                    icon={item.icon}
                    size="sm"
                    className="text-on-surface-variant group-hover:text-accent transition-colors flex-shrink-0 mt-0.5"
                  />
                  <div className="min-w-0">
                    <div className="font-headline font-medium text-xs text-on-surface group-hover:text-on-surface">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-on-surface-variant font-light line-clamp-1 mt-0.5">
                      {item.prompt}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((message) => {
          const isUser = message.role === "user";
          const referencedProducts = getReferencedProducts(message.referencedSymbols);

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
            >
              <div className="text-[10px] font-mono text-on-surface-variant/50 px-1">
                {isUser ? "You" : "Scouter"} &bull;{" "}
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              <div
                className={`rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm max-w-[92%] ${
                  isUser
                    ? "bg-surface-container-high border border-outline-variant/30 text-on-surface"
                    : "bg-surface-container border border-outline-variant/20 text-on-surface shadow-xs"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed font-light">{message.content}</p>
                ) : (
                  <div className="space-y-3">
                    <TypewriterMarkdown
                      content={message.content}
                      isStreaming={message.id === streamingMessageId}
                      speedMs={15}
                      onTick={handleStreamingTick}
                      onComplete={() => setStreamingMessageId(null)}
                    />

                    {/* Referenced Company Cards */}
                    {message.id !== streamingMessageId && referencedProducts.length > 0 && (
                      <div className="pt-2 border-t border-outline-variant/15 space-y-2">
                        <span className="text-[9px] font-label uppercase tracking-wider text-on-surface-variant font-semibold block">
                          Referenced Assets
                        </span>
                        <div className="space-y-2">
                          {referencedProducts.map((p) => (
                            <ContextualCompanyCard key={p.symbol} product={p} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources & Citations */}
                    {message.id !== streamingMessageId && message.sources && message.sources.length > 0 && (
                      <div className="pt-2 border-t border-outline-variant/15 space-y-1.5">
                        <span className="text-[9px] font-label uppercase tracking-wider text-on-surface-variant font-semibold block">
                          Sources
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((src, sIdx) => (
                            <a
                              key={sIdx}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/15 text-[10px] text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                              <span className="font-medium truncate max-w-[140px]">
                                {src.title}
                              </span>
                              <MaterialIcon icon="open_in_new" size="sm" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Prompts */}
                    {message.id !== streamingMessageId &&
                      message.followUpQuestions &&
                      message.followUpQuestions.length > 0 && (
                        <div className="pt-2 border-t border-outline-variant/10 space-y-1">
                          <span className="text-[9px] font-label uppercase tracking-wider text-on-surface-variant/70 block">
                            Explore:
                          </span>
                          <div className="space-y-1">
                            {message.followUpQuestions.map((q, qIdx) => (
                              <button
                                key={qIdx}
                                type="button"
                                onClick={() => handleSubmit(q)}
                                className="w-full text-left px-2 py-1 rounded-md bg-surface-container-high/60 hover:bg-surface-container-high text-[11px] text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1"
                              >
                                <span className="text-accent">&rsaquo;</span>
                                <span className="truncate">{q}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 p-2 text-xs font-mono text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span>Researching {companyName}...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Dock at Bottom of Panel (Phase 21) */}
      <div className="p-3 border-t border-outline-variant/15 bg-surface-container-high/30 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-end gap-2 bg-surface-container rounded-xl border border-outline-variant/30 focus-within:border-outline-variant/60 p-2 transition-colors"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${companyName}, valuation, mark...`}
            disabled={loading}
            className="flex-1 bg-transparent text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none resize-none font-light py-1 max-h-24 overflow-y-auto"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
              input.trim() && !loading
                ? "bg-primary text-on-primary hover:brightness-95 cursor-pointer"
                : "bg-surface-container-high text-on-surface-variant/30 cursor-not-allowed"
            }`}
            title="Send query"
          >
            <MaterialIcon icon="arrow_upward" size="sm" />
          </button>
        </form>
        <div className="text-[10px] font-mono text-on-surface-variant/50 text-right mt-1 px-1">
          Enter to send &bull; Shift+Enter for newline
        </div>
      </div>
    </div>
  );
}
