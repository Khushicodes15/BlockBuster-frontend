// Same-origin proxy path (see next.config.ts rewrites) avoids browser CORS.
// Override with NEXT_PUBLIC_API_BASE_URL to hit the backend directly.
import type {
  AdvisoryResponse,
  AnalyticsSummary,
  CentroidsResponse,
  CorridorGraphResponse,
  CorridorHistory,
  CorridorsResponse,
  Deployment,
  DisasterRequest,
  EventImpact,
  HealthResponse,
  Incident,
  IncidentCreateRequest,
  IncidentsResponse,
  IncidentStatus,
  JunctionsResponse,
  NetworkStatusResponse,
  OfficersSummaryResponse,
  Playbook,
  RouteRequest,
  ScheduledEvent,
  ScheduledEventRequest,
  ScheduledEventsResponse,
  SignalsOverviewResponse,
  SimulateResponse,
  StationsResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/backend";

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json() as Promise<T>;
}

async function sendJSON<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { reason?: string; detail?: string };
    throw new Error(err.reason || err.detail || `${method} ${path} failed (${res.status})`);
  }
  // Some mutations (e.g. DELETE) may return an empty body.
  return res.json().catch(() => ({})) as Promise<T>;
}

// --- Reference / static data -------------------------------------------------
export const fetchHealth = () => getJSON<HealthResponse>("/health");
export const fetchCorridors = () => getJSON<CorridorsResponse>("/corridors");
export const fetchCorridorCentroids = () => getJSON<CentroidsResponse>("/corridor-centroids");
export const fetchCorridorGraph = () => getJSON<CorridorGraphResponse>("/corridor-graph");
export const fetchStations = () => getJSON<StationsResponse>("/stations");
export const fetchJunctions = () => getJSON<JunctionsResponse>("/junctions");

// --- Live network state ------------------------------------------------------
export const fetchNetworkStatus = (hour: number) =>
  getJSON<NetworkStatusResponse>(`/network-status?hour=${hour}`);
export const fetchOfficersSummary = () => getJSON<OfficersSummaryResponse>("/officers/summary");
export const fetchSignalsOverview = (hour: number) =>
  getJSON<SignalsOverviewResponse>(`/signals/overview?hour=${hour}`);

// --- Analytics ---------------------------------------------------------------
export const fetchAnalyticsSummary = () => getJSON<AnalyticsSummary>("/analytics/summary");
export const fetchCorridorHistory = (corridor: string) =>
  getJSON<CorridorHistory>(`/analytics/corridor/${encodeURIComponent(corridor)}/history`);

// --- Incidents ---------------------------------------------------------------
export const fetchActiveIncidents = () => getJSON<IncidentsResponse>("/incidents?status=ACTIVE");

/** Incidents filtered by status. Pass 'ALL' to omit the status filter. */
export const fetchIncidents = (status: IncidentStatus | "ALL" = "ACTIVE") =>
  getJSON<IncidentsResponse>(status === "ALL" ? "/incidents" : `/incidents?status=${status}`);

export const fetchIncident = (id: string | number) => getJSON<Incident>(`/incidents/${id}`);

export const createIncident = (data: IncidentCreateRequest) =>
  sendJSON<Incident>("/incidents", "POST", data);

export const updateIncident = (id: string | number, data: Partial<Incident>) =>
  sendJSON<Incident>(`/incidents/${id}`, "PATCH", data);

export const deleteIncident = (id: string | number) =>
  sendJSON<Record<string, unknown>>(`/incidents/${id}`, "DELETE");

export const deployOfficers = (id: string | number, deployments: Deployment[]) =>
  sendJSON<Record<string, unknown>>(`/incidents/${id}/deploy`, "POST", { deployments });

export const resolveIncident = (id: string | number) =>
  sendJSON<Record<string, unknown>>(`/incidents/${id}/resolve`, "POST");

// --- Scheduled events --------------------------------------------------------
export const fetchScheduledEvents = (upcomingOnly = false) =>
  getJSON<ScheduledEventsResponse>(
    upcomingOnly ? "/scheduled-events?upcoming_only=true" : "/scheduled-events",
  );
/** Back-compat alias used by the overview shell. */
export const fetchUpcomingEvents = () => fetchScheduledEvents(true);

export const createScheduledEvent = (data: ScheduledEventRequest) =>
  sendJSON<ScheduledEvent>("/scheduled-events", "POST", data);

export const deleteScheduledEvent = (id: string | number) =>
  sendJSON<Record<string, unknown>>(`/scheduled-events/${id}`, "DELETE");

export const fetchEventImpact = (id: string | number, hour: number) =>
  getJSON<EventImpact>(`/scheduled-events/${id}/impact?hour=${hour}`);

// --- Simulation / routing ----------------------------------------------------
export const simulate = (req: DisasterRequest) =>
  sendJSON<SimulateResponse>("/simulate", "POST", req);

export const stressTest = (req: DisasterRequest) =>
  sendJSON<Record<string, unknown>>("/stress-test", "POST", req);

export const computeRoute = (req: RouteRequest) =>
  sendJSON<Record<string, unknown>>("/route", "POST", req);

// --- Playbook actions --------------------------------------------------------
export const dispatchSms = (playbook: Playbook, advisoryText: string, recipients: string[]) =>
  sendJSON<Record<string, unknown>>("/sms-dispatch", "POST", {
    playbook,
    advisory_text: advisoryText,
    recipients,
  });

export const renderPlaybook = (playbook: Playbook) =>
  sendJSON<{ narrative?: string } & Record<string, unknown>>("/render-playbook", "POST", {
    playbook,
  });

export const generateAdvisory = (playbook: Playbook) =>
  sendJSON<AdvisoryResponse>("/advisory", "POST", { playbook });

export const signalOverride = (networkState: Playbook["network_state"]) =>
  sendJSON<Record<string, unknown>>("/signal-override", "POST", { network_state: networkState });

export const setBarricades = (blockedCorridors: string[], networkState: Playbook["network_state"]) =>
  sendJSON<Record<string, unknown>>("/barricades", "POST", {
    blocked_corridors: blockedCorridors,
    network_state: networkState,
  });
