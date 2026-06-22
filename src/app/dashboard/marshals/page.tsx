'use client';

import { useState } from 'react';
import { Users, Info, MapPin, Search } from 'lucide-react';
import { useOfficersSummary, useStations } from '@/lib/queries';
import { getStationDeployed, getTotalDeployed } from '@/lib/deploymentStore';
import {
  PageHeader,
  StatCard,
  Card,
  Input,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  StatusPill,
  Skeleton,
  ErrorState,
  EmptyState,
} from '@/components/ui';

export default function MarshalsPage() {
  const officersQ = useOfficersSummary();
  const stationsQ = useStations();
  const [q, setQ] = useState('');

  const o = officersQ.data;
  const available = o?.available_officers ?? null;
  const total = o?.total_officers ?? null;
  // Use backend-computed deployed if available, then fall back to our local
  // overlay (populated on dispatch so the count updates before the backend
  // pool refreshes).
  const backendDeployed = available != null && total != null ? total - available : 0;
  const overlayDeployed = getTotalDeployed();
  const deployed = o != null ? Math.max(backendDeployed, overlayDeployed) : null;
  const stations = stationsQ.data?.stations ?? [];

  const byStation = (o?.by_station ?? [])
    .map((s) => ({
      ...s,
      deployed: Math.max(s.total - s.available, getStationDeployed(s.police_station)),
    }))
    .filter((s) => s.police_station.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.deployed - a.deployed || b.total - a.total);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <PageHeader
        title="Marshals"
        description="Traffic marshal availability and per-station coverage."
        icon={<Users className="w-5 h-5" />}
        className="mb-4"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-5">
        <StatCard label="Available" value={available ?? '—'} tone="success" icon={<Users className="w-5 h-5" />} loading={officersQ.isLoading} />
        <StatCard label="Deployed" value={deployed ?? '—'} tone="warning" icon={<Users className="w-5 h-5" />} loading={officersQ.isLoading} />
        <StatCard label="Total Force" value={total ?? '—'} icon={<Users className="w-5 h-5" />} loading={officersQ.isLoading} />
        <StatCard label="Stations" value={stations.length || (o?.by_station?.length ?? '—')} icon={<MapPin className="w-5 h-5" />} loading={stationsQ.isLoading} />
      </div>

      <div className="flex items-start gap-2 bg-info-bg text-info-fg border border-info-border rounded-lg px-3 py-2 text-xs mb-5">
        <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
        <span>
          Aggregate counts per station — individual officer rosters are not exposed by the backend.
          Deployments run through the incident playbook.
        </span>
      </div>

      <div className="relative max-w-sm mb-3">
        <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stations…" className="pl-9" aria-label="Search stations" />
      </div>

      <Card className="overflow-hidden">
        {officersQ.isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : officersQ.isError ? (
          <ErrorState onRetry={() => officersQ.refetch()} />
        ) : byStation.length === 0 ? (
          <EmptyState icon={<Users className="w-7 h-7" />} title="No stations" description="Per-station data is unavailable." />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Police Station</TH>
                <TH>Available</TH>
                <TH>Deployed</TH>
                <TH>Total</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {byStation.map((s, i) => {
                const ratio = s.total > 0 ? s.available / s.total : 1;
                const tone = ratio >= 0.5 ? 'success' : ratio > 0 ? 'warning' : 'danger';
                return (
                  <TR key={`${s.police_station}-${i}`}>
                    <TD className="font-semibold">{s.police_station}</TD>
                    <TD className="text-text-muted tabular-nums">{s.available}</TD>
                    <TD className="text-text-muted tabular-nums">{s.deployed}</TD>
                    <TD className="text-text-muted tabular-nums">{s.total}</TD>
                    <TD>
                      <StatusPill tone={tone} size="sm">
                        {ratio >= 0.5 ? 'Ready' : ratio > 0 ? 'Stretched' : 'Committed'}
                      </StatusPill>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
