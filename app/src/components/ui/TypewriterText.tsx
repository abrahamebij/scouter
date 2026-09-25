"use client";

import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speedMs?: number;
  onComplete?: () => void;
  showCursor?: boolean;
  className?: string;
  onTick?: () => void;
}

export default function TypewriterText({
  text,
  speedMs = 16,
  onComplete,
  showCursor = true,
  className = "",
  onTick,
}: TypewriterTextProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTickRef.current = onTick;
  });

  useEffect(() => {
    if (!text) {
      queueMicrotask(() => {
        setDisplayedLength(0);
      });
      onCompleteRef.current?.();
      return;
    }

    queueMicrotask(() => {
      setDisplayedLength(0);
    });

    // Dynamic chars per tick based on text length to keep animation engaging and timely
    const charsPerTick =
      text.length > 800 ? 4 : text.length > 400 ? 3 : text.length > 150 ? 2 : 1;

    let currentLength = 0;
    const interval = setInterval(() => {
      currentLength += charsPerTick;
      if (currentLength >= text.length) {
        currentLength = text.length;
        setDisplayedLength(text.length);
        clearInterval(interval);
        onCompleteRef.current?.();
      } else {
        setDisplayedLength(currentLength);
      }
      onTickRef.current?.();
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, speedMs]);

  const isDone = displayedLength >= text.length;
  const visible = text.slice(0, displayedLength);

  return (
    <span className={className}>
      {visible}
      {showCursor && !isDone && (
        <span className="inline-block w-1.5 h-3.5 ml-1 bg-accent align-middle animate-pulse" />
      )}
    </span>
  );
}
