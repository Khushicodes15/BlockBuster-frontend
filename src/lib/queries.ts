"use client";

// Per-resource TanStack Query hooks. Pages consume these directly; the
// DashboardContext composes them for the shared shell. One QueryClient cache
// means identical queries (e.g. officers) dedupe across the app.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";
import { resetDemoScenario, seedDemoScenario } from "./demo";
import type {
  IncidentCreateRequest,
  IncidentStatus,
  ScheduledEventRequest,
} from "./types";

const STATIC = 5 * 60_000; // topology (corridors/stations/junctions) rarely changes
const LIVE = 60_000; // live traffic / incident polling cadence

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: api.fetchHealth,
    refetchInterval: 30_000,
    retry: 1,
  });
}

export function useCorridors() {
  return useQuery({ queryKey: ["corridors"], queryFn: api.fetchCorridors, staleTime: STATIC });
}

export function useCorridorCentroids() {
  return useQuery({ queryKey: ["centroids"], queryFn: api.fetchCorridorCentroids, staleTime: STATIC });
}

export function useCorridorGraph() {
  return useQuery({ queryKey: ["graph"], queryFn: api.fetchCorridorGraph, staleTime: STATIC });
}

export function useStations() {
  return useQuery({ queryKey: ["stations"], queryFn: api.fetchStations, staleTime: STATIC });
}

export function useJunctions() {
  return useQuery({ queryKey: ["junctions"], queryFn: api.fetchJunctions, staleTime: STATIC });
}

export function useOfficersSummary() {
  return useQuery({ queryKey: ["officers"], queryFn: api.fetchOfficersSummary, refetchInterval: LIVE });
}

export function useNetworkStatus(hour: number) {
  return useQuery({
    queryKey: ["network-status", hour],
    queryFn: () => api.fetchNetworkStatus(hour),
    refetchInterval: LIVE,
  });
}

export function useIncidents(status: IncidentStatus | "ALL" = "ACTIVE") {
  return useQuery({
    queryKey: ["incidents", status],
    queryFn: () => api.fetchIncidents(status),
    refetchInterval: LIVE,
  });
}

export function useUpcomingEvents() {
  return useQuery({ queryKey: ["events"], queryFn: api.fetchUpcomingEvents, refetchInterval: LIVE });
}

export function useScheduledEvents(upcomingOnly = false) {
  return useQuery({
    queryKey: ["scheduled-events", upcomingOnly],
    queryFn: () => api.fetchScheduledEvents(upcomingOnly),
    refetchInterval: LIVE,
  });
}

export function useEventImpact(id: string | number | null, hour: number) {
  return useQuery({
    queryKey: ["event-impact", id, hour],
    queryFn: () => api.fetchEventImpact(id!, hour),
    enabled: id != null,
    staleTime: LIVE,
  });
}

export function useSignalsOverview(hour: number) {
  return useQuery({
    queryKey: ["signals-overview", hour],
    queryFn: () => api.fetchSignalsOverview(hour),
    refetchInterval: LIVE,
  });
}

export function useAnalyticsSummary() {
  // Cold call is slow (model load ~30–60s); cache hard and don't auto-refetch.
  return useQuery({
    queryKey: ["analytics-summary"],
    queryFn: api.fetchAnalyticsSummary,
    staleTime: STATIC,
    gcTime: STATIC,
    retry: 1,
  });
}

export function useCorridorHistory(corridor: string | null) {
  return useQuery({
    queryKey: ["corridor-history", corridor],
    queryFn: () => api.fetchCorridorHistory(corridor!),
    enabled: !!corridor,
    staleTime: STATIC,
  });
}

// --- Mutations ---------------------------------------------------------------

/** Invalidate the live operational queries after a write. */
function useRefreshLive() {
  const qc = useQueryClient();
  return () =>
    qc.invalidateQueries({
      predicate: (q) =>
        ["incidents", "officers", "scheduled-events", "events", "network-status"].includes(
          q.queryKey[0] as string,
        ),
    });
}

export function useCreateIncident() {
  const refresh = useRefreshLive();
  return useMutation({
    mutationFn: (req: IncidentCreateRequest) => api.createIncident(req),
    onSuccess: () => {
      toast.success("Incident created");
      refresh();
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Failed to create incident"),
  });
}

export function useResolveIncident() {
  const refresh = useRefreshLive();
  return useMutation({
    mutationFn: (id: string | number) => api.resolveIncident(id),
    onSuccess: () => {
      toast.success("Incident resolved — officers released");
      refresh();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to resolve"),
  });
}

export function useDeleteIncident() {
  const refresh = useRefreshLive();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteIncident(id),
    onSuccess: () => {
      toast.success("Incident deleted");
      refresh();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to delete"),
  });
}

export function useCreateEvent() {
  const refresh = useRefreshLive();
  return useMutation({
    mutationFn: (req: ScheduledEventRequest) => api.createScheduledEvent(req),
    onSuccess: () => {
      toast.success("Scheduled event created");
      refresh();
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Failed to create event"),
  });
}

export function useDeleteEvent() {
  const refresh = useRefreshLive();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteScheduledEvent(id),
    onSuccess: () => {
      toast.success("Event removed");
      refresh();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to remove event"),
  });
}

export function useSeedDemo() {
  const refresh = useRefreshLive();
  return useMutation({
    mutationFn: seedDemoScenario,
    onSuccess: () => {
      toast.success("Demo scenario loaded");
      refresh();
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Failed to load demo scenario"),
  });
}

export function useResetDemo() {
  const refresh = useRefreshLive();
  return useMutation({
    mutationFn: resetDemoScenario,
    onSuccess: () => {
      toast.success("Demo data cleared");
      refresh();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to clear demo"),
  });
}
