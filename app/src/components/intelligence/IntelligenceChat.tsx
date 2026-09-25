"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PreStockDerived } from "@/lib/prestocks/types";
import { normalizeSymbol } from "@/lib/prestocks/transforms";
import { useWatchlist } from "@/lib/prestocks/watchlist";
import MarkdownContent from "./MarkdownContent";
import TypewriterMarkdown from "@/components/ui/TypewriterMarkdown";
import ContextualCompanyCard from "./ContextualCompanyCard";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  referencedSymbols?: string[];
  sources?: Array<{ title: string; url: string; domain: string }>;
  followUpQuestions?: string[];
  timestamp: number;
}

interface IntelligenceChatProps {
  initialProducts: PreStockDerived[];
}

const SUGGESTED_PROMPTS = [
  {
    title: "Research OpenAI",
    prompt: "Give me a research brief on OpenAI and its current PreStocks valuation",
    icon: "radar",
  },
  {
    title: "Compare AI Assets",
    prompt: "Compare OpenAI and Anthropic across token pricing, valuation, and business models",
    icon: "compare_arrows",
  },
  {
    title: "PreStocks Directory",
    prompt: "What companies are currently available on PreStocks and what are their valuations?",
    icon: "grid_view",
  },
  {
    title: "Anduril Valuation",
    prompt: "Explain Anduril's current implied valuation and benchmark mark pricing",
    icon: "analytics",
  },
  {
    title: "Analyse My Watchlist",
    prompt: "Analyse the companies in my watchlist and highlight their key metrics",
    icon: "bookmark",
  },
  {
    title: "Premium vs Mark",
    prompt: "Which PreStocks tokens trade at the highest premium or discount relative to their official mark?",
    icon: "trending_up",
  },
];

