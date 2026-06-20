import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Couldn't load data",
  description = "The traffic backend is unreachable. Check the connection and try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 gap-2", className)}>
      <div className="w-10 h-10 rounded-full bg-danger-bg text-danger-fg flex items-center justify-center">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {description && <div className="text-xs text-text-muted max-w-xs">{description}</div>}
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry} className="mt-3">
          Retry
        </Button>
      )}
    </div>
  );
}
