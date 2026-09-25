"use client";

import { useSyncExternalStore, useEffect, useCallback } from "react";
import { PreStockDerived } from "./types";
import { normalizeSymbol } from "./transforms";
import { useMounted } from "./useMounted";

const SNAPSHOTS_STORAGE_KEY = "scouter:snapshots";
const SNAPSHOTS_CHANGE_EVENT = "scouter_snapshots_change";

export interface CompanySnapshot {
  symbol: string;
  timestamp: number;
  tokenPrice: number;
  markPrice: number;
  impliedValuation: number;
  markValuation: number;
  premiumPercent: number;
}

export interface SnapshotChange {
  tokenPriceChange: number;
  markPriceChange: number;
  impliedValuationChange: number;
  premiumPointsChange: number;
  hasChanges: boolean;
  timeDeltaMs: number;
  previous: CompanySnapshot;
}

/**
 * Reads all stored snapshots from localStorage.
 */
export function getAllSnapshots(): Record<string, CompanySnapshot> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading snapshots from localStorage:", err);
    return {};
  }
}

/**
 * Gets a company's stored snapshot.
 */
export function getCompanySnapshot(symbol: string): CompanySnapshot | null {
  const norm = normalizeSymbol(symbol);
  const all = getAllSnapshots();
  return all[norm] || null;
}

/**
 * Saves a company snapshot into localStorage.
 */
export function saveCompanySnapshot(product: PreStockDerived): CompanySnapshot {
  const norm = normalizeSymbol(product.symbol);
  const snapshot: CompanySnapshot = {
    symbol: norm,
    timestamp: Date.now(),
    tokenPrice: product.tokenPrice,
    markPrice: product.markPrice,
    impliedValuation: product.impliedValuation,
    markValuation: product.markValuation,
    premiumPercent: product.premiumPercent,
  };

  if (typeof window !== "undefined") {
    try {
      const all = getAllSnapshots();
      all[norm] = snapshot;
      localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(
        new CustomEvent(SNAPSHOTS_CHANGE_EVENT, { detail: { symbol: norm, snapshot } })
      );
    } catch (err) {
      console.error("Error saving snapshot:", err);
    }
  }

  return snapshot;
}

/**
 * Computes changes between current live data and a previous snapshot.
 */
export function calculateSnapshotChange(
  current: PreStockDerived,
  previous: CompanySnapshot | null
): SnapshotChange | null {
  if (!previous) return null;

  const tokenPriceChange = current.tokenPrice - previous.tokenPrice;
  const markPriceChange = current.markPrice - previous.markPrice;
  const impliedValuationChange = current.impliedValuation - previous.impliedValuation;
  // Expressed in percentage points (e.g. +1.2% -> +2.4% is +1.2 percentage points)
  const premiumPointsChange = current.premiumPercent - previous.premiumPercent;

  const hasChanges =
    Math.abs(tokenPriceChange) > 0.001 ||
    Math.abs(impliedValuationChange) > 1000 ||
    Math.abs(premiumPointsChange) > 0.01;

  const timeDeltaMs = Math.max(0, Date.now() - previous.timestamp);

  return {
    tokenPriceChange,
    markPriceChange,
    impliedValuationChange,
    premiumPointsChange,
    hasChanges,
    timeDeltaMs,
    previous,
  };
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SNAPSHOTS_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SNAPSHOTS_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedRawSnapshots = "";
let cachedSnapshots: Record<string, CompanySnapshot> = {};

function getSnapshotStore(): Record<string, CompanySnapshot> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(SNAPSHOTS_STORAGE_KEY) || "";
  if (raw !== cachedRawSnapshots) {
    cachedRawSnapshots = raw;
    cachedSnapshots = getAllSnapshots();
  }
  return cachedSnapshots;
}

const SERVER_SNAPSHOTS: Record<string, CompanySnapshot> = {};
function getServerSnapshotStore(): Record<string, CompanySnapshot> {
  return SERVER_SNAPSHOTS;
}

// Track symbols whose baseline was established in the current session
const sessionBaselines = new Set<string>();

/**
 * React hook to observe and update snapshots for a company using useSyncExternalStore.
 */
export function useCompanySnapshot(product: PreStockDerived) {
  const allSnapshots = useSyncExternalStore(subscribe, getSnapshotStore, getServerSnapshotStore);
  const norm = normalizeSymbol(product.symbol);
  const snapshot = allSnapshots[norm] || null;
  const isLoaded = useMounted();

  // If first visit, record initial baseline snapshot
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentAll = getAllSnapshots();
    if (!currentAll[norm]) {
      sessionBaselines.add(norm);
      saveCompanySnapshot(product);
    }
  }, [norm, product]);

  const updateSnapshot = useCallback(() => {
    sessionBaselines.delete(norm);
    return saveCompanySnapshot(product);
  }, [norm, product]);

  const isInitialVisit = sessionBaselines.has(norm);
  const change = calculateSnapshotChange(product, snapshot);

  return {
    snapshot,
    change,
    isLoaded,
    isInitialVisit,
    updateSnapshot,
  };
}
