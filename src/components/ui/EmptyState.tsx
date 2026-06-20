import * as React from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 gap-2", className)}>
      {icon && <div className="text-text-subtle mb-1">{icon}</div>}
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {description && <div className="text-xs text-text-muted max-w-xs">{description}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
