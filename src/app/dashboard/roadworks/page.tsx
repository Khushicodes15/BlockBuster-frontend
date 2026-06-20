'use client';

import { useState } from 'react';
import { HardHat, Info, CalendarClock, Activity, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useScheduledEvents, useEventImpact, useDeleteEvent } from '@/lib/queries';
import { vcTone, vcLabel, vcSeverity } from '@/lib/traffic';
import { NewEventDialog } from '@/components/NewEventDialog';
import {
  PageHeader,
  Card,
  Badge,
  Button,
  StatusPill,
  Skeleton,
  ErrorState,
  EmptyState,
} from '@/components/ui';
import type { ScheduledEvent } from '@/lib/types';

function formatRange(start?: string, end?: string) {
  if (!start) return 'Time TBD';
  try {
    const s = format(new Date(start), 'dd MMM, HH:mm');
    return end ? `${s} → ${format(new Date(end), 'HH:mm')}` : s;
  } catch {
    return start;
  }
}

function EventCard({ event }: { event: ScheduledEvent }) {
  const [open, setOpen] = useState(false);
  const hour = (() => {
    try { return new Date(event.start_time).getHours(); } catch { return new Date().getHours(); }
  })();
  const impactQ = useEventImpact(open ? event.id : null, hour);
  const del = useDeleteEvent();

  const impacted = [...(impactQ.data?.network_state ?? [])]
    .sort((a, b) => vcSeverity(b.vc_ratio) - vcSeverity(a.vc_ratio))
    .slice(0, 5);
  const stress = impactQ.data?.stress_test;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-warning-bg text-warning-fg flex items-center justify-center shrink-0">
          <CalendarClock className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-bold text-foreground truncate">{event.label}</div>
            {event.event_type && <Badge tone="warning" size="sm">{event.event_type}</Badge>}
            {event.status && <Badge tone="neutral" size="sm">{event.status}</Badge>}
          </div>
          {event.affected_corridors?.length ? (
            <div className="text-[11px] text-text-subtle mt-0.5 truncate">{event.affected_corridors.join(', ')}</div>
          ) : null}
          <div className="text-xs text-text-muted mt-1">{formatRange(event.start_time, event.end_time)}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button size="sm" variant="ghost" onClick={() => setOpen((o) => !o)}>
            <Activity className="w-4 h-4" /> Impact
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </Button>
          <Button size="sm" variant="ghost" aria-label="Delete event" disabled={del.isPending} onClick={() => del.mutate(event.id)}>
            {del.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-status-red" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-border-light">
          {impactQ.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : impactQ.isError ? (
            <ErrorState onRetry={() => impactQ.refetch()} />
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold tracking-wider text-text-muted">
                  PREDICTED IMPACT @ {String(hour).padStart(2, '0')}:00
                </span>
                {stress && (
                  <Badge tone={stress.resolved_by_reroute || stress.status?.includes('PASS') ? 'success' : 'danger'} size="sm">
                    {stress.status}
                  </Badge>
                )}
              </div>
              <ul className="divide-y divide-border-light rounded-lg border border-border-light">
                {impacted.map((e) => (
                  <li key={e.corridor} className="flex items-center justify-between gap-2 px-3 py-1.5">
                    <span className="text-xs text-foreground truncate">{e.corridor}</span>
                    <StatusPill tone={vcTone(e.vc_ratio)} size="sm">{vcLabel(e.vc_ratio)}</StatusPill>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

export default function RoadworksPage() {
  const eventsQ = useScheduledEvents(false);
  const events = eventsQ.data?.events ?? [];
  const [roadworkOnly, setRoadworkOnly] = useState(false);

  const list = roadworkOnly
    ? events.filter((e) => /road|work|maint|repair|construction/i.test(`${e.event_type ?? ''} ${e.label}`))
    : events;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <PageHeader
        title="Roadworks & Events"
        description="Planned disruptions with predicted network impact."
        icon={<HardHat className="w-5 h-5" />}
        className="mb-4"
        actions={<NewEventDialog />}
      />

      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-start gap-2 bg-info-bg text-info-fg border border-info-border rounded-lg px-3 py-2 text-xs flex-1">
          <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
          <span>Impact previews run the real simulation engine for each event&apos;s start hour.</span>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-text-muted cursor-pointer shrink-0">
          <input type="checkbox" checked={roadworkOnly} onChange={(e) => setRoadworkOnly(e.target.checked)} className="accent-accent-olive" />
          Roadwork only
        </label>
      </div>

      {eventsQ.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : eventsQ.isError ? (
        <ErrorState onRetry={() => eventsQ.refetch()} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<HardHat className="w-7 h-7" />}
          title="No scheduled events"
          description="Create an event to preview its impact on the network."
        />
      ) : (
        <div className="space-y-2">
          {list.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
