# BlockBuster — Frontend Feature List (for wireframing)

This is organized by page/section, not by API endpoint — see `blockbuster-backend-api-reference.md` for exact request/response shapes. Each item below names its data source so wireframing can account for what's real vs. placeholder from day one.

**Legend:** ✅ = real, live backend data available · ⚠️ = partially available / needs a decision · 🚫 = no backend data, must be static/mocked or out of scope

---

## 0. Landing Page

Not scoped in detail yet — this is marketing/intro content (project name, pitch, "Enter Dashboard" button), not data-driven. 🚫 No backend dependency at all. Treat as pure design/copy; flag to me separately if you want help with messaging/structure.

---

## 1. Top Bar (persistent across all dashboard pages)

| Element | Status | Source |
|---|---|---|
| Logo, title, "City Operations Dashboard" subtitle | 🚫 | static |
| Live clock (TIME) | 🚫 | client-side `Date()`, no backend needed |
| Date | 🚫 | client-side |
| Weather | 🚫 | out of data-scope (locked to ASTraM + MapMyIndia) — mock or omit |
| Active Events count | ✅ | `GET /incidents?status=ACTIVE` → count the list |
| Available Marshals (e.g. "298/301") | ✅ | `GET /officers/summary` → `available_officers`/`total_officers` |
| Response Units | 🚫 | **undefined concept**, no backend data — placeholder only until defined |
| System Status ("Operational") | ⚠️ | derive from `GET /health` (200 = operational), or static |

---

## 2. Main Map (core visual, shared across Overview / Live Traffic)

| Element | Status | Source |
|---|---|---|
| Base map rendering | ⚠️ | use Leaflet (or similar) — **not** Mappls' own Map SDK (key has no SDK allocation) |
| Corridor markers, colored by status | ✅ | `GET /corridor-centroids` (position) joined with `GET /network-status?hour=` or `/simulate`/`/playbook` (`vc_ratio`/`color`) |
| Connector lines between corridors | ✅ | `GET /corridor-graph` (edges) |
| Police station markers | ✅ | `GET /stations` |
| Junction markers (e.g. "Silk Board Junction") | 🚫 | `GET /junctions` has names + historical frequency, **no coordinates** — needs manual lookup if wanted |
| Search bar | ✅ | client-side filter over `/corridors`, `/stations`, `/junctions` names — **not** a live geocoding call (not buildable on current Mappls account) |
| Incident callout / "Severe Congestion" label | ✅ | from whichever corridor/incident is selected — `network_state` color + `/incidents` label |
| Zoom controls, legend (green/yellow/red) | 🚫 | standard map UI, no backend needed |

---

## 3. Overview Page

City-wide snapshot, no specific incident selected.

| Element | Status | Source |
|---|---|---|
| Live map (baseline, no disaster) | ✅ | `GET /network-status?hour=<current>` |
| Active incidents summary | ✅ | `GET /incidents?status=ACTIVE` |
| Officer availability summary | ✅ | `GET /officers/summary` |
| Upcoming scheduled events (next few hours) | ✅ | `GET /scheduled-events?upcoming_only=true` |
| Alert ticker (bottom strip) | ⚠️ | combine: red corridors from baseline `network_state` (derive client-side) + `/scheduled-events?upcoming_only=true` for things like "VIP Movement at Vidhana Soudha at 16:00." Weather-based alerts are 🚫. |

---

## 4. Live Traffic Page

Deep-dive version of the map, likely with disaster-injection controls.

| Element | Status | Source |
|---|---|---|
| "Inject Disaster" panel (pick corridors, hour, severity) | ✅ | feeds `POST /simulate` or `POST /stress-test` |
| Live network state after injection | ✅ | response of the above |
| Diversion route preview | ✅ | `POST /route` or as part of `/playbook` |

---

## 5. Incident Detail / Playbook Generation Engine (right panel in the mockup)

This is the core "Honest AI" pitch moment.

| Element | Status | Source |
|---|---|---|
| Incident selector ("Change Incident") | ✅ | `GET /corridors` for picking blocked corridor(s); or `GET /incidents` for existing ones |
| Step 1 — Signal Override (ETA, status) | ✅ | `POST /signal-override` (per-incident) |
| Step 2 — Set Barricades (ETA, status) | ✅ | `POST /barricades` |
| Step 3 — Marshal Deployment (ETA, status) | ✅ | `nearest_officers` from `/playbook`, deploy via `POST /incidents/{id}/deploy` |
| Step 4 — Public Advisory (ETA, status) | ✅ | `POST /advisory` (draft), gated send via `/sms-dispatch` |
| Plain-English briefing text | ✅ | `POST /render-playbook` |
| "Dispatch to Ground Units" button | ✅ | `POST /sms-dispatch` — **must stay visually disabled until** `judging_panel.overall_recommendation === "APPROVE"` and `state === "PENDING_APPROVAL"` (server also enforces this, but UI should reflect it) |
| Judging Panel checklist (Safety/Feasibility/Clarity) | ✅ | `judging_panel.checks` from `/playbook` |

