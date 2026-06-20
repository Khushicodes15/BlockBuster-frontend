'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, Search, Eye, CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useDashboard } from '@/components/DashboardContext';
import { useIncidents, useResolveIncident, useDeleteIncident } from '@/lib/queries';
import { NewIncidentDialog } from '@/components/NewIncidentDialog';
import {
  PageHeader,
  Input,
  Badge,
  StatusPill,
  Button,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  EmptyState,
  ErrorState,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import type { Incident, IncidentStatus } from '@/lib/types';

const STATUS_TONE: Record<IncidentStatus, 'danger' | 'success'> = {
  ACTIVE: 'danger',
  RESOLVED: 'success',
};

export default function IncidentsPage() {
  const { incidents: activeIncidents, isLoading: activeLoading } = useDashboard();
  const resolvedQ = useIncidents('RESOLVED');
  const resolve = useResolveIncident();
  const del = useDeleteIncident();
  const [status, setStatus] = useState<IncidentStatus>('ACTIVE');
  const [q, setQ] = useState('');
  const [pendingId, setPendingId] = useState<string | number | null>(null);

  const loading = status === 'ACTIVE' ? activeLoading : resolvedQ.isLoading;
  const isError = status === 'RESOLVED' && resolvedQ.isError;
  const resolvedIncidents = resolvedQ.data?.incidents;

  const rows = useMemo(() => {
    const src: Incident[] = status === 'ACTIVE' ? activeIncidents : resolvedIncidents ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return src;
    return src.filter(
      (i) =>
        (i.label ?? '').toLowerCase().includes(term) ||
        (i.blocked_corridors ?? []).some((c) => c.toLowerCase().includes(term)),
    );
  }, [status, activeIncidents, resolvedIncidents, q]);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <PageHeader
        title="Incidents"
        description="Active and resolved traffic incidents across the city network."
        icon={<AlertTriangle className="w-5 h-5" />}
        className="mb-5"
        actions={<NewIncidentDialog />}
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Tabs value={status} onValueChange={(v) => setStatus(v as IncidentStatus)}>
          <TabsList>
            <TabsTrigger value="ACTIVE">Active</TabsTrigger>
            <TabsTrigger value="RESOLVED">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search incidents or corridors…"
            className="pl-9"
            aria-label="Search incidents"
          />
        </div>
      </div>

      <div className="bg-card-bg border border-border-light rounded-xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => resolvedQ.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle className="w-7 h-7" />}
            title={`No ${status.toLowerCase()} incidents`}
            description="Nothing to show for this filter right now."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Incident</TH>
                <TH>Status</TH>
                <TH>Blocked Corridors</TH>
                <TH>Playbook</TH>
                <TH>Created</TH>
                <TH className="text-right">Action</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((inc) => (
                <TR key={inc.id}>
                  <TD className="font-semibold">
                    {inc.label ?? inc.blocked_corridors?.[0] ?? `Incident ${inc.id}`}
                  </TD>
                  <TD>
                    <StatusPill tone={STATUS_TONE[inc.status] ?? 'neutral'}>{inc.status}</StatusPill>
                  </TD>
                  <TD className="text-text-muted">{inc.blocked_corridors?.join(', ') || '—'}</TD>
                  <TD>
                    {inc.playbook ? <Badge tone="success">Ready</Badge> : <Badge tone="warning">Pending</Badge>}
                  </TD>
                  <TD className="text-text-subtle whitespace-nowrap">
                    {inc.created_at ? format(new Date(inc.created_at), 'dd MMM, HH:mm') : '—'}
                  </TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/dashboard/incidents/${inc.id}`}>
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </Button>
                      {inc.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="Resolve incident"
                          disabled={resolve.isPending && pendingId === inc.id}
                          onClick={() => {
                            setPendingId(inc.id);
                            resolve.mutate(inc.id);
                          }}
                        >
                          {resolve.isPending && pendingId === inc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-status-green" />
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Delete incident"
                        disabled={del.isPending && pendingId === inc.id}
                        onClick={() => {
                          setPendingId(inc.id);
                          del.mutate(inc.id);
                        }}
                      >
                        {del.isPending && pendingId === inc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-status-red" />
                        )}
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
