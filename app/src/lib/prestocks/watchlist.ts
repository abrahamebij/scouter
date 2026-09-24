"use client";

import { useState, useEffect, useCallback } from "react";
import { normalizeSymbol } from "./transforms";

const WATCHLIST_STORAGE_KEY = "scouter_watchlist_symbols";
const WATCHLIST_CHANGE_EVENT = "scouter_watchlist_change";

/**
 * Reads saved symbols from localStorage.
 */
export function getSavedWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((s) => (typeof s === "string" ? normalizeSymbol(s) : "")).filter(Boolean);
    }
    return [];
  } catch (err) {
    console.error("Error reading watchlist from localStorage:", err);
    return [];
  }
}

/**
 * Saves symbols to localStorage and dispatches a window event.
 */
export function saveWatchlist(symbols: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const unique = Array.from(new Set(symbols.map(normalizeSymbol)));
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(unique));
    window.dispatchEvent(new CustomEvent(WATCHLIST_CHANGE_EVENT, { detail: unique }));
  } catch (err) {
    console.error("Error saving watchlist to localStorage:", err);
  }
}

/**
 * Toggles a symbol in the watchlist.
 */
export function toggleWatchlistSymbol(symbol: string): boolean {
  const norm = normalizeSymbol(symbol);
  const current = getSavedWatchlist();
  const exists = current.includes(norm);
  const updated = exists ? current.filter((s) => s !== norm) : [...current, norm];
  saveWatchlist(updated);
  return !exists;
}

/**
 * React hook to access and manage the active watchlist.
 */
export function useWatchlist() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSymbols(getSavedWatchlist());
    setIsLoaded(true);

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent<string[]>).detail;
      if (detail && Array.isArray(detail)) {
        setSymbols(detail);
      } else {
        setSymbols(getSavedWatchlist());
      }
    };

    window.addEventListener(WATCHLIST_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(WATCHLIST_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const toggle = useCallback((symbol: string) => {
    return toggleWatchlistSymbol(symbol);
  }, []);

  const isInWatchlist = useCallback(
    (symbol: string) => {
      return symbols.includes(normalizeSymbol(symbol));
    },
    [symbols]
  );

  return {
    symbols,
    isLoaded,
    toggle,
    isInWatchlist,
  };
}
