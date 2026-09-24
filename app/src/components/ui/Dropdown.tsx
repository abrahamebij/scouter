"use client";

import { useState, useRef, useEffect } from "react";
import MaterialIcon from "./MaterialIcon";

interface DropdownProps {
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function Dropdown({
  options,
  value,
  onChange,
  className = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value ?? options[0]);
  const ref = useRef<HTMLDivElement>(null);
  const selectedValue = value ?? selected;

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (opt: string) => {
    setSelected(opt);
    setOpen(false);
    onChange?.(opt);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2 w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface font-bold hover:border-primary/40 transition-all duration-150 cursor-pointer"
      >
        <span className="truncate">{selectedValue}</span>
        <MaterialIcon
          icon="expand_more"
          size="sm"
          className={`text-on-surface-variant transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-surface-container-low border border-outline-variant/20 rounded-lg shadow-xl shadow-black/20 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors duration-100 cursor-pointer ${
                opt === selectedValue
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
