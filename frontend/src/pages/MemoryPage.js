import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Shuffle, Sword } from 'lucide-react';
import { api } from '../lib/api';
import MemoryGrid from '../components/MemoryGrid';
import CCodeViewer from '../components/CCodeViewer';
import PlaybackControls from '../components/PlaybackControls';
import StatCard from '../components/StatCard';
import { randInt, fmt2 } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
const ALGORITHMS = [
    { id: 'fifo', label: 'FIFO', desc: 'First In First Out' },
    { id: 'lru', label: 'LRU', desc: 'Least Recently Used' },
    { id: 'optimal', label: 'Optimal', desc: "Bélády's Algorithm" },
    { id: 'lfu', label: 'LFU', desc: 'Least Frequently Used' },
    { id: 'clock', label: 'Clock', desc: 'Second Chance (Clock)' },
];
function randomPages(n = 16) {
    return Array.from({ length: n }, () => randInt(1, 7));
}
export default function MemoryPage() {
    const [algorithm, setAlgorithm] = useState('fifo');
    const [frames, setFrames] = useState(3);
    const [pagesStr, setPagesStr] = useState(randomPages().join(' '));
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('grid');
    const [duelAlgB, setDuelAlgB] = useState('lru');
    const [duelResults, setDuelResults] = useState(null);
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(400);
    const timerRef = useRef(null);
    const totalSteps = result?.states.length ?? 0;
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
    const parsePages = () => pagesStr.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && n > 0);
    const handleRun = async () => {
        const pages = parsePages();
        if (!pages.length)
            return setError('Enter at least one page number');
        setLoading(true);
        setError(null);
        try {
            const r = await api.simulateMemory({ algorithm, pages, frames });
            setResult(r);
            setStep(0);
            setPlaying(false);
            setTab('grid');
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDuel = async () => {
        const pages = parsePages();
        if (!pages.length)
            return;
        setLoading(true);
        setError(null);
        try {
            const r = await api.simulateDuel({
                category: 'memory', algorithm_a: algorithm, algorithm_b: duelAlgB,
                input_data: { pages, frames }
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
    return (_jsx("div", { className: "max-w-7xl mx-auto space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "kronos-card", children: [_jsx("div", { className: "text-xs font-mono mb-3", style: { color: 'var(--text-3)' }, children: "ALGORITHM" }), _jsx("div", { className: "space-y-1", children: ALGORITHMS.map(a => (_jsxs("button", { onClick: () => setAlgorithm(a.id), className: "w-full text-left px-3 py-2 rounded-md transition-all", style: {
                                            background: algorithm === a.id ? 'rgba(0,230,118,0.1)' : 'transparent',
                                            border: `1px solid ${algorithm === a.id ? 'rgba(0,230,118,0.4)' : 'transparent'}`,
                                        }, children: [_jsx("div", { className: "font-display text-sm font-bold", style: { color: algorithm === a.id ? 'var(--emerald)' : 'var(--text-1)' }, children: a.label }), _jsx("div", { className: "text-xs font-mono", style: { color: 'var(--text-3)' }, children: a.desc })] }, a.id))) })] }), _jsxs("div", { className: "kronos-card space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-mono block mb-1", style: { color: 'var(--text-3)' }, children: "FRAME COUNT" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: 1, max: 8, value: frames, onChange: e => setFrames(parseInt(e.target.value)), className: "flex-1", style: { accentColor: 'var(--emerald)' } }), _jsx("span", { className: "font-mono font-bold text-lg w-6 text-center", style: { color: 'var(--emerald)' }, children: frames })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("label", { className: "text-xs font-mono", style: { color: 'var(--text-3)' }, children: "PAGE REFERENCE STRING" }), _jsxs("button", { className: "btn btn-ghost", style: { padding: '2px 8px', fontSize: '0.65rem' }, onClick: () => { setPagesStr(randomPages().join(' ')); setResult(null); }, children: [_jsx(Shuffle, { size: 10 }), " RANDOM"] })] }), _jsx("textarea", { value: pagesStr, onChange: e => setPagesStr(e.target.value), className: "kronos-input", rows: 3, placeholder: "e.g. 1 2 3 4 1 2 5 1 2 3 4 5", style: { resize: 'vertical' } }), _jsx("p", { className: "text-xs font-mono mt-1", style: { color: 'var(--text-3)' }, children: "Space or comma separated integers" })] })] }), _jsxs("div", { className: "kronos-card", children: [_jsx("div", { className: "text-xs font-mono mb-2", style: { color: 'var(--text-3)' }, children: "\u2694 ALGORITHM DUEL" }), _jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("span", { className: "badge badge-emerald", children: ALGORITHMS.find(a => a.id === algorithm)?.label }), _jsx("span", { style: { color: 'var(--text-3)' }, children: "vs" }), _jsx("select", { value: duelAlgB, onChange: e => setDuelAlgB(e.target.value), className: "kronos-input flex-1", style: { padding: '4px 8px' }, children: ALGORITHMS.filter(a => a.id !== algorithm).map(a => (_jsx("option", { value: a.id, children: a.label }, a.id))) })] }), _jsxs("button", { className: "btn btn-amber w-full", onClick: handleDuel, disabled: loading, children: [_jsx(Sword, { size: 13 }), " DUEL"] })] }), _jsx("button", { className: "btn btn-cyan w-full", style: { padding: '10px' }, onClick: handleRun, disabled: loading, children: loading ? '⟳ SIMULATING...' : _jsxs(_Fragment, { children: [_jsx(Play, { size: 14 }), " RUN SIMULATION"] }) }), error && (_jsxs("div", { className: "text-xs font-mono p-3 rounded", style: { background: 'rgba(255,71,87,0.1)', color: 'var(--rose)', border: '1px solid rgba(255,71,87,0.3)' }, children: ["\u26A0 ", error] }))] }), _jsxs("div", { className: "space-y-4", children: [result && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [_jsx(StatCard, { label: "PAGE FAULTS", value: result.fault_count, color: "var(--rose)", delay: 0, small: true }), _jsx(StatCard, { label: "PAGE HITS", value: result.hit_count, color: "var(--emerald)", delay: 0.05, small: true }), _jsx(StatCard, { label: "FAULT RATE", value: fmt2(result.fault_rate), unit: "%", color: "var(--amber)", delay: 0.1, small: true }), _jsx(StatCard, { label: "HIT RATE", value: fmt2(result.hit_rate), unit: "%", color: "var(--cyan)", delay: 0.15, small: true })] }), _jsx("div", { className: "flex gap-1", children: [{ id: 'grid', label: 'FRAME ANIMATION' }, { id: 'code', label: 'C CODE' }, { id: 'duel', label: 'DUEL RESULTS' }].map(t => (_jsx("button", { onClick: () => setTab(t.id), className: "px-4 py-2 text-xs font-mono tracking-wider", style: {
                                            background: 'transparent', border: 'none', cursor: 'pointer',
                                            borderBottom: `2px solid ${tab === t.id ? 'var(--emerald)' : 'transparent'}`,
                                            color: tab === t.id ? 'var(--emerald)' : 'var(--text-3)',
                                        }, children: t.label }, t.id))) }), _jsxs(AnimatePresence, { mode: "wait", children: [tab === 'grid' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "space-y-4", children: [_jsx(PlaybackControls, { current: step, total: totalSteps, isPlaying: playing, speed: speed, onPlay: () => { if (step >= totalSteps - 1)
                                                        setStep(0); setPlaying(true); }, onPause: () => setPlaying(false), onPrev: () => { setPlaying(false); setStep(s => Math.max(0, s - 1)); }, onNext: () => { setPlaying(false); setStep(s => Math.min(totalSteps - 1, s + 1)); }, onFirst: () => { setPlaying(false); setStep(0); }, onLast: () => { setPlaying(false); setStep(totalSteps - 1); }, onSpeedChange: setSpeed }), _jsx(MemoryGrid, { states: result.states, currentIndex: step, frameCount: result.frames })] }, "grid")), tab === 'code' && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: _jsx(CCodeViewer, { algorithm: algorithm, label: ALGORITHMS.find(a => a.id === algorithm)?.label }) }, "code")), tab === 'duel' && duelResults && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "space-y-4", children: [_jsxs("div", { className: "kronos-card text-center", children: [_jsx("div", { className: "text-xs font-mono mb-2", style: { color: 'var(--text-3)' }, children: "WINNER \u2014 FEWER PAGE FAULTS" }), _jsxs("div", { className: "font-display text-2xl font-bold", style: { color: 'var(--emerald)' }, children: ["\uD83C\uDFC6 ", duelResults.winner.toUpperCase()] })] }), _jsx("div", { className: "kronos-card", children: _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(BarChart, { data: [
                                                                { name: 'Page Faults', [duelResults.algorithm_a]: duelResults.comparison.fault_count?.[duelResults.algorithm_a], [duelResults.algorithm_b]: duelResults.comparison.fault_count?.[duelResults.algorithm_b] },
                                                                { name: 'Hit Rate %', [duelResults.algorithm_a]: duelResults.comparison.hit_rate?.[duelResults.algorithm_a], [duelResults.algorithm_b]: duelResults.comparison.hit_rate?.[duelResults.algorithm_b] },
                                                            ], children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name", tick: { fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' } }), _jsx(YAxis, { tick: { fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' } }), _jsx(Tooltip, { contentStyle: { background: 'var(--panel)', border: '1px solid var(--border)', fontFamily: 'Space Mono', fontSize: 11 } }), _jsx(Bar, { dataKey: duelResults.algorithm_a, fill: "var(--emerald)", opacity: 0.8 }), _jsx(Bar, { dataKey: duelResults.algorithm_b, fill: "var(--violet)", opacity: 0.8 })] }) }) })] }, "duel"))] })] })), !result && !loading && (_jsxs("div", { className: "flex flex-col items-center justify-center py-24 text-center", children: [_jsx("div", { className: "text-6xl mb-4 opacity-20", children: "\uD83D\uDDC4" }), _jsx("p", { className: "font-mono text-sm", style: { color: 'var(--text-3)' }, children: "Configure frames and page string, then run" })] }))] })] }) }));
}
