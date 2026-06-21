'use client';

import { useState, useRef, useEffect } from 'react';
import { TrafficCone, Info, Timer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSignalsOverview, useIncidents } from '@/lib/queries';
import * as api from '@/lib/api';
import { vcTone, vcLabel } from '@/lib/traffic';
import type { SignalsOverviewResponse } from '@/lib/types';
import {
  PageHeader,
  StatusPill,
  Skeleton,
  ErrorState,
  EmptyState,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from '@/components/ui';

export default function SignalsPage() {
  const [hour, setHour] = useState(() => new Date().getHours());
  const sigQ = useSignalsOverview(hour);

  // Active incidents — used to augment the baseline signal picture
  const incidentsQ = useIncidents('ACTIVE');
  const activeIncidents = incidentsQ.data?.incidents ?? [];

  // Auto-set the slider to the first incident's hour on initial load
  const hourInitialised = useRef(false);
  useEffect(() => {
    if (!hourInitialised.current && activeIncidents.length > 0) {
      const incidentHour = activeIncidents.find((i) => i.hour != null)?.hour;
      if (incidentHour != null) {
        setHour(incidentHour);
        hourInitialised.current = true;
      }
    }
  }, [activeIncidents]);

  // Collect network states from every incident that has a completed playbook
  const incidentNetworkStates = activeIncidents
    .filter((i) => (i.playbook?.network_state?.length ?? 0) > 0)
    .flatMap((i) => i.playbook!.network_state!);

  // Fetch signal overrides that reflect the real disaster state
  const incidentSignalsQ = useQuery<SignalsOverviewResponse>({
    queryKey: ['incident-signals', activeIncidents.map((i) => i.id)],
    queryFn: () => api.signalOverride(incidentNetworkStates),
    enabled: incidentNetworkStates.length > 0,
    refetchInterval: 60_000,
  });

  // Merge: incident-derived overrides reflect what's actually happening right
  // now; baseline fills in corridors not touched by the disaster.
  const incidentOverrides = incidentSignalsQ.data?.signal_overrides ?? [];
  const baselineOverrides = sigQ.data?.signal_overrides ?? [];
  const incidentCorridorSet = new Set(incidentOverrides.map((o) => o.corridor));

  const overrides = [
    ...incidentOverrides,
    ...baselineOverrides.filter((o) => !incidentCorridorSet.has(o.corridor)),
  ].sort((a, b) => b.green_phase_extension_seconds - a.green_phase_extension_seconds);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <PageHeader
        title="Signal Recommendations"
        description="City-wide signal-timing recommendations from the demand model."
        icon={<TrafficCone className="w-5 h-5" />}
        className="mb-4"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-text-subtle tabular-nums">
              {String(hour).padStart(2, '0')}:00
            </span>
            <input
              type="range"
              min={0}
              max={23}
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="w-32 accent-accent-olive"
              aria-label="Hour of day"
            />
          </div>
        }
      />

      <div className="flex items-start gap-2 bg-info-bg text-info-fg border border-info-border rounded-lg px-3 py-2 text-xs my-5">
        <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
        <span>
          This is a <strong>recommendation engine</strong>, not live signal-hardware monitoring.
          Each row is the action the model recommends right now for a congested corridor.
        </span>
      </div>

      <div className="bg-card-bg border border-border-light rounded-xl shadow-card overflow-hidden">
        {sigQ.isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : sigQ.isError ? (
          <ErrorState onRetry={() => sigQ.refetch()} />
        ) : overrides.length === 0 ? (
          <EmptyState
            icon={<TrafficCone className="w-7 h-7" />}
            title="No overrides recommended"
            description={`Network is nominal at ${String(hour).padStart(2, '0')}:00 — no signal changes advised.`}
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Corridor</TH>
                <TH>V/C</TH>
                <TH>Green extension</TH>
                <TH>Recommended action</TH>
              </TR>
            </THead>
            <TBody>
              {overrides.map((o) => (
                <TR key={o.corridor}>
                  <TD className="font-semibold">{o.corridor}</TD>
                  <TD><StatusPill tone={vcTone(o.vc_ratio)}>{vcLabel(o.vc_ratio)}</StatusPill></TD>
                  <TD>
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <Timer className="w-3.5 h-3.5 text-accent-olive" />
                      +{o.green_phase_extension_seconds}s
                    </span>
                  </TD>
                  <TD className="text-text-muted">{o.instruction}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
