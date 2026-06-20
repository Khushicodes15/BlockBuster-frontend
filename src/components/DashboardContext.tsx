'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as api from '@/lib/api';

interface DashboardState {
  systemStatus: string;
  currentTime: Date;
  activeEventsCount: number;
  availableMarshals: { available: number; total: number } | null;
  networkStatus: any[];
  corridors: string[];
  corridorCentroids: any[];
  corridorGraph: any[];
  stations: any[];
  junctions: any[];
  incidents: any[];
  upcomingEvents: any[];
  selectedIncident: any | null;
  setSelectedIncident: (incident: any) => void;
  updateLocalIncidentPlaybook: (incidentId: string, playbook: any) => void;
  refreshData: () => Promise<void>;
  isMounted: boolean;
  weather: { temp: number; condition: string; humidity: number } | null;
}

const DashboardContext = createContext<DashboardState | undefined>(undefined);

// Mock weather for Bengaluru (data scope locked — no external API allowed per project rules)
function getMockWeather(): { temp: number; condition: string; humidity: number } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10) return { temp: 24, condition: "Partly Cloudy", humidity: 72 };
  if (hour >= 10 && hour < 14) return { temp: 31, condition: "Sunny", humidity: 55 };
  if (hour >= 14 && hour < 17) return { temp: 33, condition: "Partly Cloudy", humidity: 48 };
  if (hour >= 17 && hour < 20) return { temp: 28, condition: "Light Rain", humidity: 78 };
  if (hour >= 20 && hour < 23) return { temp: 23, condition: "Clear", humidity: 68 };
  return { temp: 21, condition: "Clear", humidity: 75 };
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [systemStatus, setSystemStatus] = useState<string>('UNKNOWN');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeEventsCount, setActiveEventsCount] = useState(0);
  const [availableMarshals, setAvailableMarshals] = useState<{ available: number; total: number } | null>(null);
  const [networkStatus, setNetworkStatus] = useState<any[]>([]);
  const [corridors, setCorridors] = useState<string[]>([]);
  const [corridorCentroids, setCorridorCentroids] = useState<any[]>([]);
  const [corridorGraph, setCorridorGraph] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [junctions, setJunctions] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [weather, setWeather] = useState<{ temp: number; condition: string; humidity: number } | null>(null);

  const incidentsRef = useRef<any[]>([]);
  useEffect(() => {
    incidentsRef.current = incidents;
  }, [incidents]);

  // Clock and mount
  useEffect(() => {
    setIsMounted(true);
    setWeather(getMockWeather());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Allow PlaybookPanel to attach a playbook to a mock incident directly in state
  // (since mock incidents don't exist on the backend, we can't PATCH them)
  const updateLocalIncidentPlaybook = useCallback((incidentId: string, playbook: any) => {
    setIncidents(prev => prev.map(inc =>
      inc.id === incidentId ? { ...inc, playbook } : inc
    ));
    setSelectedIncident((prev: any) =>
      prev && prev.id === incidentId ? { ...prev, playbook } : prev
    );
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const currentHour = new Date().getHours();
      const [
        health,
        corridorsRes,
        centroidsRes,
        graphRes,
        stationsRes,
        junctionsRes,
        officersRes,
        incidentsRes,
        networkRes,
        eventsRes
      ] = await Promise.all([
        api.fetchHealth().catch(() => ({ status: 'error' })),
        api.fetchCorridors().catch(() => ({ corridors: [] })),
        api.fetchCorridorCentroids().catch(() => ({ centroids: [] })),
        api.fetchCorridorGraph().catch(() => ({ edges: [] })),
        api.fetchStations().catch(() => ({ stations: [] })),
        api.fetchJunctions().catch(() => ({ junctions: [] })),
        api.fetchOfficersSummary().catch(() => null),
        api.fetchActiveIncidents().catch(() => ({ incidents: [] })),
        api.fetchNetworkStatus(currentHour).catch(() => ({ network_state: [] })),
        api.fetchUpcomingEvents().catch(() => ({ events: [] })),
      ]);

      setSystemStatus(health.status === 'ok' ? 'OPERATIONAL' : 'ERROR');
      setCorridors(corridorsRes.corridors || []);
      setCorridorCentroids(centroidsRes.centroids || []);
      setCorridorGraph(graphRes.edges || []);
      setStations(stationsRes.stations || []);
      setJunctions(junctionsRes.junctions || []);
      
      if (officersRes) {
        setAvailableMarshals({
          available: officersRes.available_officers,
          total: officersRes.total_officers,
        });
      }

      const activeList = incidentsRes.incidents || [];
      
      // MOCK INJECTION: Only when there are zero real incidents (for prototype demo).
      if (activeList.length === 0) {
        // Use incidentsRef to avoid stale closures overwriting the playbook
        const existingMock = incidentsRef.current.find(i => i.id === "MOCK-INCIDENT-001");
        if (existingMock) {
          activeList.push(existingMock);
        } else {
          activeList.push({
            id: "MOCK-INCIDENT-001",
            created_at: new Date().toISOString(),
            label: "Road Collapse — Mysore Road",
            hour: currentHour,
            blocked_corridors: ["Mysore Road"],
            playbook: null, // Will be generated live by /playbook-stream
            status: "ACTIVE",
          });
        }
      }

      setIncidents(activeList);
      setActiveEventsCount(activeList.length);

      setNetworkStatus(networkRes.network_state || []);
      setUpcomingEvents(eventsRes.events || []);

      // Update weather
      setWeather(getMockWeather());

      // Auto-select: most recently created
      if (activeList.length > 0) {
        const sorted = [...activeList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setSelectedIncident((prev: any) => {
          if (!prev) return sorted[0];
          const exists = sorted.find(i => i.id === prev.id);
          return exists || sorted[0];
        });
      } else {
        setSelectedIncident(null);
      }
      
    } catch (err) {
      console.error('Failed to refresh dashboard data:', err);
    }
  }, [incidents]);

  // Initial load
  useEffect(() => {
    refreshData();
    const timer = setInterval(refreshData, 60000);
    return () => clearInterval(timer);
  }, [refreshData]);

  return (
    <DashboardContext.Provider value={{
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
    }}>
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
