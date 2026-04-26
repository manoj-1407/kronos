import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Cpu, Database, HardDrive, AlertTriangle, Zap, Activity, Clock, Layers } from 'lucide-react';
import { useStore } from '../store';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
const MODULES = [
    {
        to: '/cpu', icon: Cpu, title: 'CPU SCHEDULER',
        subtitle: '7 algorithms', color: 'var(--amber)',
        algorithms: ['FCFS', 'SJF', 'SRTF', 'Round Robin', 'Priority NP', 'Priority P', 'MLFQ'],
        desc: 'Visualize process scheduling tick-by-tick with animated Gantt charts and per-process metrics.',
    },
    {
        to: '/memory', icon: Database, title: 'MEMORY UNIT',
        subtitle: '5 algorithms', color: 'var(--emerald)',
        algorithms: ['FIFO', 'LRU', 'Optimal', 'LFU', 'Clock'],
        desc: 'Watch page loads and evictions animate across frame slots in real-time.',
    },
    {
        to: '/disk', icon: HardDrive, title: 'DISK I/O CTRL',
        subtitle: '6 algorithms', color: 'var(--violet)',
        algorithms: ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'],
        desc: 'See the disk head traverse cylinders and compare total seek distances.',
    },
    {
        to: '/deadlock', icon: AlertTriangle, title: 'DEADLOCK ENGINE',
        subtitle: "Banker's Algo", color: 'var(--rose)',
        algorithms: ["Safety Check", "Resource Request", "Need Matrix", "Safe Sequence"],
        desc: "Run Banker's Algorithm, request resources, and prove system safety step by step.",
    },
];
const FEATURES = [
    { icon: Zap, text: 'Step-through mode — tick by tick' },
    { icon: Activity, text: 'Algorithm Duel — side-by-side compare' },
    { icon: Clock, text: 'Simulation history with replay' },
    { icon: Layers, text: 'C code viewer on every algorithm' },
];
export default function Dashboard() {
    const navigate = useNavigate();
    const history = useStore(s => s.history);
    const setHistory = useStore(s => s.setHistory);
    const [stats, setStats] = useState({ total: 0, cpu: 0, memory: 0, disk: 0, deadlock: 0 });
    useEffect(() => {
        api.getHistory(20).then((h) => {
            setHistory(h);
            setStats({
                total: h.length,
                cpu: h.filter((x) => x.category === 'cpu').length,
                memory: h.filter((x) => x.category === 'memory').length,
                disk: h.filter((x) => x.category === 'disk').length,
                deadlock: h.filter((x) => x.category === 'deadlock').length,
            });
        }).catch(() => { });
    }, []);
    return (_jsxs("div", { className: "max-w-6xl mx-auto space-y-8", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "scan-line-overlay rounded-xl p-8 relative overflow-hidden", style: { background: 'var(--panel)', border: '1px solid var(--border)' }, children: [_jsx("div", { className: "absolute inset-0 opacity-30 grid-bg pointer-events-none" }), _jsxs("div", { className: "relative z-10", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "badge badge-cyan mb-4", children: [_jsx("span", { className: "pulse-dot w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" }), "SYSTEM ONLINE"] }), _jsx("h1", { className: "font-display text-4xl font-bold tracking-wider mb-2", style: { color: 'var(--cyan)' }, children: "KRONOS" }), _jsx("p", { className: "text-lg font-display tracking-wide mb-1", style: { color: 'var(--text-1)' }, children: "Operating System Internals Visualizer" }), _jsx("p", { className: "text-sm font-mono", style: { color: 'var(--text-2)' }, children: "Real-time simulation of CPU scheduling \u00B7 Memory management \u00B7 Disk I/O \u00B7 Deadlock detection" })] }), _jsx("div", { className: "hidden md:grid grid-cols-2 gap-3", children: [
                                            { label: 'ALGORITHMS', value: '18+' },
                                            { label: 'CATEGORIES', value: '4' },
                                            { label: 'SIMULATIONS', value: stats.total },
                                            { label: 'C LISTINGS', value: '14' },
                                        ].map((s, i) => (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.2 + i * 0.08 }, className: "bracket p-4 text-center rounded", style: { background: 'rgba(0,229,255,0.05)', minWidth: 90 }, children: [_jsx("div", { className: "font-display text-2xl font-bold", style: { color: 'var(--cyan)' }, children: s.value }), _jsx("div", { className: "text-xs font-mono mt-0.5", style: { color: 'var(--text-3)' }, children: s.label })] }, s.label))) })] }), _jsx("div", { className: "flex flex-wrap gap-3 mt-6", children: FEATURES.map(({ icon: Icon, text }, i) => (_jsxs(motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.3 + i * 0.07 }, className: "flex items-center gap-2 px-3 py-1.5 rounded-md", style: { background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }, children: [_jsx(Icon, { size: 12, style: { color: 'var(--cyan)' } }), _jsx("span", { className: "text-xs font-mono", style: { color: 'var(--text-2)' }, children: text })] }, text))) })] })] }), _jsxs("div", { children: [_jsx("h2", { className: "font-display text-sm tracking-widest mb-4", style: { color: 'var(--text-3)' }, children: "SIMULATION MODULES" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: MODULES.map(({ to, icon: Icon, title, subtitle, color, algorithms, desc }, i) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + i * 0.08 }, whileHover: { y: -2, transition: { duration: 0.15 } }, onClick: () => navigate(to), className: "kronos-card cursor-pointer group relative overflow-hidden", style: { border: `1px solid var(--border)`, transition: 'border-color 0.2s, box-shadow 0.2s' }, onMouseEnter: e => {
                                e.currentTarget.style.borderColor = color;
                                e.currentTarget.style.boxShadow = `0 0 20px ${color}22`;
                            }, onMouseLeave: e => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }, children: [_jsx("div", { className: "absolute top-0 left-0 right-0 h-0.5", style: { background: color, opacity: 0.6 } }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "p-2.5 rounded-lg flex-shrink-0", style: { background: `${color}18`, border: `1px solid ${color}40` }, children: _jsx(Icon, { size: 22, style: { color } }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-display font-bold text-sm tracking-wider", style: { color: 'var(--text-1)' }, children: title }), _jsx("span", { className: "badge", style: {
                                                                background: `${color}18`, color, border: `1px solid ${color}40`,
                                                                fontSize: '0.6rem',
                                                            }, children: subtitle })] }), _jsx("p", { className: "text-xs font-mono mb-3", style: { color: 'var(--text-2)', lineHeight: 1.6 }, children: desc }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: algorithms.map(a => (_jsx("span", { className: "text-xs font-mono px-2 py-0.5 rounded", style: { background: 'var(--dim)', color: 'var(--text-3)', border: '1px solid var(--border)' }, children: a }, a))) })] })] }), _jsx("div", { className: "mt-4 flex justify-end", children: _jsx("span", { className: "text-xs font-mono tracking-wider", style: { color }, children: "LAUNCH SIMULATOR \u2192" }) })] }, to))) })] }), history.length > 0 && (_jsxs("div", { children: [_jsx("h2", { className: "font-display text-sm tracking-widest mb-4", style: { color: 'var(--text-3)' }, children: "RECENT SIMULATIONS" }), _jsx("div", { className: "kronos-card overflow-x-auto", children: _jsxs("table", { className: "w-full text-xs font-mono", style: { borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsx("tr", { style: { borderBottom: '1px solid var(--border)' }, children: ['#', 'Category', 'Algorithm', 'Time'].map(h => (_jsx("th", { className: "text-left pb-2 pr-6", style: { color: 'var(--text-3)' }, children: h }, h))) }) }), _jsx("tbody", { children: history.slice(0, 8).map((item, i) => (_jsxs(motion.tr, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: i * 0.04 }, onClick: () => navigate('/history'), className: "cursor-pointer", style: { borderBottom: '1px solid rgba(30,45,71,0.4)' }, onMouseEnter: e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)'), onMouseLeave: e => (e.currentTarget.style.background = 'transparent'), children: [_jsx("td", { className: "py-2 pr-6", style: { color: 'var(--text-3)' }, children: item.id }), _jsx("td", { className: "py-2 pr-6", children: _jsx("span", { className: `badge badge-${item.category === 'cpu' ? 'amber' :
                                                        item.category === 'memory' ? 'emerald' :
                                                            item.category === 'disk' ? 'violet' : 'rose'}`, children: item.category.toUpperCase() }) }), _jsx("td", { className: "py-2 pr-6", style: { color: 'var(--text-1)' }, children: item.algorithm }), _jsx("td", { className: "py-2 pr-6", style: { color: 'var(--text-3)' }, children: new Date(item.created_at).toLocaleTimeString() })] }, item.id))) })] }) })] }))] }));
}
