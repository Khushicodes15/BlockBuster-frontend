'use client';

import { Gauge, TrafficCone, Ban, CalendarClock } from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { StatCard } from './ui/StatCard';

// Traffic-network KPIs. Active incidents, marshals and system status live in
// the persistent TopBar — these are deliberately non-overlapping.
export function OverviewStats() {
  const { networkStatus, upcomingEvents, isLoading } = useDashboard();

  const vcValues = networkStatus
    .map((s) => s.vc_ratio)
    .filter((v): v is number => v != null);
  const avgVc = vcValues.length ? vcValues.reduce((a, b) => a + b, 0) / vcValues.length : null;
  const congested = networkStatus.filter((s) => (s.vc_ratio ?? 0) >= 0.7 && s.vc_ratio !== null).length;
  const blocked = networkStatus.filter((s) => s.vc_ratio === null || (s.vc_ratio ?? 0) >= 0.9).length;

  const vcTone = avgVc == null ? 'default' : avgVc >= 0.9 ? 'danger' : avgVc >= 0.7 ? 'warning' : 'success';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 shrink-0">
      <StatCard
        label="Avg V/C Ratio"
        value={avgVc != null ? avgVc.toFixed(2) : '—'}
        tone={vcTone}
        icon={<Gauge className="w-5 h-5" />}
        loading={isLoading}
        hint="Network-wide demand vs capacity"
      />
      <StatCard
        label="Congested Corridors"
        value={congested}
        tone={congested > 0 ? 'warning' : 'success'}
        icon={<TrafficCone className="w-5 h-5" />}
        loading={isLoading}
        hint="V/C ≥ 0.70"
      />
      <StatCard
        label="Blocked / Critical"
        value={blocked}
        tone={blocked > 0 ? 'danger' : 'success'}
        icon={<Ban className="w-5 h-5" />}
        loading={isLoading}
        hint="V/C ≥ 0.90 or blocked"
      />
      <StatCard
        label="Scheduled Events"
        value={upcomingEvents.length}
        icon={<CalendarClock className="w-5 h-5" />}
        loading={isLoading}
        hint="Upcoming"
      />
    </div>
  );
}
