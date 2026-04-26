import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw, Download, ChevronDown, ChevronUp, History, Sparkles, Save, Scale, FileText } from 'lucide-react';
import { api, getExportCsvUrl } from '../lib/api';
import { downloadJSON, fmt2 } from '../lib/utils';
const CATEGORY_COLORS = {
    cpu: 'var(--amber)',
    memory: 'var(--emerald)',
    disk: '#a78bfa',
    deadlock: 'var(--rose)',
};
function MetricBadge({ label, value, color }) {
    return (_jsxs("div", { className: "flex flex-col items-center px-3 py-1.5 rounded", style: { background: `${color}12`, border: `1px solid ${color}30` }, children: [_jsx("span", { className: "font-mono font-bold text-base", style: { color }, children: value }), _jsx("span", { className: "text-xs font-mono mt-0.5", style: { color: 'var(--text-3)' }, children: label })] }));
}
function HistoryRow({ item, selected, onToggleSelect, onDelete, onSaveScenario, }) {
    const [expanded, setExpanded] = useState(false);
    const color = CATEGORY_COLORS[item.category] ?? 'var(--text-2)';
    const rd = item.result_data;
    const metrics = item.category === 'cpu' ? [
        { label: 'Avg Wait', value: rd.avg_waiting?.toFixed(2) ?? '—' },
        { label: 'Avg TAT', value: rd.avg_turnaround?.toFixed(2) ?? '—' },
        { label: 'CPU Util', value: rd.cpu_utilization != null ? `${rd.cpu_utilization.toFixed(1)}%` : '—' },
    ] : item.category === 'memory' ? [
        { label: 'Faults', value: rd.fault_count ?? '—' },
        { label: 'Hits', value: rd.hit_count ?? '—' },
        { label: 'Fault %', value: rd.fault_rate != null ? `${rd.fault_rate.toFixed(1)}%` : '—' },
    ] : item.category === 'disk' ? [
        { label: 'Seek Dist', value: rd.total_seek_distance ?? '—' },
        { label: 'Avg Seek', value: rd.avg_seek_time?.toFixed(2) ?? '—' },
    ] : item.category === 'deadlock' ? [
        { label: 'State', value: rd.is_safe ? 'SAFE' : 'UNSAFE' },
        { label: 'Seq Len', value: rd.safe_sequence?.length ?? '—' },
    ] : [];
    return (_jsxs(motion.div, { layout: true, initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, x: -20 }, className: "kronos-card", style: { border: `1px solid var(--border)` }, children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("input", { type: "checkbox", checked: selected, onChange: () => onToggleSelect(item.id) }), _jsxs("span", { className: "font-mono text-xs w-8 flex-shrink-0", style: { color: 'var(--text-3)' }, children: ["#", item.id] }), _jsx("span", { className: "badge flex-shrink-0", style: {
                            background: `${color}18`, color, border: `1px solid ${color}40`, fontSize: '0.65rem'
                        }, children: item.category.toUpperCase() }), _jsx("span", { className: "font-display font-bold text-sm flex-shrink-0", style: { color: 'var(--text-1)' }, children: item.algorithm }), _jsx("div", { className: "flex gap-2 flex-1 flex-wrap", children: metrics.map((m, i) => (_jsx(MetricBadge, { label: m.label, value: m.value, color: color }, i))) }), _jsx("span", { className: "font-mono text-xs flex-shrink-0", style: { color: 'var(--text-3)' }, children: new Date(item.created_at).toLocaleString() }), _jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [_jsx("button", { onClick: () => onSaveScenario(item), className: "btn btn-ghost", style: { padding: '4px 6px' }, title: "Save as scenario preset", children: _jsx(Save, { size: 12 }) }), _jsx("button", { onClick: () => downloadJSON(item, `kronos-sim-${item.id}.json`), className: "btn btn-ghost", style: { padding: '4px 6px' }, title: "Download JSON", children: _jsx(Download, { size: 12 }) }), _jsx("button", { onClick: () => setExpanded(e => !e), className: "btn btn-ghost", style: { padding: '4px 6px' }, title: "Show details", children: expanded ? _jsx(ChevronUp, { size: 12 }) : _jsx(ChevronDown, { size: 12 }) }), _jsx("button", { onClick: () => onDelete(item.id), className: "btn btn-ghost", style: { padding: '4px 6px', color: 'var(--rose)' }, title: "Delete", children: _jsx(Trash2, { size: 12 }) })] })] }), _jsx(AnimatePresence, { children: expanded && (_jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: 'auto', opacity: 1 }, exit: { height: 0, opacity: 0 }, className: "overflow-hidden", children: _jsx("div", { className: "mt-4 pt-4", style: { borderTop: '1px solid var(--border)' }, children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs font-mono mb-2", style: { color: 'var(--text-3)' }, children: "INPUT" }), _jsx("pre", { className: "text-xs font-mono p-3 rounded overflow-auto", style: { background: 'var(--void)', border: '1px solid var(--border)',
                                                color: 'var(--text-2)', maxHeight: 200 }, children: JSON.stringify(item.input_data, null, 2) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs font-mono mb-2", style: { color: 'var(--text-3)' }, children: "RESULT (SUMMARY)" }), _jsx("pre", { className: "text-xs font-mono p-3 rounded overflow-auto", style: { background: 'var(--void)', border: '1px solid var(--border)',
                                                color: 'var(--text-2)', maxHeight: 200 }, children: JSON.stringify(Object.fromEntries(Object.entries(item.result_data).filter(([k]) => !['steps', 'gantt', 'states', 'seek_sequence', 'metrics'].includes(k))), null, 2) })] })] }) }) })) })] }));
}
export default function HistoryPage() {
    const [history, setHistory] = useState([]);
    const [scenarios, setScenarios] = useState([]);
    const [compareResult, setCompareResult] = useState(null);
    const [insightMap, setInsightMap] = useState({});
    const [selectedRuns, setSelectedRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [tab, setTab] = useState('history');
    const load = async () => {
        setLoading(true);
        try {
            const h = await api.getHistory(100);
            setHistory(h);
            const s = await api.listScenarios();
            setScenarios(s);
        }
        catch { }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);
    const handleDelete = async (id) => {
        await api.deleteHistory(id).catch(() => { });
        setHistory(h => h.filter(x => x.id !== id));
    };
    const handleToggleSelect = (id) => {
        setSelectedRuns(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id].slice(-4));
    };
    const handleCompare = async () => {
        if (selectedRuns.length < 2)
            return;
        try {
            const result = await api.compareRuns(selectedRuns);
            setCompareResult(result);
        }
        catch { }
    };
    const fetchInsight = async (id) => {
        if (insightMap[id])
            return;
        try {
            const result = await api.getRunInsight(id);
            setInsightMap(prev => ({ ...prev, [id]: result }));
        }
        catch { }
    };
    const handleSaveScenario = async (item) => {
        const name = window.prompt('Scenario name', `${item.category.toUpperCase()} ${item.algorithm} baseline`);
        if (!name)
            return;
        const notes = window.prompt('Scenario notes (optional)', 'Saved from simulation history');
        try {
            await api.createScenario({
                name,
                category: item.category,
                algorithm: item.algorithm,
                payload: item.input_data,
                notes,
                tags: [item.category, item.algorithm],
            });
            const s = await api.listScenarios();
            setScenarios(s);
            setTab('scenarios');
        }
        catch { }
    };
    const handleDeleteScenario = async (id) => {
        await api.deleteScenario(id).catch(() => { });
        setScenarios(prev => prev.filter(x => x.id !== id));
    };
    const handleClear = async () => {
        if (!confirm('Clear all simulation history?'))
            return;
        await api.clearHistory().catch(() => { });
        setHistory([]);
    };
    const filtered = filter === 'all' ? history : history.filter(h => h.category === filter);
    return (_jsxs("div", { className: "max-w-5xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(History, { size: 18, style: { color: 'var(--text-2)' } }), _jsx("span", { className: "font-display font-bold tracking-wider", style: { color: 'var(--text-1)' }, children: "SIMULATION LOG" }), _jsx("span", { className: "badge badge-cyan ml-2", children: filtered.length })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("a", { className: "btn btn-ghost", href: getExportCsvUrl(500), target: "_blank", rel: "noreferrer", children: [_jsx(FileText, { size: 13 }), " EXPORT CSV"] }), _jsxs("button", { className: "btn btn-ghost", onClick: load, children: [_jsx(RefreshCw, { size: 13 }), " REFRESH"] }), _jsxs("button", { className: "btn btn-rose", onClick: handleClear, disabled: !history.length, children: [_jsx(Trash2, { size: 13 }), " CLEAR ALL"] })] })] }), _jsx("div", { className: "flex gap-2", children: ['history', 'scenarios'].map(view => (_jsx("button", { className: "btn", onClick: () => setTab(view), style: {
                        padding: '5px 14px',
                        background: tab === view ? 'rgba(0,229,255,0.15)' : 'transparent',
                        border: `1px solid ${tab === view ? 'var(--cyan)' : 'var(--border)'}`,
                        color: tab === view ? 'var(--cyan)' : 'var(--text-3)',
                        fontSize: '0.72rem',
                    }, children: view.toUpperCase() }, view))) }), tab === 'history' && (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex gap-2 flex-wrap", children: ['all', 'cpu', 'memory', 'disk', 'deadlock'].map(f => (_jsx("button", { onClick: () => setFilter(f), className: "btn", style: {
                                padding: '5px 14px',
                                background: filter === f ? (f === 'all' ? 'rgba(0,229,255,0.15)' : `${CATEGORY_COLORS[f] ?? 'var(--cyan)'}18`) : 'transparent',
                                border: `1px solid ${filter === f ? (CATEGORY_COLORS[f] ?? 'var(--cyan)') : 'var(--border)'}`,
                                color: filter === f ? (CATEGORY_COLORS[f] ?? 'var(--cyan)') : 'var(--text-3)',
                                fontSize: '0.7rem',
                            }, children: f.toUpperCase() }, f))) }), _jsxs("div", { className: "kronos-card space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-xs font-mono", style: { color: 'var(--text-2)' }, children: "Select up to 4 runs in the same category to compare." }), _jsxs("button", { className: "btn btn-ghost", disabled: selectedRuns.length < 2, onClick: handleCompare, children: [_jsx(Scale, { size: 12 }), " COMPARE SELECTED"] })] }), _jsxs("div", { className: "text-xs font-mono", style: { color: 'var(--text-3)' }, children: ["Selected: ", selectedRuns.join(', ') || 'none'] }), compareResult && (_jsxs("div", { className: "rounded p-3", style: { border: '1px solid var(--border)' }, children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Sparkles, { size: 14, style: { color: 'var(--cyan)' } }), _jsxs("span", { className: "font-mono text-xs", style: { color: 'var(--text-2)' }, children: ["BEST RUN #", compareResult.best_run_id, " using metric ", compareResult.metric_key] })] }), _jsx("div", { className: "grid md:grid-cols-2 gap-2", children: compareResult.points.map(point => (_jsxs("div", { className: "rounded p-2", style: { border: '1px solid var(--border)' }, children: [_jsxs("div", { className: "text-xs font-mono", style: { color: 'var(--text-2)' }, children: ["#", point.id, " ", point.algorithm] }), _jsx("div", { className: "font-mono text-sm", style: { color: 'var(--text-1)' }, children: fmt2(point.metric) })] }, point.id))) })] }))] }), loading ? (_jsx("div", { className: "text-center py-16 font-mono text-sm", style: { color: 'var(--text-3)' }, children: "Loading simulations..." })) : filtered.length === 0 ? (_jsxs("div", { className: "text-center py-24 flex flex-col items-center", children: [_jsx("div", { className: "text-5xl mb-4 opacity-20", children: "\uD83D\uDCCB" }), _jsx("p", { className: "font-mono text-sm", style: { color: 'var(--text-3)' }, children: "No simulations recorded yet. Run some simulations to see them here." })] })) : (_jsx("div", { className: "space-y-3", children: _jsx(AnimatePresence, { children: filtered.map(item => (_jsxs("div", { className: "space-y-2", children: [_jsx(HistoryRow, { item: item, selected: selectedRuns.includes(item.id), onToggleSelect: handleToggleSelect, onDelete: handleDelete, onSaveScenario: handleSaveScenario }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { className: "btn btn-ghost", style: { fontSize: '0.65rem' }, onClick: () => fetchInsight(item.id), children: [_jsx(Sparkles, { size: 12 }), " INSIGHT"] }) }), insightMap[item.id] && (_jsx("div", { className: "kronos-card", style: { padding: '10px 12px', marginTop: '-4px' }, children: _jsx("p", { className: "text-xs font-mono", style: { color: 'var(--text-2)' }, children: insightMap[item.id].insight }) }))] }, item.id))) }) }))] })), tab === 'scenarios' && (_jsx("div", { className: "space-y-3", children: scenarios.length === 0 ? (_jsx("div", { className: "kronos-card text-sm font-mono", style: { color: 'var(--text-3)' }, children: "No scenarios yet. Save one from the history tab." })) : scenarios.map(scenario => (_jsx("div", { className: "kronos-card", children: _jsxs("div", { className: "flex justify-between items-start gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "font-display text-sm", style: { color: 'var(--text-1)' }, children: scenario.name }), _jsxs("div", { className: "text-xs font-mono", style: { color: 'var(--text-3)' }, children: [scenario.category.toUpperCase(), " - ", scenario.algorithm] }), scenario.notes && (_jsx("p", { className: "text-xs mt-2", style: { color: 'var(--text-2)' }, children: scenario.notes })), _jsx("div", { className: "flex gap-1 mt-2 flex-wrap", children: scenario.tags.map(tag => (_jsx("span", { className: "badge", children: tag }, tag))) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { className: "btn btn-ghost", onClick: () => downloadJSON(scenario.payload, `${scenario.name}.json`), children: [_jsx(Download, { size: 12 }), " PAYLOAD"] }), _jsxs("button", { className: "btn btn-ghost", style: { color: 'var(--rose)' }, onClick: () => handleDeleteScenario(scenario.id), children: [_jsx(Trash2, { size: 12 }), " DELETE"] })] })] }) }, scenario.id))) }))] }));
}
