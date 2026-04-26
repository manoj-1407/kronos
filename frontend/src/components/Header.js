import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Wifi, WifiOff } from 'lucide-react';
import { useStore } from '../store';
import { useEffect, useState } from 'react';
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const PAGE_META = {
    '/': { title: 'MISSION CONTROL', subtitle: 'OS Internals Overview' },
    '/cpu': { title: 'CPU SCHEDULER', subtitle: 'Process Scheduling Algorithms' },
    '/memory': { title: 'MEMORY UNIT', subtitle: 'Page Replacement Algorithms' },
    '/disk': { title: 'DISK I/O CONTROLLER', subtitle: 'Disk Scheduling Algorithms' },
    '/deadlock': { title: 'DEADLOCK ANALYZER', subtitle: "Banker's Algorithm & Detection" },
    '/history': { title: 'SIMULATION LOG', subtitle: 'Past Simulations & Replay' },
};
export default function Header() {
    const location = useLocation();
    const theme = useStore(s => s.theme);
    const toggleTheme = useStore(s => s.toggleTheme);
    const [apiOk, setApiOk] = useState(null);
    const [clock, setClock] = useState(new Date());
    const meta = PAGE_META[location.pathname] ?? { title: 'KRONOS', subtitle: '' };
    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
                setApiOk(res.ok);
            }
            catch {
                setApiOk(false);
            }
        };
        check();
        const id = setInterval(check, 10000);
        return () => clearInterval(id);
    }, []);
    useEffect(() => {
        const id = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return (_jsxs("header", { className: "h-14 flex items-center justify-between px-6 flex-shrink-0", style: { background: 'var(--panel)', borderBottom: '1px solid var(--border)' }, children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "font-display font-bold text-sm tracking-widest", style: { color: 'var(--cyan)' }, children: meta.title }), _jsx("span", { className: "text-xs tracking-wide", style: { color: 'var(--text-3)' }, children: meta.subtitle })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "font-mono text-xs tabular-nums", style: { color: 'var(--text-3)' }, children: clock.toLocaleTimeString('en-US', { hour12: false }) }), _jsx("div", { className: "flex items-center gap-1.5", children: apiOk === null ? (_jsx("div", { className: "w-2 h-2 rounded-full pulse-dot", style: { background: 'var(--text-3)' } })) : apiOk ? (_jsxs(_Fragment, { children: [_jsx(Wifi, { size: 13, style: { color: 'var(--emerald)' } }), _jsx("span", { className: "text-xs font-mono", style: { color: 'var(--emerald)' }, children: "API ONLINE" })] })) : (_jsxs(_Fragment, { children: [_jsx(WifiOff, { size: 13, style: { color: 'var(--rose)' } }), _jsx("span", { className: "text-xs font-mono", style: { color: 'var(--rose)' }, children: "API OFFLINE" })] })) }), _jsx("button", { onClick: toggleTheme, className: "p-1.5 rounded-md btn-ghost", style: { border: '1px solid var(--border)' }, title: "Toggle theme", children: theme === 'dark'
                            ? _jsx(Sun, { size: 15, style: { color: 'var(--amber)' } })
                            : _jsx(Moon, { size: 15, style: { color: 'var(--violet)' } }) })] })] }));
}
