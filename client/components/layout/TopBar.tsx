"use client";

import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";

export function TopBar({ facilityId = "facility_001" }: { facilityId?: string }) {
  const lastSync = useMemo(() => formatDistanceToNow(new Date(), { addSuffix: true }), []);
  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-[#1a2d4a] bg-[#0a1628] px-4 py-3">
      <div className="text-sm text-slate-300">Facility: {facilityId}</div>
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <span>Last sync: {lastSync}</span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          Connected
        </span>
      </div>
    </div>
  );
}
