'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { cn } from '@/lib/cn';

type Tone = 'red' | 'yellow' | 'green';
const DOT: Record<Tone, string> = {
  red: 'bg-status-red',
  yellow: 'bg-status-yellow',
  green: 'bg-status-green',
};

export default function AlertTicker() {
  const { networkStatus, upcomingEvents, isMounted } = useDashboard();

  const redCorridors = networkStatus.filter((s) => s.vc_ratio === null || s.vc_ratio >= 0.9);
  const alerts: { text: string; tone: Tone }[] = [
    ...redCorridors.map((c) => ({
      text: c.vc_ratio === null ? `${c.corridor} blocked` : `Heavy congestion on ${c.corridor}`,
      tone: 'red' as Tone,
    })),
    ...upcomingEvents.map((e) => ({
      text: `${e.label}${isMounted && e.start_time ? ` at ${new Date(e.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`,
      tone: 'green' as Tone,
    })),
  ];

  const hasAlerts = alerts.length > 0;
  // Duplicate the set so the marquee can loop seamlessly at -50%.
  const loop = hasAlerts ? [...alerts, ...alerts] : [];

  return (
    <div className="h-10 md:h-12 bg-card-bg border-t border-border-light flex items-center shrink-0 w-full">
      <div className="flex items-center px-3 md:px-6 border-r border-border-light h-full bg-surface-muted min-w-[120px] md:min-w-[180px]">
        <Bell className="w-3.5 h-3.5 md:w-4 md:h-4 text-text-muted mr-1.5 md:mr-2" aria-hidden />
        <span className="text-[9px] md:text-[10px] font-bold tracking-wider text-text-muted">
          SYSTEM ALERTS
        </span>
      </div>

      <div
        className="flex-1 overflow-hidden relative mask-edges"
        aria-live="polite"
        aria-label="System alerts"
      >
        {hasAlerts ? (
          <div className="ticker-track flex items-center gap-8 whitespace-nowrap py-2 w-max px-4">
            {loop.map((a, i) => (
              <div key={i} className="flex items-center text-[11px] md:text-xs text-text-muted font-medium">
                <span className={cn('w-2 h-2 rounded-full mr-2 shrink-0', DOT[a.tone])} aria-hidden />
                {a.text}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center px-4 h-full text-[11px] md:text-xs text-text-subtle font-medium">
            <span className="w-2 h-2 rounded-full mr-2 bg-status-green" aria-hidden />
            Network nominal — no congested corridors or scheduled events.
          </div>
        )}
      </div>

      <div className="hidden lg:flex items-center px-6 border-l border-border-light h-full bg-surface-muted">
        <span className="text-[10px] font-bold tracking-wider text-text-subtle mr-2">SOURCE:</span>
        <span className="text-[10px] text-text-subtle font-medium">ASTraM demand model · Scheduled events</span>
      </div>

      <style>{`
        .mask-edges { mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent); }
        .ticker-track { animation: btmc-ticker 45s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
        @keyframes btmc-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
          .mask-edges { overflow-x: auto; }
        }
      `}</style>
    </div>
  );
}
