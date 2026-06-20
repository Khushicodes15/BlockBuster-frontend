// Shared API response & domain types for the BTMC dashboard.
// Field names mirror the live backend payloads (probed via /api/backend).
// Loosely-specified objects keep an index signature so unknown fields stay
// accessible without falling back to `any`.

export type IsoDateString = string;

/** GET /health */
export interface HealthResponse {
  status: string; // 'ok' when operational
}

/** GET /corridors */
export interface CorridorsResponse {
  corridors: string[];
}

/** A corridor centroid. GET /corridor-centroids -> { centroids: [] } */
export interface Centroid {
  corridor: string;
  latitude: number;
  longitude: number;
}
export interface CentroidsResponse {
  centroids: Centroid[];
}

/** GET /corridor-graph -> { edges: [] } */
export interface CorridorEdge {
  source: string;
  target: string;
  distance_km?: number;
  [key: string]: unknown;
}
export interface CorridorGraphResponse {
  edges: CorridorEdge[];
}

/** GET /stations -> { stations: [] } */
export interface Station {
  police_station: string;
  latitude: number;
  longitude: number;
}
export interface StationsResponse {
  stations: Station[];
}

/** GET /junctions -> { junctions: [] } (junctions carry no coordinates) */
export interface Junction {
  junction: string;
  corridor: string;
}
export interface JunctionsResponse {
  junctions: Junction[];
}

/**
 * Traffic load for a corridor. `vc_ratio === null` => blocked / no data.
 * `demand`/`capacity` appear in /simulate and playbook network_state.
 */
export type TrafficColor = "green" | "yellow" | "red";
export interface NetworkStatusEntry {
  corridor: string;
  vc_ratio: number | null;
  color?: TrafficColor;
  demand?: number;
  capacity?: number;
}
/** GET /network-status?hour= -> { network_state: [] } */
export interface NetworkStatusResponse {
  network_state: NetworkStatusEntry[];
}

