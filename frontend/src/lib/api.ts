const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json()
}

// ── Simulate ──────────────────────────────────────────────────────────────────

export const api = {
  simulateCPU: (body: object) =>
    request('/api/simulate/cpu', { method: 'POST', body: JSON.stringify(body) }),

  simulateMemory: (body: object) =>
    request('/api/simulate/memory', { method: 'POST', body: JSON.stringify(body) }),

  simulateDisk: (body: object) =>
    request('/api/simulate/disk', { method: 'POST', body: JSON.stringify(body) }),

  simulateDeadlock: (body: object) =>
    request('/api/simulate/deadlock', { method: 'POST', body: JSON.stringify(body) }),

  simulateDuel: (body: object) =>
    request('/api/simulate/duel', { method: 'POST', body: JSON.stringify(body) }),

  // ── History ────────────────────────────────────────────────────────────────
  getHistory: (limit = 50, category?: string) =>
    request(`/api/history/?limit=${limit}${category ? `&category=${category}` : ''}`),

  getHistoryItem: (id: number) =>
    request(`/api/history/runs/${id}`),

  deleteHistory: (id: number) =>
    request(`/api/history/runs/${id}`, { method: 'DELETE' }),

  clearHistory: () =>
    request('/api/history/', { method: 'DELETE' }),

  compareRuns: (runIds: number[]) =>
    request('/api/history/compare', { method: 'POST', body: JSON.stringify({ run_ids: runIds }) }),

  getRunInsight: (id: number) =>
    request(`/api/history/runs/${id}/insight`),

  listScenarios: (category?: string) =>
    request(`/api/history/scenarios/${category ? `?category=${category}` : ''}`),

  createScenario: (payload: object) =>
    request('/api/history/scenarios/', { method: 'POST', body: JSON.stringify(payload) }),

  deleteScenario: (id: number) =>
    request(`/api/history/scenarios/${id}`, { method: 'DELETE' }),
}

// ── WebSocket factory ─────────────────────────────────────────────────────────

export function createSimWS(category: string): WebSocket {
  const wsBase = BASE.replace(/^http/, 'ws')
  return new WebSocket(`${wsBase}/api/simulate/ws/${category}`)
}

export function getExportCsvUrl(limit = 250): string {
  return `${BASE}/api/history/export/csv?limit=${limit}`
}
