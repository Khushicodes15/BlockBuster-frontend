'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useDashboard } from './DashboardContext';
import { usePlaybookStream } from '@/lib/usePlaybookStream';
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  Clock,
  Volume2,
  ShieldAlert,
  TrafficCone,
  Users,
  ShieldCheck,
  AlertTriangle,
  Send,
  Loader2,
  GitBranch,
  Scale,
} from 'lucide-react';
import { toast } from 'sonner';
import * as api from '@/lib/api';
import type { JudgingCheck, NearestOfficer } from '@/lib/types';
import { Badge, StatusPill } from './ui/Badge';
import { Button } from './ui/Button';
import { DemoSeeder } from './DemoSeeder';
import { cn } from '@/lib/cn';

type StepState = 'pending' | 'running' | 'ready' | 'executed';

function StepIcon({ state }: { state: StepState }) {
  if (state === 'executed') return <CheckCircle2 className="w-5 h-5 text-status-green" />;
  if (state === 'ready') return <CheckCircle2 className="w-5 h-5 text-accent-olive" />;
  if (state === 'running') return <Clock className="w-5 h-5 text-status-yellow animate-pulse" />;
  return <Circle className="w-5 h-5 text-border-strong" />;
}

function CheckRow({ check }: { check: JudgingCheck }) {
  return (
    <div className="flex items-start gap-2">
      {check.passed ? (
        <ShieldCheck className="w-4 h-4 text-status-green shrink-0 mt-0.5" aria-hidden />
      ) : (
        <AlertTriangle className="w-4 h-4 text-status-red shrink-0 mt-0.5" aria-hidden />
      )}
      <div className="min-w-0">
        <div className="text-xs font-bold text-foreground">
          {check.check}{' '}
          <span className={check.passed ? 'text-status-green' : 'text-status-red'}>
            {check.passed ? 'PASS' : 'FLAG'}
          </span>
        </div>
        <div className="text-[11px] text-text-muted leading-snug">{check.detail}</div>
      </div>
    </div>
  );
}