/** Per-station officer breakdown (officers/summary `by_station`). */
export interface StationOfficers {
  police_station: string;
  available: number;
  total: number;
  deployed?: number;
  [key: string]: unknown;
}
/** GET /officers/summary */
export interface OfficersSummaryResponse {
  available_officers: number;
  total_officers: number;
  deployed_officers?: number;
  by_station?: StationOfficers[];
}
/** Normalized marshal availability used in UI state. */
export interface MarshalAvailability {
  available: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Playbook engine ("Honest AI" centerpiece) — POST /playbook + /playbook-stream
// ---------------------------------------------------------------------------

/** The injected disaster the playbook was generated for. */
export interface Disaster {
  blocked_corridors: string[];
  hour: number;
  capacity_remaining_pct?: number;
  [key: string]: unknown;
}

/**
 * Stress-test result. `still_violated` only appears when `resolved_by_reroute`
 * is true — keep it optional and guard access.
 */
export interface StressTest {
  status: string; // e.g. "PASSED", "PASSED_AFTER_REROUTE"
  resolved_by_reroute: boolean;
  violated_initially: string[];
  still_violated?: string[];
  [key: string]: unknown;
}

/** A nearest-officer suggestion inside a playbook. */
export interface NearestOfficer {
  police_station: string;
  eta_minutes?: number;
  entry_corridor?: string;
}

/**
 * Diversion route. `status: "NO_PATH"` => no reroute found; `path` may be
 * absent. `negotiation_log` narrates the search.
 */
export interface Diversion {
  status?: string; // e.g. "OK", "NO_PATH"
  path?: string[];
  bottleneck?: string | null;
  bottleneck_vc?: number | null;
  eta_minutes?: number | null;
  negotiation_log?: string[];
  [key: string]: unknown;
}

/** A single AI judging check (Safety / Feasibility / Clarity). */
export interface JudgingCheck {
  check: string;
  passed: boolean;
  detail: string;
}

/** AI judging metadata attached to a generated playbook. */
export interface JudgingPanel {
  state?: string; // e.g. "PENDING_APPROVAL"
  overall_recommendation?: string; // "APPROVE" | "REVIEW_REQUIRED"
  checks?: JudgingCheck[];
  requires_watch_commander_approval?: boolean;
  [key: string]: unknown;
}

/** AI-generated response playbook for an incident. */
export interface Playbook {
  disaster?: Disaster;
  network_state?: NetworkStatusEntry[];
  stress_test?: StressTest;
  diversion?: Diversion;
  nearest_officers?: NearestOfficer[];
  judging_panel?: JudgingPanel;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Incidents — /incidents CRUD
// ---------------------------------------------------------------------------

export type IncidentStatus = "ACTIVE" | "RESOLVED";

/** Outcome of a dispatch, PATCHed back onto the incident (shared convention). */
export interface DispatchResult {
  dispatched_at: IsoDateString;
  advisory_text?: string;
  recipients_count?: number;
  deployments?: Deployment[];
  [key: string]: unknown;
}

export interface Incident {
  id: string | number;
  label?: string;
  hour?: number;
  blocked_corridors?: string[];
  playbook: Playbook | null;
  status: IncidentStatus;
  created_at?: IsoDateString;
  deployed_officer_ids?: (string | number)[];
  /** Frontend convention: result of /sms-dispatch persisted via PATCH. */
  dispatch_result?: DispatchResult;
}
/** GET /incidents -> { incidents: [] } */
export interface IncidentsResponse {
  incidents: Incident[];
}
/** POST /incidents body */
export interface IncidentCreateRequest {
  blocked_corridors: string[];
  hour: number;
  label: string;
}

// ---------------------------------------------------------------------------
// Scheduled events — /scheduled-events CRUD + impact
// ---------------------------------------------------------------------------

export interface ScheduledEvent {
  id: string | number;
  label: string;
  event_type: string; // "roadwork" | "vip" | ...
  affected_corridors: string[];
  start_time: IsoDateString;
  end_time?: IsoDateString;
  capacity_remaining_pct?: number;
  status?: string; // "SCHEDULED" | ...
  created_at?: IsoDateString;
  [key: string]: unknown;
}
export interface ScheduledEventsResponse {
  events: ScheduledEvent[];
}
/** POST /scheduled-events body */
export interface ScheduledEventRequest {
  label: string;
  event_type: string;
  affected_corridors: string[];
  start_time: IsoDateString;
  end_time: IsoDateString;
  capacity_remaining_pct: number;
}
/** GET /scheduled-events/{id}/impact?hour= */
export interface EventImpact {
  network_state: NetworkStatusEntry[];
  stress_test?: StressTest;
}

// ---------------------------------------------------------------------------
// Simulation / routing — /simulate, /stress-test, /route
// ---------------------------------------------------------------------------

/** POST /simulate, /stress-test body (DisasterRequest). */
export interface DisasterRequest {
  target_corridors: string[];
  hour: number;
  capacity_remaining_pct: number;
}
/** POST /simulate response. */
export interface SimulateResponse {
  network_state: NetworkStatusEntry[];
  unresolved_excess: number;
  stress_test?: StressTest;
  [key: string]: unknown;
}
/** POST /route body. */
export interface RouteRequest {
  origin: string;
  destination: string;
  blocked_corridors: string[];
  hour: number;
  capacity_remaining_pct: number;
  red_threshold: number;
}

// ---------------------------------------------------------------------------
// Signals — GET /signals/overview?hour=
// ---------------------------------------------------------------------------

export interface SignalOverride {
  corridor: string;
  vc_ratio: number | null;
  green_phase_extension_seconds: number;
  instruction: string;
}
export interface SignalsOverviewResponse {
  signal_overrides: SignalOverride[];
}

// ---------------------------------------------------------------------------
// Analytics — GET /analytics/summary, /analytics/corridor/{c}/history
// ---------------------------------------------------------------------------

export interface ModelMetrics {
  auc_roc: number;
  pr_auc: number;
  random_baseline_pr_auc: number;
  lift_over_baseline: number;
}
export interface CorridorFrequency {
  corridor: string;
  total_historical_events: number;
}
export interface AnalyticsSummary {
  model_metrics: ModelMetrics;
  historical_data_range: { start: string; end: string; total_rows: number };
  corridors_by_historical_frequency: CorridorFrequency[];
}
export interface HistoryBin {
  bin_start: string;
  event_count: number;
}
export interface CorridorHistory {
  corridor: string;
  history: HistoryBin[];
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

/** Mock weather model (no external API per project rules). */
export interface Weather {
  temp: number;
  condition: string;
  humidity: number;
}

/** POST /advisory */
export interface AdvisoryResponse {
  advisory?: string;
  [key: string]: unknown;
}

/** Officer deployment instruction. POST /incidents/{id}/deploy */
export interface Deployment {
  police_station: string;
  count: number;
}

/** SSE log event streamed from POST /playbook-stream. */
export interface LogEvent {
  type: "log";
  stage: string;
  message: string;
  timestamp: string;
}