export default function IntelligenceChat({ initialProducts }: IntelligenceChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const { symbols: watchlistSymbols } = useWatchlist();
  const { toast } = useToast();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const handleSubmit = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Build conversation history excluding contextual fields
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
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Intelligence API error ${res.status}`);
      }

      const data = await res.json();
      const result = data.result;

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: result.answer,
        referencedSymbols: result.referencedSymbols || [],
        sources: result.sources || [],
        followUpQuestions: result.followUpQuestions || [],
        timestamp: Date.now(),
      };

      setStreamingMessageId(assistantMessage.id);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate research response";
      toast("Intelligence query failed. Please retry.", "error");

      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `**Research Temporarily Unavailable**\n\n${msg}\n\nPlease verify your connection and try again.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClearSession = () => {
    setMessages([]);
    setInput("");
  };

  // Find products matching symbols in an assistant response
  const getReferencedProducts = (symbols: string[] = []): PreStockDerived[] => {
    if (!symbols || symbols.length === 0) return [];
    return symbols
      .map((sym) => initialProducts.find((p) => normalizeSymbol(p.symbol) === normalizeSymbol(sym)))
      .filter((p): p is PreStockDerived => Boolean(p));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4 pb-28">
      {/* Top Workspace Bar */}
      <div className="flex items-center justify-between border-b border-outline-variant/15 shrink-0">
        {/* <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface">
            <MaterialIcon icon="psychology" size="sm" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-base text-on-surface">
              Intelligence Workspace
            </h1>
            <p className="text-[11px] text-on-surface-variant font-light -mt-0.5">
              Personalized private-market research grounded in PreStocks Solana data &amp; Google Search.
            </p>
          </div>
        </div> */}

        {messages.length > 0 && (
          <button
            onClick={handleClearSession}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-headline font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            title="Reset conversation session"
          >
            <MaterialIcon icon="delete_sweep" size="sm" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        )}
      </div>

      {/* Main Conversation Area (Uses page scrollbar) */}
      <div className="space-y-6">
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="py-8 text-center max-w-2xl mx-auto space-y-8 animate-fade-in">

            <div className="space-y-2">
              <h2 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface tracking-tight">
                Ask anything about your private-market research
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto font-light leading-relaxed">
                Scouter Intelligence analyzes tokenised pre-IPO assets, cross-references official benchmark mark prices with live secondary market trading on Solana, and retrieves verified web developments.
              </p>
            </div>

            {/* Suggested Prompts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
              {SUGGESTED_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(item.prompt)}
                  className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high/60 border border-outline-variant/20 hover:border-outline-variant/50 transition-all text-left flex items-start gap-3 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-on-surface flex-shrink-0 mt-0.5 transition-colors">
                    <MaterialIcon icon={item.icon} size="sm" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-headline font-semibold text-xs text-on-surface group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant truncate font-light mt-0.5">
                      {item.prompt}
                    </p>
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
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1.5`}
            >
              {/* Role Timestamp Header */}
              <div className="text-[11px] font-mono text-on-surface-variant/50 px-1 flex items-center gap-2">
                <span>
                  {isUser ? "You" : "Scouter"} &bull;{" "}
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {message.id === streamingMessageId && (
                  <button
                    onClick={() => setStreamingMessageId(null)}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-accent hover:underline transition-colors"
                    title="Skip typing animation"
                  >
                    <MaterialIcon icon="fast_forward" size="sm" />
                    <span>Skip</span>
                  </button>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 sm:p-5 max-w-3xl ${
                  isUser
                    ? "bg-surface-container-high border border-outline-variant/30 text-on-surface"
                    : "bg-surface-container-low border border-outline-variant/20 text-on-surface shadow-sm"
                }`}
              >
                {isUser ? (
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-light">
                    {message.content}
                  </p>
                ) : (
                  <div className="space-y-4">
                    <TypewriterMarkdown
                      content={message.content}
                      isStreaming={message.id === streamingMessageId}
                      speedMs={15}
                      onTick={scrollToBottom}
                      onComplete={() => setStreamingMessageId(null)}
                    />

                    {/* Contextual Company Cards */}
                    {message.id !== streamingMessageId && referencedProducts.length > 0 && (
                      <div className="pt-3 border-t border-outline-variant/15 space-y-2 animate-fade-in">
                        <span className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 font-semibold block">
                          Referenced PreStocks Assets ({referencedProducts.length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {referencedProducts.map((p) => (
                            <ContextualCompanyCard key={p.symbol} product={p} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources & Citations */}
                    {message.id !== streamingMessageId && message.sources && message.sources.length > 0 && (
                      <div className="pt-3 border-t border-outline-variant/15 space-y-1.5 animate-fade-in">
                        <span className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 font-semibold block">
                          Sources &amp; Grounding Citations
                        </span>
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          {message.sources.map((src, sIdx) => (
                            <a
                              key={sIdx}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/15 text-[11px] text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                              <span className="font-medium truncate max-w-[180px]">
                                {src.title}
                              </span>
                              <span className="text-[9px] font-mono text-on-surface-variant/50">
                                ({src.domain})
                              </span>
                              <MaterialIcon icon="open_in_new" size="sm" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Prompts */}
                    {message.id !== streamingMessageId && message.followUpQuestions && message.followUpQuestions.length > 0 && (
                      <div className="pt-3 border-t border-outline-variant/10 space-y-1.5 animate-fade-in">
                        <span className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/70 block">
                          Explore Further:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {message.followUpQuestions.map((q, qIdx) => (
                            <button
                              key={qIdx}
                              onClick={() => handleSubmit(q)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high/80 hover:bg-surface-container-highest border border-outline-variant/20 hover:border-outline-variant/40 text-xs font-headline text-on-surface-variant hover:text-on-surface transition-colors text-left"
                            >
                              <span className="text-accent text-xs">&rsaquo;</span>
                              <span>{q}</span>
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
          <div className="flex flex-col items-start space-y-1.5">
            <div className="text-[11px] font-mono text-on-surface-variant/50 px-1">
              Scouter
            </div>
            <div className="p-2">
              <div className="flex items-center gap-2.5 font-mono text-xs text-on-surface">
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Bottom Compact Input Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-md border-t border-outline-variant/20 py-2.5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-center gap-2 rounded-xl bg-surface-container border border-outline-variant/30 focus-within:border-outline-variant/60 focus-within:ring-1 focus-within:ring-outline-variant/30 px-3.5 py-1.5 transition-all shadow-lg shadow-black/40"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about private companies, valuations, or your watchlist..."
              disabled={loading}
              className="flex-1 bg-transparent text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none font-light py-1"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-headline font-semibold text-xs transition-all flex-shrink-0 ${
                input.trim() && !loading
                  ? "bg-primary text-on-primary hover:brightness-95 shadow-sm cursor-pointer"
                  : "bg-surface-container-high text-on-surface-variant/30 cursor-not-allowed"
              }`}
              title="Send message"
            >
              <MaterialIcon icon="arrow_upward" size="sm" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
