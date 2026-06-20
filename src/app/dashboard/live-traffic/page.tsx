'use client';

import { useState } from 'react';
import { Map as MapIcon, Zap, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import Map from '@/components/Map';
import { useNetworkStatus, useCorridors } from '@/lib/queries';
import * as api from '@/lib/api';
import type { SimulateResponse } from '@/lib/types';
import { vcTone, vcLabel, vcSeverity } from '@/lib/traffic';
import {
  PageHeader,
  Panel,
  StatusPill,
  Badge,
  Button,
  Skeleton,
  ErrorState,
  EmptyState,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';

export default function LiveTrafficPage() {
  const [hour, setHour] = useState(() => new Date().getHours());
  const net = useNetworkStatus(hour);
  const corridorsQ = useCorridors();
  const corridors = corridorsQ.data?.corridors ?? [];

  // Disaster lab state
  const [targets, setTargets] = useState<string[]>([]);
  const [capacityPct, setCapacityPct] = useState(20);
  const [simRunning, setSimRunning] = useState(false);
  const [sim, setSim] = useState<SimulateResponse | null>(null);

  const entries = [...(net.data?.network_state ?? [])].sort(
    (a, b) => vcSeverity(b.vc_ratio) - vcSeverity(a.vc_ratio),
  );

  const simEntries = sim
    ? [...sim.network_state].sort((a, b) => vcSeverity(b.vc_ratio) - vcSeverity(a.vc_ratio))
    : [];

  const toggleTarget = (c: string) =>
    setTargets((t) => (t.includes(c) ? t.filter((x) => x !== c) : [...t, c]));

  const runSimulation = async () => {
    if (targets.length === 0) {
      toast.error('Select at least one corridor to disrupt');
      return;
    }
    setSimRunning(true);
    try {
      const res = await api.simulate({
        target_corridors: targets,
        hour,
        capacity_remaining_pct: capacityPct / 100,
      });
      setSim(res);
      toast.success('Simulation complete', {
        description:
          res.unresolved_excess > 0
            ? `Unresolved excess demand: ${Math.round(res.unresolved_excess)}`
            : 'Network absorbs the disruption',
      });
    } catch (e) {
      toast.error('Simulation failed', { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSimRunning(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">
      <div className="shrink-0">
        <PageHeader
          title="Live Traffic & Disaster Lab"
          description="Corridor load across the network. Scrub the hour, or inject a disruption to stress-test the city."
          icon={<MapIcon className="w-5 h-5" />}
        />
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-2 md:gap-4 min-h-0">
        <div className="flex-1 relative rounded-xl overflow-hidden shadow-card border border-border-light min-h-[300px] md:min-h-0">
          <Map />
        </div>

        <Panel className="md:w-[380px] shrink-0 h-[460px] md:h-full flex flex-col">
          {/* Shared hour scrubber */}
          <div className="px-4 py-3 border-b border-border-light shrink-0">
            <div className="flex items-center justify-between">
              <label htmlFor="hour-scrubber" className="text-[10px] font-bold tracking-wider text-text-subtle uppercase">
                Hour of day
              </label>
              <span className="text-[11px] font-bold text-foreground tabular-nums">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
            <input
              id="hour-scrubber"
              type="range"
              min={0}
              max={23}
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="w-full accent-accent-olive mt-1.5"
            />
          </div>

          <Tabs defaultValue="load" className="flex-1 flex flex-col min-h-0">
            <div className="px-4 pt-3 shrink-0">
              <TabsList className="w-full">
                <TabsTrigger value="load" className="flex-1">Corridor Load</TabsTrigger>
                <TabsTrigger value="lab" className="flex-1">Disaster Lab</TabsTrigger>
              </TabsList>
            </div>

            {/* Corridor load */}
            <TabsContent value="load" className="flex-1 overflow-y-auto mt-2">
              {net.isLoading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : net.isError ? (
                <ErrorState onRetry={() => net.refetch()} />
              ) : entries.length === 0 ? (
                <EmptyState icon={<MapIcon className="w-7 h-7" />} title="No corridor data" description="Network status is unavailable for this hour." />
              ) : (
                <ul className="divide-y divide-border-light">
                  {entries.map((e) => (
                    <li key={e.corridor} className="flex items-center justify-between gap-2 px-4 py-2.5">
                      <span className="text-sm text-foreground truncate">{e.corridor}</span>
                      <StatusPill tone={vcTone(e.vc_ratio)}>{vcLabel(e.vc_ratio)}</StatusPill>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            {/* Disaster lab */}
            <TabsContent value="lab" className="flex-1 overflow-y-auto mt-2 px-4 pb-4">
              <div className="text-[11px] text-text-muted mb-2">
                Pick corridors to disrupt, set remaining capacity, and run the city demand model.
              </div>

              <div className="max-h-40 overflow-y-auto rounded-lg border border-border-light divide-y divide-border-light mb-3">
                {corridors.map((c) => (
                  <label key={c} className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-surface-muted">
                    <input type="checkbox" checked={targets.includes(c)} onChange={() => toggleTarget(c)} className="accent-accent-olive" />
                    <span className="truncate">{c}</span>
                  </label>
                ))}
              </div>

              <label className="text-[10px] font-bold tracking-wider text-text-subtle uppercase">
                Capacity remaining: {capacityPct}%
              </label>
              <input type="range" min={0} max={100} value={capacityPct} onChange={(e) => setCapacityPct(Number(e.target.value))} className="w-full accent-status-red mt-1 mb-3" />

              <Button variant="danger" className="w-full" onClick={runSimulation} disabled={simRunning}>
                {simRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Inject disruption
              </Button>

              {sim && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold tracking-wider text-text-muted">RESULT</span>
                    <Badge tone={sim.unresolved_excess > 0 ? 'danger' : 'success'} size="sm">
                      {sim.unresolved_excess > 0 ? (
                        <><AlertTriangle className="w-3 h-3" /> excess {Math.round(sim.unresolved_excess)}</>
                      ) : 'absorbed'}
                    </Badge>
                  </div>
                  <ul className="divide-y divide-border-light rounded-lg border border-border-light">
                    {simEntries.slice(0, 8).map((e) => (
                      <li key={e.corridor} className="flex items-center justify-between gap-2 px-3 py-2">
                        <span className={`text-xs truncate ${targets.includes(e.corridor) ? 'font-bold text-status-red' : 'text-foreground'}`}>
                          {e.corridor}
                        </span>
                        <StatusPill tone={vcTone(e.vc_ratio)} size="sm">{vcLabel(e.vc_ratio)}</StatusPill>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Panel>
      </div>
    </div>
  );
}