**Note on per-step ETAs shown in the mockup (2 mins / 5 mins / 8 mins / 10 mins):** these aren't separately computed durations in the backend — they're illustrative in the mockup. If you want real numbers here, the closest real values are: officer ETA (`nearest_officers[].eta_minutes`) for the Marshal step, and the diversion route's `eta_minutes` for context. Signal override and barricade steps don't have a natural "time to complete" value computed anywhere — treat those as either omitted or a reasonable static estimate, not real data.

---

## 6. Live Script Execution (terminal-style log)

| Element | Status | Source |
|---|---|---|
| Live streaming log lines | ✅ | `POST /playbook-stream` (SSE) — use `EventSource`, not `fetch()` |
| Final "done" payload feeding the rest of the panel | ✅ | the `done` event's `data` field — same shape as `/playbook`'s response |

---

## 7. Incidents Page

| Element | Status | Source |
|---|---|---|
| List of active incidents | ✅ | `GET /incidents?status=ACTIVE` |
| Create new incident | ✅ | `POST /incidents` |
| Incident detail view | ✅ | `GET /incidents/{id}` |
| Resolve incident (releases officers) | ✅ | `POST /incidents/{id}/resolve` |
| Delete incident | ✅ | `DELETE /incidents/{id}` |

---

## 8. Signals Page

| Element | Status | Source |
|---|---|---|
| City-wide current signal recommendations | ✅ | `GET /signals/overview?hour=<current>` |
| Per-incident signal override (shown in Playbook panel instead, see section 5) | ✅ | `POST /signal-override` |

**Honest framing note:** this is a *recommendation engine*, not live signal hardware monitoring — there's no real signal status data anywhere in this system. Don't design this page to look like it's showing live signal phase states; design it as "here's what the system recommends right now."

---

## 9. Marshals Page

| Element | Status | Source |
|---|---|---|
| Total / available / deployed officer counts | ✅ | `GET /officers/summary` |
| Per-station breakdown | ✅ | `by_station` in the same response |
| Station locations on a map | ✅ | `GET /stations` |
| Individual officer roster (names/ranks) | 🚫 | only aggregate counts are exposed, not a per-officer list endpoint — would need a new endpoint if individual rows are wanted |

---

## 10. Roadwork Page

| Element | Status | Source |
|---|---|---|
| List of roadwork events | ✅ | `GET /scheduled-events?upcoming_only=` then filter client-side for `event_type === "roadwork"` |
| Create roadwork event | ✅ | `POST /scheduled-events` with `event_type: "roadwork"` |
| Predicted impact preview | ✅ | `GET /scheduled-events/{id}/impact?hour=` — runs the real simulation engine |

---

## 11. Pre-Event Calendar (could live inside Roadwork page or standalone)

| Element | Status | Source |
|---|---|---|
| Upcoming planned events (any type) | ✅ | `GET /scheduled-events?upcoming_only=true` |
| Pick a future date/event, see predicted impact | ⚠️ | `/scheduled-events/{id}/impact` works, but for dates far beyond ~April 2024 (historical data's end), the forecast collapses to a seasonal baseline with no recent-trend signal — be upfront about this in the UI copy if showing far-future predictions |

---

## 12. Analytics Page

| Element | Status | Source |
|---|---|---|
| Model performance metrics (AUC-ROC, PR-AUC) | ✅ | `GET /analytics/summary` → `model_metrics` (real, validated numbers) |
| Corridors ranked by historical incident frequency | ✅ | same endpoint → `corridors_by_historical_frequency` |
| Per-corridor historical trend chart | ✅ | `GET /analytics/corridor/{corridor}/history` |
| "Post-Event Learning" (forecast vs. actual comparison) | ⚠️ | the historical time series is available; the *forecast* side would need to be generated for a past date via `/forecast` and compared client-side — no dedicated "comparison" endpoint exists, but the raw pieces are both real |

---

## 13. Reports Page

| Element | Status | Source |
|---|---|---|
| List of resolved incidents | ✅ | `GET /incidents?status=RESOLVED` |
| Full report detail (briefing, dispatch outcome, judging result) | ✅ | each resolved incident's `playbook` field already contains everything |

---

## 14. Settings Page

🚫 Pure frontend concern (theme, notification preferences, account info if any) — no backend dependency identified yet.

---

## Cross-Cutting Notes for Wireframing

- **Hour parameter everywhere:** most endpoints take an `hour` (0-23) representing time-of-day for the demand model. Decide once how the UI sets this — a live clock-driven default (current hour) for "Overview"/"Signals overview," vs. an explicit picker when injecting a disaster or previewing a scheduled event.
- **`vc_ratio: null` means fully blocked**, not missing data — color it red/"blocked" explicitly, don't just hide it.
- **In-memory data resets on cold start.** Incidents and Scheduled Events created during a rehearsal won't necessarily survive to the live demo if Cloud Run scales to zero in between — plan to recreate your demo scenario fresh right before presenting, or keep the service warm.
- **Three known undefined/placeholder areas, called out so design doesn't get blocked on them:** Response Units metric, junction map pins, individual per-officer roster listing.
