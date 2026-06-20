"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-background">
      <div className="w-14 h-14 rounded-2xl bg-danger-bg text-danger-fg flex items-center justify-center">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h1 className="text-lg font-bold text-foreground">Something went wrong</h1>
      <p className="text-sm text-text-muted max-w-md">
        An unexpected error occurred while rendering this view. You can try again, or return to the
        dashboard.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
