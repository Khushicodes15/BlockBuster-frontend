import * as React from "react";
import { cn } from "@/lib/cn";

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="shrink-0 w-10 h-10 rounded-xl bg-olive-50 text-accent-olive flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground truncate">
            {title}
          </h1>
          {description && <p className="text-xs md:text-sm text-text-muted mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
