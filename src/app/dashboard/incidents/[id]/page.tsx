'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useDashboard } from '@/components/DashboardContext';
import Map from '@/components/Map';
import PlaybookPanel from '@/components/PlaybookPanel';
import { PageHeader, Button, EmptyState, StatusPill } from '@/components/ui';

export default function IncidentDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { incidents, selectedIncident, setSelectedIncident } = useDashboard();

  const incident = useMemo(
    () => incidents.find((i) => String(i.id) === String(id)) ?? null,
    [incidents, id],
  );

  // Drive the shared PlaybookPanel/Map by syncing the selection to this incident.
  useEffect(() => {
    if (incident && selectedIncident?.id !== incident.id) setSelectedIncident(incident);
  }, [incident, selectedIncident, setSelectedIncident]);

  if (!incident) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <EmptyState
          icon={<AlertTriangle className="w-7 h-7" />}
          title="Incident not found"
          description="It may have been resolved, or it isn't in the active set."
          action={
            <Button asChild variant="secondary">
              <Link href="/dashboard/incidents">
                <ArrowLeft className="w-4 h-4" />
                Back to Incidents
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">
      <div className="shrink-0">
        <PageHeader
          title={incident.label ?? `Incident ${incident.id}`}
          description={
            incident.blocked_corridors?.length
              ? `Blocked: ${incident.blocked_corridors.join(', ')}`
              : undefined
          }
          icon={<AlertTriangle className="w-5 h-5" />}
          actions={
            <>
              <StatusPill tone={incident.status === 'ACTIVE' ? 'danger' : 'success'}>
                {incident.status}
              </StatusPill>
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard/incidents">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
              </Button>
            </>
          }
        />
      </div>
      <div className="flex flex-col md:flex-row flex-1 gap-2 md:gap-4 min-h-0">
        <div className="flex-1 relative rounded-xl overflow-hidden shadow-card border border-border-light min-h-[250px] md:min-h-0">
          <Map />
        </div>
        <div className="h-[500px] md:h-full md:w-[400px] shrink-0 rounded-xl overflow-hidden shadow-card border border-border-light bg-card-bg">
          <PlaybookPanel />
        </div>
      </div>
    </div>
  );
}
