/**
 * Module-level caches that survive Next.js client-side navigation.
 * Reset only on hard page refresh (F5 / new tab).
 *
 * Two purposes:
 *  1. officersCache — preserve nearest_officers after PlaybookPanel unmounts
 *     so handleDispatch still has station data if the user navigated away.
 *  2. stationDeployed — overlay deployed counts onto /officers/summary so
 *     the Marshals page reflects a dispatch even if the backend pool hasn't
 *     updated synchronously.
 */

import type { NearestOfficer } from './types';

// ---------------------------------------------------------------------------
// 1. Officers cache (by incident id)
// ---------------------------------------------------------------------------

const officersCache = new Map<string | number, NearestOfficer[]>();

export function cacheOfficers(
  incidentId: string | number,
  officers: NearestOfficer[],
): void {
  if (officers.length > 0) officersCache.set(incidentId, officers);
}

export function getCachedOfficers(incidentId: string | number): NearestOfficer[] {
  return officersCache.get(incidentId) ?? [];
}

// ---------------------------------------------------------------------------
// 2. Station deployed overlay (police_station -> count)
// ---------------------------------------------------------------------------

const stationDeployed = new Map<string, number>();

export function recordDeployment(
  deployments: { police_station: string; count: number }[],
): void {
  for (const d of deployments) {
    stationDeployed.set(
      d.police_station,
      (stationDeployed.get(d.police_station) ?? 0) + d.count,
    );
  }
}

export function getStationDeployed(station: string): number {
  return stationDeployed.get(station) ?? 0;
}

export function getTotalDeployed(): number {
  let total = 0;
  stationDeployed.forEach((v) => { total += v; });
  return total;
}

/** Call when a demo is reset so stale counts don't bleed into a fresh run. */
export function clearDeploymentOverlay(): void {
  stationDeployed.clear();
  officersCache.clear();
}
