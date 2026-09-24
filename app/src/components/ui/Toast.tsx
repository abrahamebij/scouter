"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import MaterialIcon from "./MaterialIcon";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

const ICONS: Record<ToastType, string> = {
  success: "check_circle",
  error: "error",
  warning: "warning",
  info: "info",
};

const COLORS: Record<ToastType, string> = {
  success: "border-primary/30 bg-primary/5",
  error: "border-error/30 bg-error/5",
  warning: "border-secondary/30 bg-secondary/5",
  info: "border-outline/30 bg-surface-container-high",
};

const ICON_COLORS: Record<ToastType, string> = {
  success: "text-primary",
  error: "text-error",
  warning: "text-secondary",
  info: "text-on-surface-variant",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg animate-in slide-in-from-right ${COLORS[t.type]}`}
          >
            <MaterialIcon
              icon={ICONS[t.type]}
              size="sm"
              className={`mt-0.5 flex-shrink-0 ${ICON_COLORS[t.type]}`}
            />
            <p className="text-sm font-body text-on-surface leading-snug flex-1">
              {t.message}
            </p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-on-surface-variant hover:text-on-surface flex-shrink-0"
            >
              <MaterialIcon icon="close" size="sm" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
