'use client';

import { useState } from 'react';
import { FileText, Download, Printer, ChevronDown, ShieldCheck, AlertTriangle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useDashboard } from '@/components/DashboardContext';
import { useIncidents } from '@/lib/queries';
import {
  PageHeader,
  Button,
  Card,
  Badge,
  StatusPill,
  Skeleton,
  EmptyState,
} from '@/components/ui';
import type { Incident } from '@/lib/types';

function toCSV(rows: Incident[]) {
  const head = ['id', 'label', 'status', 'blocked_corridors', 'recommendation', 'dispatched', 'created_at'];
  const lines = rows.map((r) =>
    [
      r.id,
      r.label ?? '',
      r.status,
      (r.blocked_corridors ?? []).join('; '),
      r.playbook?.judging_panel?.overall_recommendation ?? '',
      r.dispatch_result ? 'yes' : 'no',
      r.created_at ?? '',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  );
  return [head.join(','), ...lines].join('\n');
}

function ReportCard({ inc }: { inc: Incident }) {
  const [open, setOpen] = useState(false);
  const pb = inc.playbook;
  const judging = pb?.judging_panel;
  const stress = pb?.stress_test;
  const dispatch = inc.dispatch_result;

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-muted transition-colors cursor-pointer"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground truncate">{inc.label ?? `Incident ${inc.id}`}</span>
            <StatusPill tone={inc.status === 'ACTIVE' ? 'danger' : 'success'} size="sm">{inc.status}</StatusPill>
            {judging?.overall_recommendation && (
              <Badge tone={judging.overall_recommendation === 'APPROVE' ? 'success' : 'warning'} size="sm">
                {judging.overall_recommendation}
              </Badge>
            )}
            {dispatch && <Badge tone="info" size="sm"><Send className="w-3 h-3" /> dispatched</Badge>}
          </div>
          <div className="text-[11px] text-text-subtle mt-0.5">
            {inc.blocked_corridors?.join(', ') || '—'} ·{' '}
            {inc.created_at ? format(new Date(inc.created_at), 'dd MMM yyyy, HH:mm') : '—'}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-text-subtle shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-border-light grid md:grid-cols-2 gap-4 text-xs">
          {/* Judging */}
          <div>
            <div className="text-[11px] font-bold tracking-wider text-text-muted mb-1.5">AI JUDGING</div>
            {judging?.checks?.length ? (
              <ul className="space-y-1">
                {judging.checks.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    {c.passed ? <ShieldCheck className="w-3.5 h-3.5 text-status-green shrink-0 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-status-red shrink-0 mt-0.5" />}
                    <span className="text-text-muted"><span className="font-semibold text-foreground">{c.check}:</span> {c.detail}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-text-subtle">No judging record.</span>
            )}
          </div>

          {/* Stress + dispatch */}
          <div className="space-y-3">
            <div>
              <div className="text-[11px] font-bold tracking-wider text-text-muted mb-1.5">STRESS TEST</div>
              {stress ? (
                <div className="text-text-muted">
                  <Badge tone={stress.resolved_by_reroute || stress.status?.includes('PASS') ? 'success' : 'danger'} size="sm">{stress.status}</Badge>
                  {stress.violated_initially?.length ? (
                    <div className="mt-1">Initially overloaded: {stress.violated_initially.join(', ')}</div>
                  ) : null}
                </div>
              ) : <span className="text-text-subtle">No stress-test record.</span>}
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-text-muted mb-1.5">DISPATCH OUTCOME</div>
              {dispatch ? (
                <div className="text-text-muted">
                  Dispatched {dispatch.dispatched_at ? format(new Date(dispatch.dispatched_at), 'dd MMM, HH:mm') : ''} ·{' '}
                  {dispatch.deployments?.length ?? 0} unit(s) · {dispatch.recipients_count ?? 0} advisory recipient(s)
                </div>
              ) : <span className="text-text-subtle">Not dispatched.</span>}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function ReportsPage() {
  const { incidents: active } = useDashboard();
  const resolvedQ = useIncidents('RESOLVED');
  const resolved = resolvedQ.data?.incidents ?? [];
  const all = [...resolved, ...active];

  const download = () => {
    const blob = new Blob([toCSV(all)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `btmc-incident-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <PageHeader
        title="Reports"
        description="After-action records — judging result, stress test and dispatch outcome per incident."
        icon={<FileText className="w-5 h-5" />}
        className="mb-5"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button size="sm" onClick={download} disabled={all.length === 0}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </>
        }
      />

      {resolvedQ.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : all.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-7 h-7" />}
          title="No incidents logged"
          description="Reports appear here as incidents are recorded and resolved."
        />
      ) : (
        <div className="space-y-2">
          {all.map((r, i) => <ReportCard key={`${r.id}-${i}`} inc={r} />)}
        </div>
      )}
    </div>
  );
}
