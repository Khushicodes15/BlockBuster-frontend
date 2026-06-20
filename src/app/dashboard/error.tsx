"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function DashboardError({
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
    <div className="h-full flex items-center justify-center">
      <ErrorState
        title="This view failed to load"
        description="Something went wrong rendering this section of the console."
        onRetry={reset}
      />
    </div>
  );
}
