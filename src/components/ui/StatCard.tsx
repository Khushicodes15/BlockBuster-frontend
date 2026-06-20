import * as React from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./Skeleton";

export type StatTone = "default" | "danger" | "success" | "warning" | "info";

const TONE_TEXT: Record<StatTone, string> = {
  default: "text-foreground",
  danger: "text-status-red",
  success: "text-status-green",
  warning: "text-warning-fg",
  info: "text-info-fg",
};

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  hint?: React.ReactNode;
  tone?: StatTone;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "default",
  loading = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-card-bg border border-border-light rounded-xl shadow-card p-4 flex items-start gap-3",
        className,
      )}
    >
      {icon && (
        <div className="shrink-0 w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center text-text-muted">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[10px] font-bold tracking-wider text-text-subtle uppercase">
          {label}
        </div>
        {loading ? (
          <Skeleton className="h-6 w-16 mt-1.5" />
        ) : (
          <div className={cn("text-xl font-bold leading-tight mt-0.5", TONE_TEXT[tone])}>{value}</div>
        )}
        {hint && !loading && (
          <div className="text-[11px] text-text-subtle mt-0.5 truncate">{hint}</div>
        )}
      </div>
    </div>
  );
}
