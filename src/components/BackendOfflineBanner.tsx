"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { useDashboard } from "./DashboardContext";

export function BackendOfflineBanner() {
  const { isBackendDown, refreshData } = useDashboard();
  if (!isBackendDown) return null;

  return (
    <div
      role="alert"
      className="flex items-center justify-center gap-3 bg-danger-bg text-danger-fg border-b border-danger-border px-4 py-2 text-xs font-semibold shrink-0"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Traffic backend unreachable — showing last known data.</span>
      <button
        onClick={() => refreshData()}
        className="inline-flex items-center gap-1 underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        <RefreshCw className="w-3 h-3" />
        Retry
      </button>
    </div>
  );
}
