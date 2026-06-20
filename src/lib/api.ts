const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blockbuster-615636980270.europe-west1.run.app';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

export async function fetchCorridors() {
  const res = await fetch(`${API_BASE_URL}/corridors`);
  if (!res.ok) throw new Error('Failed to fetch corridors');
  return res.json();
}

export async function fetchCorridorCentroids() {
  const res = await fetch(`${API_BASE_URL}/corridor-centroids`);
  if (!res.ok) throw new Error('Failed to fetch corridor centroids');
  return res.json();
}

export async function fetchCorridorGraph() {
  const res = await fetch(`${API_BASE_URL}/corridor-graph`);
  if (!res.ok) throw new Error('Failed to fetch corridor graph');
  return res.json();
}

export async function fetchStations() {
  const res = await fetch(`${API_BASE_URL}/stations`);
  if (!res.ok) throw new Error('Failed to fetch stations');
  return res.json();
}

export async function fetchJunctions() {
  const res = await fetch(`${API_BASE_URL}/junctions`);
  if (!res.ok) throw new Error('Failed to fetch junctions');
  return res.json();
}

export async function fetchNetworkStatus(hour: number) {
  const res = await fetch(`${API_BASE_URL}/network-status?hour=${hour}`);
  if (!res.ok) throw new Error('Failed to fetch network status');
  return res.json();
}

export async function fetchOfficersSummary() {
  const res = await fetch(`${API_BASE_URL}/officers/summary`);
  if (!res.ok) throw new Error('Failed to fetch officers summary');
  return res.json();
}

export async function fetchActiveIncidents() {
  const res = await fetch(`${API_BASE_URL}/incidents?status=ACTIVE`);
  if (!res.ok) throw new Error('Failed to fetch active incidents');
  return res.json();
}

export async function fetchIncident(id: string | number) {
  const res = await fetch(`${API_BASE_URL}/incidents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch incident');
  return res.json();
}

export async function updateIncident(id: string | number, data: any) {
  const res = await fetch(`${API_BASE_URL}/incidents/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update incident');
  return res.json();
}

export async function fetchUpcomingEvents() {
  const res = await fetch(`${API_BASE_URL}/scheduled-events?upcoming_only=true`);
  if (!res.ok) throw new Error('Failed to fetch scheduled events');
  return res.json();
}

export async function dispatchSms(playbook: any, advisoryText: string, recipients: string[]) {
  const res = await fetch(`${API_BASE_URL}/sms-dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playbook, advisory_text: advisoryText, recipients }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.reason || 'Failed to dispatch SMS');
  }
  return res.json();
}

export async function renderPlaybook(playbook: any) {
  const res = await fetch(`${API_BASE_URL}/render-playbook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playbook }),
  });
  if (!res.ok) throw new Error('Failed to render playbook narrative');
  return res.json();
}

export async function generateAdvisory(playbook: any) {
  const res = await fetch(`${API_BASE_URL}/advisory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playbook }),
  });
  if (!res.ok) throw new Error('Failed to generate advisory');
  return res.json();
}

export async function deployOfficers(id: string | number, deployments: any[]) {
  const res = await fetch(`${API_BASE_URL}/incidents/${id}/deploy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deployments }),
  });
  if (!res.ok) throw new Error('Failed to deploy officers');
  return res.json();
}

export async function resolveIncident(id: string | number) {
  const res = await fetch(`${API_BASE_URL}/incidents/${id}/resolve`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to resolve incident');
  return res.json();
}
