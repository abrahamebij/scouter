"use client";

import { useState, useEffect, useRef } from "react";
import MarkdownContent from "@/components/intelligence/MarkdownContent";

interface TypewriterMarkdownProps {
  content: string;
  isStreaming?: boolean;
  speedMs?: number;
  onComplete?: () => void;
  onTick?: () => void;
}

export default function TypewriterMarkdown({
  content,
  isStreaming = false,
  speedMs = 15,
  onComplete,
  onTick,
}: TypewriterMarkdownProps) {
  const [displayedLength, setDisplayedLength] = useState(isStreaming ? 0 : content.length);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedLength(content.length);
      return;
    }

    if (!content) {
      setDisplayedLength(0);
      onCompleteRef.current?.();
      return;
    }

    setDisplayedLength(0);

    const charsPerTick =
      content.length > 1000 ? 5 : content.length > 500 ? 3 : content.length > 200 ? 2 : 1;

    let current = 0;
    const interval = setInterval(() => {
      current += charsPerTick;
      if (current >= content.length) {
        current = content.length;
        setDisplayedLength(content.length);
        clearInterval(interval);
        onCompleteRef.current?.();
      } else {
        setDisplayedLength(current);
      }
      onTickRef.current?.();
    }, speedMs);

    return () => clearInterval(interval);
  }, [content, isStreaming, speedMs]);

  if (!isStreaming) {
    return <MarkdownContent content={content} />;
  }

  const isComplete = displayedLength >= content.length;
  const currentSlice = content.slice(0, displayedLength);

  return (
    <div className="relative">
      <MarkdownContent content={currentSlice} />
      {!isComplete && (
        <span className="inline-block w-1.5 h-3.5 ml-1 bg-accent align-middle animate-pulse" />
      )}
    </div>
  );
}
