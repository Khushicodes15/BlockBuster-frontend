import * as React from "react";
import { cn } from "@/lib/cn";

export function Panel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-card-bg border border-border-light rounded-xl shadow-card flex flex-col overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

export interface PanelHeaderProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PanelHeader({ title, icon, actions, className }: PanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-4 py-3 border-b border-border-light shrink-0",
        className,
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className="text-text-muted shrink-0">{icon}</span>}
        <span className="text-xs font-bold tracking-wide text-foreground uppercase truncate">
          {title}
        </span>
      </div>
      {actions}
    </div>
  );
}
