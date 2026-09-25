"use client";

import { useState, useRef, useEffect } from "react";
import TypewriterMarkdown from "@/components/ui/TypewriterMarkdown";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";

interface DevMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const DEV_PROMPTS = [
  "How do I fetch OpenAI's token price using the SDK?",
  "Give me a TypeScript example for calculating premium vs mark.",
  "Show me how to poll all PreStocks markets in Node.js.",
  "Create a Next.js component displaying live market metrics.",
];

export default function DocsAssistantPage() {
  const [messages, setMessages] = useState<DevMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  const handleSubmit = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMsg: DevMessage = {
      id: `dev-user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const devPrompt = `[DEVELOPER CONTEXT: The user is asking about building applications with Scouter Developer Platform, REST API (/api/markets, /api/markets/:symbol, /api/markets/:symbol/history), or the official TypeScript SDK (scouter-sdk). Ground your code examples specifically in the actual scouter-sdk API: new Scouter(), scouter.markets(), scouter.market(symbol).get(), and scouter.market(symbol).history().] ${text.trim()}`;

      const res = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: devPrompt,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error("Assistant response failed");
      }

      const data = await res.json();
      const aiMsg: DevMessage = {
        id: `dev-ai-${Date.now()}`,
        role: "assistant",
        content: data.result.answer,
        timestamp: Date.now(),
      };

      setStreamingId(aiMsg.id);
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      toast("Unable to complete query", "error");
      const errMessage: DevMessage = {
        id: `dev-err-${Date.now()}`,
        role: "assistant",
        content: "Developer assistant temporarily unavailable. Please verify your connection or review the REST API Reference.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title */}
      <div className="space-y-2 pb-4 border-b border-outline-variant/15">
        <span className="text-[10px] font-label uppercase tracking-widest text-accent font-semibold">
          AI Developer Tools
        </span>
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
          AI Developer Assistant
        </h1>
        <p className="text-sm text-on-surface-variant font-light leading-relaxed">
          Ask technical implementation questions grounded in Scouter&apos;s REST API schemas and TypeScript SDK.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {DEV_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSubmit(p)}
              className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/20 text-left text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-between group"
            >
              <span className="line-clamp-1">{p}</span>
              <MaterialIcon icon="arrow_forward" size="sm" className="text-on-surface-variant group-hover:text-accent flex-shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}

      {/* Messages Thread */}
      <div className="space-y-4 min-h-[300px]">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
            >
              <div className="text-[10px] font-mono text-on-surface-variant/50 px-1">
                {isUser ? "You" : "Developer Assistant"}
              </div>
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm max-w-3xl leading-relaxed ${
                  isUser
                    ? "bg-surface-container-high border border-outline-variant/30 text-on-surface"
                    : "bg-surface-container-low border border-outline-variant/20 text-on-surface shadow-xs"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap font-light">{m.content}</p>
                ) : (
                  <TypewriterMarkdown
                    content={m.content}
                    isStreaming={m.id === streamingId}
                    speedMs={14}
                    onComplete={() => setStreamingId(null)}
                  />
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 p-2 text-xs font-mono text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span>Generating code example...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="pt-4 border-t border-outline-variant/15">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center gap-2 bg-surface-container rounded-xl border border-outline-variant/30 p-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for TypeScript examples, API schemas, or SDK usage..."
            disabled={loading}
            className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none font-light"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
              input.trim() && !loading
                ? "bg-primary text-on-primary hover:brightness-95 cursor-pointer"
                : "bg-surface-container-high text-on-surface-variant/30 cursor-not-allowed"
            }`}
          >
            <MaterialIcon icon="arrow_upward" size="sm" />
          </button>
        </form>
      </div>
    </div>
  );
}
