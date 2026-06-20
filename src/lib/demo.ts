// One-click demo scenario for live presentations. The backend keeps incidents
// and scheduled-events in memory, so they vanish on a Cloud Run cold start —
// this re-seeds a realistic, reproducible scenario right before a demo.
import * as api from "./api";

/** ISO timestamp `hoursFromNow` hours ahead, on the minute. */
function isoInHours(hoursFromNow: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow, 0, 0, 0);
  return d.toISOString();
}

/**
 * Seed a realistic scenario: one major incident + two upcoming events.
 * Each step is best-effort — a single failure won't abort the rest.
 */
export async function seedDemoScenario(): Promise<void> {
  await api.createIncident({
    blocked_corridors: ["Mysore Road"],
    hour: 18,
    label: "Road Collapse — Mysore Road",
  });

  await api.createScheduledEvent({
    label: "VIP Movement — Vidhana Soudha",
    event_type: "vip",
    affected_corridors: ["CBD 1"],
    start_time: isoInHours(2),
    end_time: isoInHours(4),
    capacity_remaining_pct: 0.4,
  });

  await api.createScheduledEvent({
    label: "Roadwork — Outer Ring Road",
    event_type: "roadwork",
    affected_corridors: ["ORR North 1"],
    start_time: isoInHours(5),
    end_time: isoInHours(9),
    capacity_remaining_pct: 0.5,
  });
}

/**
 * Clear all demo data. No bulk-delete endpoint exists, so loop over individual
 * DELETE /incidents/{id} and /scheduled-events/{id}.
 */
export async function resetDemoScenario(): Promise<void> {
  const [{ incidents }, { events }] = await Promise.all([
    api.fetchIncidents("ALL"),
    api.fetchScheduledEvents(false),
  ]);

  await Promise.all([
    ...incidents.map((i) => api.deleteIncident(i.id).catch(() => undefined)),
    ...events.map((e) => api.deleteScheduledEvent(e.id).catch(() => undefined)),
  ]);
}
