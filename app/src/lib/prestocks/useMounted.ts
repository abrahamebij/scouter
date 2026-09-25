"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns true only after the component has mounted on the client.
 * Uses useSyncExternalStore to guarantee the server and initial client hydration
 * render identical output, preventing Next.js hydration mismatch errors.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
