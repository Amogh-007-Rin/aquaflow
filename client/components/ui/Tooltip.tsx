import { ReactNode } from "react";

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex items-center">
      {children}
      <span className="pointer-events-none absolute -top-9 left-1/2 z-20 hidden -translate-x-1/2 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 group-hover:block">
        {label}
      </span>
    </span>
  );
}
