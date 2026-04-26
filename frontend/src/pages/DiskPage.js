import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Shuffle, Sword } from 'lucide-react';
import { api } from '../lib/api';
import DiskSeekChart from '../components/DiskSeekChart';
import CCodeViewer from '../components/CCodeViewer';
import PlaybackControls from '../components/PlaybackControls';
import StatCard from '../components/StatCard';
import { randomArray, fmt2 } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
const ALGORITHMS = [
    { id: 'fcfs', label: 'FCFS', desc: 'First Come First Served' },
    { id: 'sstf', label: 'SSTF', desc: 'Shortest Seek Time First' },
    { id: 'scan', label: 'SCAN', desc: 'Elevator Algorithm' },
    { id: 'cscan', label: 'C-SCAN', desc: 'Circular SCAN' },
    { id: 'look', label: 'LOOK', desc: 'LOOK Algorithm' },
    { id: 'clook', label: 'C-LOOK', desc: 'Circular LOOK' },
];
export default function DiskPage() {
    const [algorithm, setAlgorithm] = useState('sstf');
    const [reqStr, setReqStr] = useState(randomArray(10, 0, 199).join(' '));
    const [head, setHead] = useState(53);
    const [diskSize, setDiskSize] = useState(200);
    const [direction, setDirection] = useState('right');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('chart');
    const [duelAlgB, setDuelAlgB] = useState('scan');
    const [duelResults, setDuelResults] = useState(null);
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(400);
    const timerRef = useRef(null);
    const totalSteps = result?.seek_sequence.length ?? 0;
    useEffect(() => {
        if (playing && step < totalSteps - 1) {
            timerRef.current = setInterval(() => {
                setStep(s => {
                    if (s >= totalSteps - 1) {
                        setPlaying(false);
                        return s;
                    }
                    return s + 1;
                });
            }, speed);
        }
        return () => { if (timerRef.current)
            clearInterval(timerRef.current); };
    }, [playing, speed, totalSteps]);
    const parseReqs = () => reqStr.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && n >= 0 && n < diskSize);
    const handleRun = async () => {
        const requests = parseReqs();
        if (!requests.length)
            return setError('Enter at least one cylinder request');
        setLoading(true);
        setError(null);
        try {
            const r = await api.simulateDisk({ algorithm, requests, initial_head: head, disk_size: diskSize, direction });
            setResult(r);
            setStep(0);
            setPlaying(false);
            setTab('chart');
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDuel = async () => {
        const requests = parseReqs();
        if (!requests.length)
            return;
        setLoading(true);
        setError(null);
        try {
            const r = await api.simulateDuel({
                category: 'disk', algorithm_a: algorithm, algorithm_b: duelAlgB,
                input_data: { requests, initial_head: head, disk_size: diskSize }
            });
            setDuelResults(r);
            setTab('duel');
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    };
    const needsDirection = ['scan', 'look'].includes(algorithm);
    return (_jsx("div", { className: "max-w-7xl mx-auto space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "kronos-card", children: [_jsx("div", { className: "text-xs font-mono mb-3", style: { color: 'var(--text-3)' }, children: "ALGORITHM" }), _jsx("div", { className: "space-y-1", children: ALGORITHMS.map(a => (_jsxs("button", { onClick: () => setAlgorithm(a.id), className: "w-full text-left px-3 py-2 rounded-md transition-all", style: {
                                            background: algorithm === a.id ? 'rgba(124,58,237,0.1)' : 'transparent',
                                            border: `1px solid ${algorithm === a.id ? 'rgba(124,58,237,0.4)' : 'transparent'}`,
                                        }, children: [_jsx("div", { className: "font-display text-sm font-bold", style: { color: algorithm === a.id ? '#a78bfa' : 'var(--text-1)' }, children: a.label }), _jsx("div", { className: "text-xs font-mono", style: { color: 'var(--text-3)' }, children: a.desc })] }, a.id))) })] }), _jsxs("div", { className: "kronos-card space-y-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("label", { className: "text-xs font-mono", style: { color: 'var(--text-3)' }, children: "CYLINDER REQUESTS" }), _jsxs("button", { className: "btn btn-ghost", style: { padding: '2px 8px', fontSize: '0.65rem' }, onClick: () => { setReqStr(randomArray(10, 0, diskSize - 1).join(' ')); setResult(null); }, children: [_jsx(Shuffle, { size: 10 }), " RANDOM"] })] }), _jsx("textarea", { value: reqStr, onChange: e => setReqStr(e.target.value), className: "kronos-input", rows: 2, placeholder: "e.g. 98 183 37 122 14 124 65 67", style: { resize: 'none' } })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-mono block mb-1", style: { color: 'var(--text-3)' }, children: "INITIAL HEAD" }), _jsx("input", { type: "number", min: 0, max: diskSize - 1, value: head, onChange: e => setHead(parseInt(e.target.value) || 0), className: "kronos-input" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-mono block mb-1", style: { color: 'var(--text-3)' }, children: "DISK SIZE" }), _jsx("input", { type: "number", min: 50, max: 500, value: diskSize, onChange: e => setDiskSize(parseInt(e.target.value) || 200), className: "kronos-input" })] })] }), needsDirection && (_jsxs("div", { children: [_jsx("label", { className: "text-xs font-mono block mb-1", style: { color: 'var(--text-3)' }, children: "INITIAL DIRECTION" }), _jsx("div", { className: "flex gap-2", children: ['right', 'left'].map(d => (_jsx("button", { onClick: () => setDirection(d), className: "btn flex-1", style: { padding: '6px',
                                                    background: direction === d ? 'rgba(124,58,237,0.15)' : 'transparent',
                                                    border: `1px solid ${direction === d ? '#a78bfa' : 'var(--border)'}`,
                                                    color: direction === d ? '#a78bfa' : 'var(--text-3)',
                                                    fontSize: '0.75rem' }, children: d === 'right' ? '→ RIGHT' : '← LEFT' }, d))) })] }))] }), _jsxs("div", { className: "kronos-card", children: [_jsx("div", { className: "text-xs font-mono mb-2", style: { color: 'var(--text-3)' }, children: "\u2694 ALGORITHM DUEL" }), _jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("span", { className: "badge badge-violet", children: ALGORITHMS.find(a => a.id === algorithm)?.label }), _jsx("span", { style: { color: 'var(--text-3)' }, children: "vs" }), _jsx("select", { value: duelAlgB, onChange: e => setDuelAlgB(e.target.value), className: "kronos-input flex-1", style: { padding: '4px 8px' }, children: ALGORITHMS.filter(a => a.id !== algorithm).map(a => (_jsx("option", { value: a.id, children: a.label }, a.id))) })] }), _jsxs("button", { className: "btn btn-amber w-full", onClick: handleDuel, disabled: loading, children: [_jsx(Sword, { size: 13 }), " DUEL"] })] }), _jsx("button", { className: "btn btn-cyan w-full", style: { padding: '10px' }, onClick: handleRun, disabled: loading, children: loading ? '⟳ SIMULATING...' : _jsxs(_Fragment, { children: [_jsx(Play, { size: 14 }), " RUN SIMULATION"] }) }), error && (_jsxs("div", { className: "text-xs font-mono p-3 rounded", style: { background: 'rgba(255,71,87,0.1)', color: 'var(--rose)', border: '1px solid rgba(255,71,87,0.3)' }, children: ["\u26A0 ", error] }))] }), _jsxs("div", { className: "space-y-4", children: [result && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [_jsx(StatCard, { label: "TOTAL SEEK DIST", value: result.total_seek_distance, unit: "cyl", color: "var(--violet)", delay: 0, small: true }), _jsx(StatCard, { label: "AVG SEEK TIME", value: fmt2(result.avg_seek_time), unit: "cyl", color: "var(--cyan)", delay: 0.05, small: true }), _jsx(StatCard, { label: "REQUESTS", value: result.seek_sequence.length - 1, color: "var(--amber)", delay: 0.1, small: true })] }), _jsx("div", { className: "flex gap-1", children: [{ id: 'chart', label: 'SEEK PATH' }, { id: 'code', label: 'C CODE' }, { id: 'duel', label: 'DUEL' }].map(t => (_jsx("button", { onClick: () => setTab(t.id), className: "px-4 py-2 text-xs font-mono tracking-wider", style: { background: 'transparent', border: 'none', cursor: 'pointer',
                                            borderBottom: `2px solid ${tab === t.id ? '#a78bfa' : 'transparent'}`,
                                            color: tab === t.id ? '#a78bfa' : 'var(--text-3)' }, children: t.label }, t.id))) }), _jsxs(AnimatePresence, { mode: "wait", children: [tab === 'chart' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "space-y-4", children: [_jsx(PlaybackControls, { current: step, total: totalSteps, isPlaying: playing, speed: speed, onPlay: () => { if (step >= totalSteps - 1)
                                                        setStep(0); setPlaying(true); }, onPause: () => setPlaying(false), onPrev: () => { setPlaying(false); setStep(s => Math.max(0, s - 1)); }, onNext: () => { setPlaying(false); setStep(s => Math.min(totalSteps - 1, s + 1)); }, onFirst: () => { setPlaying(false); setStep(0); }, onLast: () => { setPlaying(false); setStep(totalSteps - 1); }, onSpeedChange: setSpeed }), _jsx(DiskSeekChart, { result: result, currentStep: step })] }, "chart")), tab === 'code' && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: _jsx(CCodeViewer, { algorithm: algorithm === 'sstf' ? 'sstf' : 'scan', label: ALGORITHMS.find(a => a.id === algorithm)?.label }) }, "code")), tab === 'duel' && duelResults && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "space-y-4", children: [_jsxs("div", { className: "kronos-card text-center", children: [_jsx("div", { className: "text-xs font-mono mb-2", style: { color: 'var(--text-3)' }, children: "WINNER \u2014 LESS SEEK DISTANCE" }), _jsxs("div", { className: "font-display text-2xl font-bold", style: { color: 'var(--emerald)' }, children: ["\uD83C\uDFC6 ", duelResults.winner.toUpperCase()] })] }), _jsx("div", { className: "kronos-card", children: _jsx(ResponsiveContainer, { width: "100%", height: 180, children: _jsxs(BarChart, { data: [
                                                                { name: 'Total Seek', [duelResults.algorithm_a]: duelResults.comparison.total_seek_distance?.[duelResults.algorithm_a], [duelResults.algorithm_b]: duelResults.comparison.total_seek_distance?.[duelResults.algorithm_b] },
                                                            ], children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name", tick: { fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' } }), _jsx(YAxis, { tick: { fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' } }), _jsx(Tooltip, { contentStyle: { background: 'var(--panel)', border: '1px solid var(--border)', fontFamily: 'Space Mono', fontSize: 11 } }), _jsx(Bar, { dataKey: duelResults.algorithm_a, fill: "#a78bfa", opacity: 0.8 }), _jsx(Bar, { dataKey: duelResults.algorithm_b, fill: "var(--amber)", opacity: 0.8 })] }) }) })] }, "duel"))] })] })), !result && !loading && (_jsxs("div", { className: "flex flex-col items-center justify-center py-24 text-center", children: [_jsx("div", { className: "text-6xl mb-4 opacity-20", children: "\uD83D\uDCBF" }), _jsx("p", { className: "font-mono text-sm", style: { color: 'var(--text-3)' }, children: "Enter cylinder requests and run a simulation" })] }))] })] }) }));
}