export default function PlaybookPanel() {
  const {
    selectedIncident,
    incidents,
    setSelectedIncident,
    updateLocalIncidentPlaybook,
    corridors,
    corridorGraph,
    refreshData,
  } = useDashboard();

  const { logs, isRunning, playbookResult, error, startStream } = usePlaybookStream();
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const [isDispatching, setIsDispatching] = useState(false);
  const [scriptManuallyOpen, setScriptManuallyOpen] = useState(false);
  const [wcApproved, setWcApproved] = useState(false);
  const [dispatchedId, setDispatchedId] = useState<string | number | null>(null);

  const scriptOpen = scriptManuallyOpen || isRunning;
  const playbook = selectedIncident?.playbook;
  const hasPlaybook = !!playbook;
  const isMockIncident = selectedIncident?.id?.toString().startsWith('MOCK-');

  const judging = playbook?.judging_panel;
  const stress = playbook?.stress_test;
  const diversion = playbook?.diversion;
  const officers = playbook?.nearest_officers ?? [];

  const aiApproved =
    judging?.overall_recommendation === 'APPROVE' && judging?.state === 'PENDING_APPROVAL';
  const executed =
    (selectedIncident != null && dispatchedId === selectedIncident.id) ||
    !!selectedIncident?.dispatch_result;
  const canDispatch = hasPlaybook && (aiApproved || wcApproved) && !executed;

  const { origin, destination } = useMemo(() => {
    const blocked = selectedIncident?.blocked_corridors ?? [];

    // Demo override for the exact video scenario
    if (
      blocked.includes('Mysore Road') &&
      blocked.includes('Bellary Road 1') &&
      selectedIncident?.hour === 18
    ) {
      return { origin: 'Tumkur Road', destination: 'Old Madras Road' };
    }

    const primary = blocked[0] ?? corridors[0] ?? '';
    let orig = '';
    let dest = '';
    const neighbors = new Set<string>();

    for (const e of corridorGraph) {
      if (blocked.includes(e.source) && !blocked.includes(e.target)) neighbors.add(e.target);
      if (blocked.includes(e.target) && !blocked.includes(e.source)) neighbors.add(e.source);
    }

    const candidates = Array.from(neighbors);
    if (candidates.length >= 2) {
      orig = candidates[0];
      dest = candidates[1];
    } else if (candidates.length === 1) {
      orig = candidates[0];
      dest = corridors.find((c) => c !== orig && !blocked.includes(c)) ?? '';
    } else {
      const valid = corridors.filter((c) => !blocked.includes(c));
      orig = valid[0] ?? '';
      dest = valid[1] ?? valid[0] ?? '';
    }

    return { origin: orig, destination: dest };
  }, [selectedIncident, corridorGraph, corridors]);

  // Generate the playbook when an incident has none yet.
  useEffect(() => {
    if (selectedIncident && selectedIncident.playbook === null && !isRunning && origin && destination) {
      startStream({
        blocked_corridors: selectedIncident.blocked_corridors,
        hour: selectedIncident.hour ?? new Date().getHours(),
        origin,
        destination,
        capacity_remaining_pct: 0.0,
        red_threshold: 0.85,
        n_officers: 3,
      });
    }
  }, [selectedIncident, isRunning, origin, destination, startStream]);

  // Persist the generated playbook onto the incident.
  useEffect(() => {
    if (playbookResult && selectedIncident && selectedIncident.playbook === null) {
      if (isMockIncident) {
        updateLocalIncidentPlaybook(selectedIncident.id, playbookResult);
      } else {
        api
          .updateIncident(selectedIncident.id, { playbook: playbookResult })
          .then(() => refreshData())
          .catch((e) => toast.error(e instanceof Error ? e.message : 'Failed to save playbook'));
      }
    }
  }, [playbookResult, selectedIncident, isMockIncident, updateLocalIncidentPlaybook, refreshData]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleDispatch = async () => {
    if (!canDispatch || !playbook || !selectedIncident) return;
    setIsDispatching(true);
    try {
      const advisory = await api.generateAdvisory(playbook);
      const advisoryText = advisory.advisory || 'Traffic advisory: avoid the affected corridors.';
      const recipients = ['+910000000000'];
      await api.dispatchSms(playbook, advisoryText, recipients);

      const deployments = officers.map((o: NearestOfficer) => ({
        police_station: o.police_station,
        count: 1,
      }));
      if (!isMockIncident) {
        if (deployments.length) await api.deployOfficers(selectedIncident.id, deployments);
        await api.updateIncident(selectedIncident.id, {
          dispatch_result: {
            dispatched_at: new Date().toISOString(),
            advisory_text: advisoryText,
            recipients_count: recipients.length,
            deployments,
          },
        });
      }
      setDispatchedId(selectedIncident.id);
      toast.success('Dispatched to ground units', {
        description: `${deployments.length} unit(s) deployed · advisory sent`,
      });
      await refreshData();
    } catch (err) {
      toast.error('Dispatch failed', {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsDispatching(false);
    }
  };

  if (!selectedIncident) {
    return (
      <div className="w-full h-full bg-card-bg flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-10 h-10 text-border-strong mb-3" aria-hidden />
        <div className="text-sm font-bold text-foreground">No active incident</div>
        <div className="text-xs text-text-subtle mt-1 mb-4 max-w-[260px]">
          Load the demo scenario to generate a stress-tested response playbook, or create an
          incident from the Incidents page.
        </div>
        <DemoSeeder showReset={false} />
      </div>
    );
  }

  const stepState = (ready: boolean): StepState =>
    executed ? 'executed' : ready ? 'ready' : isRunning ? 'running' : 'pending';

  const steps = [
    {
      icon: <TrafficCone className="w-4 h-4 text-status-blue" />,
      title: 'Signal Override',
      detail: hasPlaybook
        ? `${(playbook?.network_state ?? []).filter((s) => s.vc_ratio === null || (s.vc_ratio ?? 0) >= 0.9).length} corridor(s) flagged for signal priority`
        : 'Re-time signals on affected approaches',
      state: stepState(hasPlaybook),
    },
    {
      icon: <ShieldAlert className="w-4 h-4 text-status-red" />,
      title: 'Set Barricades',
      detail: hasPlaybook
        ? `Blocking inflow: ${selectedIncident.blocked_corridors?.join(', ') || '—'}`
        : 'Deploy barricades to block inflow',
      state: stepState(hasPlaybook),
    },
    {
      icon: <Users className="w-4 h-4 text-status-green" />,
      title: 'Marshal Deployment',
      detail: hasPlaybook
        ? officers.length
          ? `Nearest: ${officers[0].police_station} · ${officers[0].eta_minutes ?? '?'} min`
          : 'No officers within range'
        : 'Deploy marshals to key junctions',
      state: stepState(hasPlaybook && officers.length > 0),
    },
    {
      icon: <Volume2 className="w-4 h-4 text-accent-olive" />,
      title: 'Public Advisory',
      detail: hasPlaybook
        ? diversion?.path?.length
          ? `Diversion: ${diversion.path.join(' → ')}`
          : 'No reroute available — advisory will recommend delaying travel'
        : 'Send traffic advisory to commuters',
      state: stepState(hasPlaybook),
    },
  ];

  return (
    <div className="w-full h-full bg-card-bg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-light">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-accent-olive" aria-hidden />
            <h2 className="font-bold text-xs tracking-wide text-foreground">
              PLAYBOOK GENERATION ENGINE
            </h2>
          </div>
          <Badge tone="olive" size="sm">AI ASSISTED</Badge>
        </div>

        <div className="text-xs text-text-muted">Incident</div>
        {incidents.length > 1 ? (
          <div className="relative mt-1">
            <select
              className="w-full appearance-none bg-card-bg border border-border-strong text-foreground py-1.5 pl-3 pr-8 rounded-lg text-sm font-bold cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={selectedIncident.id}
              onChange={(e) => {
                const inc = incidents.find((i) => i.id.toString() === e.target.value);
                if (inc) setSelectedIncident(inc);
              }}
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.label || inc.blocked_corridors?.[0] || 'Incident'}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-2.5 text-text-subtle pointer-events-none" />
          </div>
        ) : (
          <div className="text-sm font-bold text-status-red mt-0.5 truncate">
            {selectedIncident.label || selectedIncident.blocked_corridors?.[0] || 'Unknown'}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Judging panel — the honesty moment */}
        {hasPlaybook && judging && (
          <div className="p-4 border-b border-border-light">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-text-muted">
                <Scale className="w-3.5 h-3.5" aria-hidden /> AI JUDGING PANEL
              </div>
              <Badge tone={aiApproved ? 'success' : 'warning'} size="sm">
                {judging.overall_recommendation ?? 'PENDING'}
              </Badge>
            </div>
            <div className="space-y-2">
              {(judging.checks ?? []).map((c, i) => (
                <CheckRow key={i} check={c} />
              ))}
            </div>
            {judging.requires_watch_commander_approval && !aiApproved && (
              <div className="mt-3 flex items-start gap-2 bg-warning-bg border border-warning-border rounded-lg px-2.5 py-2">
                <AlertTriangle className="w-3.5 h-3.5 text-warning-fg shrink-0 mt-0.5" aria-hidden />
                <span className="text-[11px] text-warning-fg leading-snug">
                  Watch Commander approval required before dispatch.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Stress test — proof the plan was pressure-tested */}
        {hasPlaybook && stress && (
          <div className="p-4 border-b border-border-light">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-text-muted">
                <GitBranch className="w-3.5 h-3.5" aria-hidden /> STRESS TEST
              </div>
              <Badge tone={stress.resolved_by_reroute || stress.status?.includes('PASS') ? 'success' : 'danger'} size="sm">
                {stress.status}
              </Badge>
            </div>
            <div className="text-[11px] text-text-muted space-y-0.5">
              {stress.violated_initially?.length > 0 && (
                <div>
                  Initially overloaded:{' '}
                  <span className="font-semibold text-foreground">
                    {stress.violated_initially.join(', ')}
                  </span>
                </div>
              )}
              <div>
                Still overloaded after reroute:{' '}
                <span className="font-semibold text-foreground">
                  {stress.still_violated?.length ? stress.still_violated.join(', ') : 'none ✓'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4-step response plan */}
        <div className="p-4 border-b border-border-light">
          <div className="text-[11px] font-bold tracking-wider text-text-muted mb-3">
            RESPONSE PLAN
          </div>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-full bg-surface-muted shrink-0">
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground">{step.title}</div>
                  <div className="text-[11px] text-text-muted mt-0.5 leading-snug">{step.detail}</div>
                </div>
                <div className="shrink-0 mt-1"><StepIcon state={step.state} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Diversion detail (handles NO_PATH honestly) */}
        {hasPlaybook && diversion && (
          <div className="p-4 border-b border-border-light">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[11px] font-bold tracking-wider text-text-muted">DIVERSION ROUTE</div>
              <Badge tone={diversion.path?.length ? 'info' : 'neutral'} size="sm">
                {diversion.status ?? (diversion.path?.length ? 'OK' : 'NO_PATH')}
              </Badge>
            </div>
            {diversion.path?.length ? (
              <div className="text-[11px] text-foreground font-medium">
                {diversion.path.join(' → ')}
                {diversion.eta_minutes != null && (
                  <span className="text-text-subtle"> · ~{Math.round(diversion.eta_minutes)} min</span>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-text-muted">
                No viable reroute found
                {diversion.bottleneck ? ` — bottleneck at ${diversion.bottleneck}` : ''}. Advisory
                will recommend delaying non-essential travel.
              </div>
            )}
          </div>
        )}

        {/* Live script execution (SSE) */}
        <div className={cn('flex flex-col', scriptOpen && 'h-44')}>
          <button
            onClick={() => setScriptManuallyOpen((o) => !o)}
            className="w-full flex justify-between items-center px-4 py-2.5 bg-surface-muted hover:bg-border-light transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ChevronDown className={cn('w-4 h-4 text-text-subtle transition-transform', scriptOpen && 'rotate-180')} />
              <span className="text-[11px] font-bold tracking-wide text-text-muted">
                LIVE SCRIPT EXECUTION
              </span>
            </div>
            <StatusPill tone={isRunning ? 'success' : hasPlaybook || logs.length ? 'success' : 'neutral'} pulse={isRunning} size="sm">
              {isRunning ? 'RUNNING' : hasPlaybook || logs.length ? 'COMPLETE' : 'IDLE'}
            </StatusPill>
          </button>
          {scriptOpen && (
            <div className="flex-1 p-3 bg-[#0d0d0d] overflow-y-auto font-mono text-[11px] leading-relaxed">
              {logs.map((log, i) => (
                <div key={i} className="mb-0.5 flex gap-2">
                  <span className="text-gray-600 shrink-0">{log.timestamp}</span>
                  <span className="text-emerald-400">[{log.stage}]</span>
                  <span className="text-gray-300">{log.message}</span>
                </div>
              ))}
              {error && <div className="text-red-400">Stream error: {error}</div>}
              {!isRunning && logs.length === 0 && !error && (
                <div className="text-gray-600 italic">
                  {hasPlaybook ? 'Execution log archived.' : 'Waiting for execution…'}
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Dispatch */}
      <div className="p-4 border-t border-border-light bg-surface-muted mt-auto space-y-2">
        {hasPlaybook && !aiApproved && !executed && (
          <label className="flex items-center gap-2 text-[11px] text-text-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={wcApproved}
              onChange={(e) => setWcApproved(e.target.checked)}
              className="accent-accent-olive w-3.5 h-3.5"
            />
            Watch Commander override — authorise dispatch despite AI flags
          </label>
        )}
        <Button
          variant={executed ? 'secondary' : 'dark'}
          size="lg"
          className="w-full justify-between"
          disabled={!canDispatch || isDispatching}
          onClick={handleDispatch}
        >
          <span className="flex items-center gap-2">
            {isDispatching ? <Loader2 className="w-4 h-4 animate-spin" /> : executed ? <CheckCircle2 className="w-4 h-4 text-status-green" /> : <Send className="w-4 h-4" />}
            <span className="text-sm tracking-wide">
              {executed ? 'DISPATCHED' : isDispatching ? 'DISPATCHING…' : 'DISPATCH TO GROUND UNITS'}
            </span>
          </span>
        </Button>
        {!hasPlaybook && (
          <p className="text-[10px] text-text-subtle text-center">Generating playbook…</p>
        )}
        {hasPlaybook && !canDispatch && !executed && (
          <p className="text-[10px] text-text-subtle text-center">
            Dispatch locked until approval
          </p>
        )}
      </div>
    </div>
  );
}
