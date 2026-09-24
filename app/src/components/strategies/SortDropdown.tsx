"use client";

import Dropdown from "@/components/ui/Dropdown";

export default function SortDropdown() {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-label uppercase text-on-surface-variant tracking-wider">
        Sort by:
      </span>
      <Dropdown
        options={["TVL", "Highest APY", "Risk: Low to High"]}
        className="w-44"
      />
    </div>
  );
}
