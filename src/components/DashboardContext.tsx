'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useHealth,
  useCorridors,
  useCorridorCentroids,
  useCorridorGraph,
  useStations,
  useJunctions,
  useOfficersSummary,
  useNetworkStatus,
  useIncidents,
  useUpcomingEvents,
} from '@/lib/queries';
import type {
  Centroid,
  CorridorEdge,
  Incident,
  Junction,
  MarshalAvailability,
  NetworkStatusEntry,
  Playbook,
  ScheduledEvent,
  Station,
  Weather,
} from '@/lib/types';
import { getTotalDeployed } from '@/lib/deploymentStore';

interface DashboardState {
  systemStatus: string;
  currentTime: Date;
  activeEventsCount: number;
  availableMarshals: MarshalAvailability | null;
  networkStatus: NetworkStatusEntry[];
  corridors: string[];
  corridorCentroids: Centroid[];
  corridorGraph: CorridorEdge[];
  stations: Station[];
  junctions: Junction[];
  incidents: Incident[];
  upcomingEvents: ScheduledEvent[];
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;
  updateLocalIncidentPlaybook: (incidentId: string | number, playbook: Playbook) => void;
  refreshData: () => Promise<void>;
  isMounted: boolean;
  weather: Weather | null;
  /** Initial data load still in flight. */
  isLoading: boolean;
  /** Backend health check is failing — surface an offline banner. */
  isBackendDown: boolean;
}

const DashboardContext = createContext<DashboardState | undefined>(undefined);

// Mock weather for Bengaluru (data scope locked — no external API allowed per project rules)
function getMockWeather(hour: number): Weather {
  if (hour >= 6 && hour < 10) return { temp: 24, condition: 'Partly Cloudy', humidity: 72 };
  if (hour >= 10 && hour < 14) return { temp: 31, condition: 'Sunny', humidity: 55 };
  if (hour >= 14 && hour < 17) return { temp: 33, condition: 'Partly Cloudy', humidity: 48 };
  if (hour >= 17 && hour < 20) return { temp: 28, condition: 'Light Rain', humidity: 78 };
  if (hour >= 20 && hour < 23) return { temp: 23, condition: 'Clear', humidity: 68 };
  return { temp: 21, condition: 'Clear', humidity: 75 };
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours());
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  // --- Server data via shared TanStack Query cache ---
  const health = useHealth();
  const corridorsQ = useCorridors();
  const centroidsQ = useCorridorCentroids();
  const graphQ = useCorridorGraph();
  const stationsQ = useStations();
  const junctionsQ = useJunctions();
  const officersQ = useOfficersSummary();
  const networkQ = useNetworkStatus(currentHour);
  const incidentsQ = useIncidents('ACTIVE');
  const eventsQ = useUpcomingEvents();

  // Clock + mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag for hydration-safe rendering
    setIsMounted(true);
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setCurrentHour(now.getHours());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Weather is derived (no external API). Gated on mount to avoid hydration drift.
  const weather = isMounted ? getMockWeather(currentHour) : null;

  // --- Derived collections ---
  const corridors = corridorsQ.data?.corridors ?? [];
  const corridorCentroids = centroidsQ.data?.centroids ?? [];
  const corridorGraph = graphQ.data?.edges ?? [];
  const stations = stationsQ.data?.stations ?? [];
  const junctions = junctionsQ.data?.junctions ?? [];
  const networkStatus = networkQ.data?.network_state ?? [];
  const upcomingEvents = eventsQ.data?.events ?? [];

  // Apply the local deployment overlay so the top-bar count drops as soon as
  // Dispatch is clicked, even before /officers/summary has been re-fetched.
  const availableMarshals: MarshalAvailability | null = officersQ.data
    ? (() => {
        const total = officersQ.data.total_officers;
        const backendAvailable = officersQ.data.available_officers;
        const backendDeployed = total - backendAvailable;
        const effectiveDeployed = Math.max(backendDeployed, getTotalDeployed());
        return { available: Math.max(0, total - effectiveDeployed), total };
      })()
    : null;

  const systemStatus = health.isLoading
    ? 'UNKNOWN'
    : health.data?.status === 'ok'
      ? 'OPERATIONAL'
      : 'ERROR';

  // Live incidents only — no fabricated fallback. Use the demo seeder to
  // populate a reproducible scenario.
  const incidents: Incident[] = useMemo(
    () => incidentsQ.data?.incidents ?? [],
    [incidentsQ.data],
  );

  const activeEventsCount = incidents.length;

  // Selection: keep a stable id, auto-select the most recent when unset/stale.
  const selectedIncident = useMemo<Incident | null>(() => {
    if (incidents.length === 0) return null;
    if (selectedId != null) {
      const found = incidents.find((i) => i.id === selectedId);
      if (found) return found;
    }
    const sorted = [...incidents].sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
    );
    return sorted[0];
  }, [incidents, selectedId]);

  const setSelectedIncident = useCallback((incident: Incident | null) => {
    setSelectedId(incident?.id ?? null);
  }, []);

  // Kept for API compatibility; real incidents persist playbooks via PATCH.
  const updateLocalIncidentPlaybook = useCallback(
    (_incidentId: string | number, _playbook: Playbook) => {},
    [],
  );

  const refreshData = useCallback(async () => {
    await queryClient.invalidateQueries();
  }, [queryClient]);

  const isLoading =
    incidentsQ.isLoading || centroidsQ.isLoading || networkQ.isLoading;
  const isBackendDown = health.isError;

  return (
    <DashboardContext.Provider
      value={{
        systemStatus,
        currentTime,
        activeEventsCount,
        availableMarshals,
        networkStatus,
        corridors,
        corridorCentroids,
        corridorGraph,
        stations,
        junctions,
        incidents,
        upcomingEvents,
        selectedIncident,
        setSelectedIncident,
        updateLocalIncidentPlaybook,
        refreshData,
        isMounted,
        weather,
        isLoading,
        isBackendDown,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
