const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
async function request(path, options) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? 'Request failed');
    }
    return res.json();
}
// ── Simulate ──────────────────────────────────────────────────────────────────
export const api = {
    simulateCPU: (body) => request('/api/simulate/cpu', { method: 'POST', body: JSON.stringify(body) }),
    simulateMemory: (body) => request('/api/simulate/memory', { method: 'POST', body: JSON.stringify(body) }),
    simulateDisk: (body) => request('/api/simulate/disk', { method: 'POST', body: JSON.stringify(body) }),
    simulateDeadlock: (body) => request('/api/simulate/deadlock', { method: 'POST', body: JSON.stringify(body) }),
    simulateDuel: (body) => request('/api/simulate/duel', { method: 'POST', body: JSON.stringify(body) }),
    // ── History ────────────────────────────────────────────────────────────────
    getHistory: (limit = 50, category) => request(`/api/history/?limit=${limit}${category ? `&category=${category}` : ''}`),
    getHistoryItem: (id) => request(`/api/history/runs/${id}`),
    deleteHistory: (id) => request(`/api/history/runs/${id}`, { method: 'DELETE' }),
    clearHistory: () => request('/api/history/', { method: 'DELETE' }),
    compareRuns: (runIds) => request('/api/history/compare', { method: 'POST', body: JSON.stringify({ run_ids: runIds }) }),
    getRunInsight: (id) => request(`/api/history/runs/${id}/insight`),
    listScenarios: (category) => request(`/api/history/scenarios/${category ? `?category=${category}` : ''}`),
    createScenario: (payload) => request('/api/history/scenarios/', { method: 'POST', body: JSON.stringify(payload) }),
    deleteScenario: (id) => request(`/api/history/scenarios/${id}`, { method: 'DELETE' }),
};
// ── WebSocket factory ─────────────────────────────────────────────────────────
export function createSimWS(category) {
    const wsBase = BASE.replace(/^http/, 'ws');
    return new WebSocket(`${wsBase}/api/simulate/ws/${category}`);
}
export function getExportCsvUrl(limit = 250) {
    return `${BASE}/api/history/export/csv?limit=${limit}`;
}
