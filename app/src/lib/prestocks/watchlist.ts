"use client";

import { useSyncExternalStore, useCallback } from "react";
import { normalizeSymbol } from "./transforms";
import { useMounted } from "./useMounted";

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

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(WATCHLIST_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(WATCHLIST_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedRaw = "";
let cachedSnapshot: string[] = [];

function getSnapshot(): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY) || "";
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = getSavedWatchlist();
  }
  return cachedSnapshot;
}

const SERVER_SNAPSHOT: string[] = [];
function getServerSnapshot(): string[] {
  return SERVER_SNAPSHOT;
}

/**
 * React hook to access and manage the active watchlist using React external store subscription.
 */
export function useWatchlist() {
  const symbols = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isLoaded = useMounted();

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
