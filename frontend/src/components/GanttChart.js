import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { pidColor } from '../lib/utils';
export default function GanttChart({ gantt, metrics, animatedUpTo }) {
    if (!gantt.length)
        return null;
    const totalTime = Math.max(...gantt.map(g => g.end));
    const pxPerUnit = 100 / totalTime; // percentage per time unit
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "kronos-card", children: [_jsx("div", { className: "text-xs font-mono mb-3", style: { color: 'var(--text-3)' }, children: "GANTT CHART \u2014 TIME UNITS" }), _jsxs("div", { className: "relative", style: { height: 48, marginBottom: 24 }, children: [gantt.map((entry, i) => {
                                const left = entry.start / totalTime * 100;
                                const width = (entry.end - entry.start) / totalTime * 100;
                                const isVisible = animatedUpTo === undefined || entry.start < animatedUpTo;
                                return (_jsx(motion.div, { initial: { opacity: 0, scaleX: 0 }, animate: isVisible ? { opacity: 1, scaleX: 1 } : {}, transition: { duration: 0.3, delay: i * 0.04 }, style: {
                                        position: 'absolute',
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        top: 0,
                                        height: 40,
                                        background: pidColor(entry.pid) + '22',
                                        border: `1px solid ${pidColor(entry.pid)}66`,
                                        borderRadius: 3,
                                        transformOrigin: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                    }, title: `${entry.pid}: ${entry.start}–${entry.end} (${entry.end - entry.start} units)`, children: _jsx("span", { className: "font-display font-bold text-xs truncate px-1", style: { color: pidColor(entry.pid) }, children: width > 4 ? entry.pid : '' }) }, `${entry.pid}-${i}`));
                            }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 flex", style: { top: 44 }, children: Array.from({ length: Math.min(totalTime + 1, 21) }, (_, i) => {
                                    const step = totalTime <= 20 ? 1 : Math.ceil(totalTime / 20);
                                    const t = i * step;
                                    if (t > totalTime)
                                        return null;
                                    return (_jsxs("div", { style: { position: 'absolute', left: `${t / totalTime * 100}%` }, children: [_jsx("div", { className: "w-px h-2", style: { background: 'var(--border)' } }), _jsx("span", { className: "font-mono text-[10px]", style: { color: 'var(--text-3)', marginLeft: -4 }, children: t })] }, t));
                                }) })] }), _jsx("div", { className: "flex flex-wrap gap-3 mt-2", children: [...new Set(gantt.map(g => g.pid))].map(pid => (_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "w-3 h-3 rounded-sm", style: { background: pidColor(pid) + '44', border: `1px solid ${pidColor(pid)}` } }), _jsx("span", { className: "font-mono text-xs", style: { color: 'var(--text-2)' }, children: pid })] }, pid))) })] }), _jsxs("div", { className: "kronos-card overflow-x-auto", children: [_jsx("div", { className: "text-xs font-mono mb-3", style: { color: 'var(--text-3)' }, children: "PROCESS METRICS TABLE" }), _jsxs("table", { className: "w-full text-xs font-mono", style: { borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsx("tr", { style: { borderBottom: '1px solid var(--border)' }, children: ['PID', 'Arrival', 'Burst', 'Completion', 'Turnaround', 'Waiting', 'Response'].map(h => (_jsx("th", { className: "text-left pb-2 pr-4", style: { color: 'var(--text-3)', fontWeight: 600 }, children: h }, h))) }) }), _jsx("tbody", { children: metrics.map((m, i) => (_jsxs(motion.tr, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.05 }, style: { borderBottom: '1px solid rgba(30,45,71,0.5)' }, children: [_jsx("td", { className: "py-2 pr-4 font-bold", style: { color: pidColor(m.pid) }, children: m.pid }), _jsx("td", { className: "py-2 pr-4", style: { color: 'var(--text-2)' }, children: m.arrival }), _jsx("td", { className: "py-2 pr-4", style: { color: 'var(--text-2)' }, children: m.burst }), _jsx("td", { className: "py-2 pr-4", style: { color: 'var(--text-1)' }, children: m.completion }), _jsx("td", { className: "py-2 pr-4", style: { color: 'var(--amber)' }, children: m.turnaround }), _jsx("td", { className: "py-2 pr-4", style: { color: 'var(--cyan)' }, children: m.waiting }), _jsx("td", { className: "py-2 pr-4", style: { color: 'var(--emerald)' }, children: m.response })] }, m.pid))) })] })] })] }));
}
