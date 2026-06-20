'use client';

import { Play, RotateCcw, Loader2 } from 'lucide-react';
import { useSeedDemo, useResetDemo } from '@/lib/queries';
import { Button } from './ui/Button';

/**
 * One-click demo scenario controls. Seeds a reproducible incident + events
 * (backend state is in-memory and resets on cold start), and clears them.
 */
export function DemoSeeder({ showReset = true }: { showReset?: boolean }) {
  const seed = useSeedDemo();
  const reset = useResetDemo();
  const busy = seed.isPending || reset.isPending;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary" onClick={() => seed.mutate()} disabled={busy}>
        {seed.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        Load demo scenario
      </Button>
      {showReset && (
        <Button variant="secondary" onClick={() => reset.mutate()} disabled={busy}>
          {reset.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          Clear demo data
        </Button>
      )}
    </div>
  );
}
