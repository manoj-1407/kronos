import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Minus, ShieldCheck, ShieldAlert } from 'lucide-react';
import { api } from '../lib/api';
import CCodeViewer from '../components/CCodeViewer';
import PlaybackControls from '../components/PlaybackControls';
const DEFAULT_ALLOC = [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]];
const DEFAULT_MAX = [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]];
const DEFAULT_AVAIL = [3, 3, 2];
function MatrixInput({ label, matrix, onChange, color }) {
    const n = matrix.length, m = matrix[0]?.length ?? 0;
    return (_jsxs("div", { children: [_jsx("div", { className: "text-xs font-mono mb-2", style: { color: 'var(--text-3)' }, children: label }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "text-xs font-mono pr-2 pb-1", style: { color: 'var(--text-3)' }, children: "P\\R" }), Array.from({ length: m }, (_, j) => (_jsxs("th", { className: "text-xs font-mono w-12 pb-1 text-center", style: { color }, children: ["R", j] }, j)))] }) }), _jsx("tbody", { children: matrix.map((row, i) => (_jsxs("tr", { children: [_jsxs("td", { className: "text-xs font-mono pr-2 py-0.5", style: { color: 'var(--text-3)' }, children: ["P", i] }), row.map((val, j) => (_jsx("td", { className: "py-0.5 px-0.5", children: _jsx("input", { type: "number", min: 0, max: 99, value: val, onChange: e => {
                                                const m2 = matrix.map((r, ri) => r.map((v, ci) => ri === i && ci === j ? parseInt(e.target.value) || 0 : v));
                                                onChange(m2);
                                            }, className: "kronos-input text-center", style: { width: 44, padding: '3px', fontSize: '0.75rem', color } }) }, j)))] }, i))) })] }) })] }));
}
export default function DeadlockPage() {
    const [processes, setProcesses] = useState(5);
    const [resources, setResources] = useState(3);
    const [allocation, setAllocation] = useState(DEFAULT_ALLOC);
    const [maxNeed, setMaxNeed] = useState(DEFAULT_MAX);
    const [available, setAvailable] = useState(DEFAULT_AVAIL);
    const [reqPid, setReqPid] = useState('');
    const [reqVec, setReqVec] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('result');
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(600);
    const timerRef = useRef(null);
    const totalSteps = result?.steps.length ?? 0;
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
    const resizeMatrices = (p, r) => {
        const expand = (m, rows, cols) => Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => m[i]?.[j] ?? 0));
        setAllocation(expand(allocation, p, r));
        setMaxNeed(expand(maxNeed, p, r));
        setAvailable(a => Array.from({ length: r }, (_, j) => a[j] ?? 0));
    };
    const adjustProcesses = (delta) => {
        const p = Math.max(1, Math.min(8, processes + delta));
        setProcesses(p);
        resizeMatrices(p, resources);
    };
    const adjustResources = (delta) => {
        const r = Math.max(1, Math.min(6, resources + delta));
        setResources(r);
        resizeMatrices(processes, r);
    };
    const handleRun = async (withRequest = false) => {
        setLoading(true);
        setError(null);
        try {
            const body = { processes, resources: resources, allocation, max_need: maxNeed, available };
            if (withRequest && reqPid !== '' && reqVec.trim()) {
                body.request_pid = reqPid;
                body.request = reqVec.trim().split(/[\s,]+/).map(Number);
            }
            const r = await api.simulateDeadlock(body);
            setResult(r);
            setStep(0);
            setPlaying(false);
            setTab('result');
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    };
    const currentStep = result?.steps[step];
    // Compute Need matrix for display
    const need = allocation.map((row, i) => row.map((v, j) => (maxNeed[i]?.[j] ?? 0) - v));
    return (_jsx("div", { className: "max-w-7xl mx-auto space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "kronos-card", children: [_jsx("div", { className: "text-xs font-mono mb-3", style: { color: 'var(--text-3)' }, children: "SYSTEM CONFIGURATION" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-mono block mb-2", style: { color: 'var(--text-3)' }, children: "PROCESSES" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "btn btn-ghost", style: { padding: '4px 8px' }, onClick: () => adjustProcesses(-1), children: _jsx(Minus, { size: 12 }) }), _jsx("span", { className: "font-display font-bold text-xl w-6 text-center", style: { color: 'var(--rose)' }, children: processes }), _jsx("button", { className: "btn btn-ghost", style: { padding: '4px 8px' }, onClick: () => adjustProcesses(1), children: _jsx(Plus, { size: 12 }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-mono block mb-2", style: { color: 'var(--text-3)' }, children: "RESOURCE TYPES" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "btn btn-ghost", style: { padding: '4px 8px' }, onClick: () => adjustResources(-1), children: _jsx(Minus, { size: 12 }) }), _jsx("span", { className: "font-display font-bold text-xl w-6 text-center", style: { color: 'var(--cyan)' }, children: resources }), _jsx("button", { className: "btn btn-ghost", style: { padding: '4px 8px' }, onClick: () => adjustResources(1), children: _jsx(Plus, { size: 12 }) })] })] })] })] }), _jsxs("div", { className: "kronos-card", children: [_jsx("div", { className: "text-xs font-mono mb-2", style: { color: 'var(--text-3)' }, children: "AVAILABLE RESOURCES" }), _jsx("div", { className: "flex gap-2", children: available.map((v, j) => (_jsxs("div", { className: "flex flex-col items-center gap-1", children: [_jsxs("span", { className: "text-xs font-mono", style: { color: 'var(--text-3)' }, children: ["R", j] }), _jsx("input", { type: "number", min: 0, max: 99, value: v, onChange: e => {
                                                    const a2 = [...available];
                                                    a2[j] = parseInt(e.target.value) || 0;
                                                    setAvailable(a2);
                                                }, className: "kronos-input text-center", style: { width: 52, padding: '4px', fontSize: '0.85rem', color: 'var(--cyan)' } })] }, j))) })] }), _jsx("div", { className: "kronos-card", children: _jsx(MatrixInput, { label: "ALLOCATION MATRIX", matrix: allocation, onChange: setAllocation, color: "var(--amber)" }) }), _jsx("div", { className: "kronos-card", children: _jsx(MatrixInput, { label: "MAX NEED MATRIX", matrix: maxNeed, onChange: setMaxNeed, color: "var(--rose)" }) }), _jsxs("div", { className: "kronos-card", children: [_jsx("div", { className: "text-xs font-mono mb-2", style: { color: 'var(--text-3)' }, children: "NEED MATRIX (AUTO-COMPUTED: Max \u2212 Alloc)" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "text-xs font-mono pr-2 pb-1", style: { color: 'var(--text-3)' }, children: "P\\R" }), Array.from({ length: resources }, (_, j) => (_jsxs("th", { className: "text-xs font-mono w-12 pb-1 text-center", style: { color: 'var(--emerald)' }, children: ["R", j] }, j)))] }) }), _jsx("tbody", { children: need.map((row, i) => (_jsxs("tr", { children: [_jsxs("td", { className: "text-xs font-mono pr-2", style: { color: 'var(--text-3)' }, children: ["P", i] }), row.map((v, j) => (_jsx("td", { className: "py-0.5 px-0.5", children: _jsx("div", { className: "w-11 h-7 flex items-center justify-center rounded", style: { background: v < 0 ? 'rgba(255,71,87,0.15)' : 'var(--dim)', color: v < 0 ? 'var(--rose)' : 'var(--emerald)', fontFamily: 'Space Mono', fontSize: '0.75rem', fontWeight: 700 }, children: v }) }, j)))] }, i))) })] }) })] }), _jsxs("div", { className: "kronos-card", children: [_jsx("div", { className: "text-xs font-mono mb-3", style: { color: 'var(--text-3)' }, children: "RESOURCE REQUEST (OPTIONAL)" }), _jsxs("div", { className: "grid grid-cols-2 gap-3 mb-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-mono block mb-1", style: { color: 'var(--text-3)' }, children: "PROCESS" }), _jsxs("select", { value: reqPid, onChange: e => setReqPid(e.target.value === '' ? '' : parseInt(e.target.value)), className: "kronos-input", children: [_jsx("option", { value: "", children: "None" }), Array.from({ length: processes }, (_, i) => _jsxs("option", { value: i, children: ["P", i] }, i))] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-mono block mb-1", style: { color: 'var(--text-3)' }, children: "REQUEST VECTOR" }), _jsx("input", { value: reqVec, onChange: e => setReqVec(e.target.value), className: "kronos-input", placeholder: "e.g. 1 0 2" })] })] }), _jsx("button", { className: "btn btn-rose w-full", onClick: () => handleRun(true), disabled: loading || reqPid === '', children: "TEST REQUEST" })] }), _jsx("button", { className: "btn btn-cyan w-full", style: { padding: '10px' }, onClick: () => handleRun(false), disabled: loading, children: loading ? '⟳ RUNNING BANKER\'S...' : _jsxs(_Fragment, { children: [_jsx(Play, { size: 14 }), " RUN SAFETY CHECK"] }) }), error && (_jsxs("div", { className: "text-xs font-mono p-3 rounded", style: { background: 'rgba(255,71,87,0.1)', color: 'var(--rose)', border: '1px solid rgba(255,71,87,0.3)' }, children: ["\u26A0 ", error] }))] }), _jsxs("div", { className: "space-y-4", children: [result && (_jsxs(_Fragment, { children: [_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "kronos-card flex items-center gap-4 p-5", style: { border: `1px solid ${result.is_safe ? 'rgba(0,230,118,0.4)' : 'rgba(255,71,87,0.4)'}`,
                                        background: result.is_safe ? 'rgba(0,230,118,0.05)' : 'rgba(255,71,87,0.05)' }, children: [result.is_safe
                                            ? _jsx(ShieldCheck, { size: 36, style: { color: 'var(--emerald)', flexShrink: 0 } })
                                            : _jsx(ShieldAlert, { size: 36, style: { color: 'var(--rose)', flexShrink: 0 } }), _jsxs("div", { children: [_jsx("div", { className: "font-display font-bold text-xl", style: { color: result.is_safe ? 'var(--emerald)' : 'var(--rose)' }, children: result.is_safe ? 'SAFE STATE' : 'UNSAFE STATE' }), result.request_reason && (_jsx("div", { className: "text-sm font-mono mt-1", style: { color: 'var(--text-2)' }, children: result.request_reason })), result.is_safe && result.safe_sequence.length > 0 && (_jsxs("div", { className: "flex items-center gap-2 mt-2 flex-wrap", children: [_jsx("span", { className: "text-xs font-mono", style: { color: 'var(--text-3)' }, children: "SAFE SEQUENCE:" }), result.safe_sequence.map((pid, i) => (_jsxs("span", { className: "flex items-center gap-1", children: [_jsxs(motion.span, { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, transition: { delay: i * 0.1 }, className: "badge badge-emerald font-display", children: ["P", pid] }), i < result.safe_sequence.length - 1 && _jsx("span", { style: { color: 'var(--text-3)' }, children: "\u2192" })] }, i)))] }))] })] }), _jsx("div", { className: "flex gap-1", children: [{ id: 'result', label: 'STEP-BY-STEP' }, { id: 'code', label: 'C CODE' }].map(t => (_jsx("button", { onClick: () => setTab(t.id), className: "px-4 py-2 text-xs font-mono tracking-wider", style: { background: 'transparent', border: 'none', cursor: 'pointer',
                                            borderBottom: `2px solid ${tab === t.id ? 'var(--rose)' : 'transparent'}`,
                                            color: tab === t.id ? 'var(--rose)' : 'var(--text-3)' }, children: t.label }, t.id))) }), _jsxs(AnimatePresence, { mode: "wait", children: [tab === 'result' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "space-y-4", children: [_jsx(PlaybackControls, { current: step, total: totalSteps, isPlaying: playing, speed: speed, onPlay: () => { if (step >= totalSteps - 1)
                                                        setStep(0); setPlaying(true); }, onPause: () => setPlaying(false), onPrev: () => { setPlaying(false); setStep(s => Math.max(0, s - 1)); }, onNext: () => { setPlaying(false); setStep(s => Math.min(totalSteps - 1, s + 1)); }, onFirst: () => { setPlaying(false); setStep(0); }, onLast: () => { setPlaying(false); setStep(totalSteps - 1); }, onSpeedChange: setSpeed }), currentStep && (_jsx(motion.div, { initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 }, className: "kronos-card", style: {
                                                        border: `1px solid ${currentStep.event === 'grant' ? 'rgba(0,230,118,0.4)' :
                                                            currentStep.event === 'result' && !result.is_safe ? 'rgba(255,71,87,0.4)' :
                                                                'var(--border)'}`
                                                    }, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: "badge badge-cyan mt-0.5", children: String(currentStep.event ?? '').toUpperCase() }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-mono", style: { color: 'var(--text-1)' }, children: String(currentStep.desc ?? '') }), currentStep.work && (_jsxs("p", { className: "text-xs font-mono mt-1", style: { color: 'var(--text-3)' }, children: ["Work: [", String(currentStep.work), "]"] }))] })] }) }, step)), _jsxs("div", { className: "kronos-card", style: { maxHeight: 300, overflowY: 'auto' }, children: [_jsx("div", { className: "text-xs font-mono mb-3", style: { color: 'var(--text-3)' }, children: "FULL EXECUTION LOG" }), _jsx("div", { className: "space-y-1", children: result.steps.map((s, i) => (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: i * 0.02 }, onClick: () => setStep(i), className: "flex items-start gap-2 cursor-pointer p-2 rounded-md", style: {
                                                                    background: i === step ? 'rgba(0,229,255,0.08)' : 'transparent',
                                                                    border: `1px solid ${i === step ? 'rgba(0,229,255,0.3)' : 'transparent'}`,
                                                                }, children: [_jsx("span", { className: "text-xs font-mono w-4 flex-shrink-0", style: { color: 'var(--text-3)' }, children: i + 1 }), _jsx("span", { className: `badge flex-shrink-0 ${s.event === 'grant' ? 'badge-emerald' :
                                                                            s.event === 'check' && s.can ? 'badge-cyan' :
                                                                                s.event === 'check' ? 'badge-rose' :
                                                                                    'badge-amber'}`, style: { fontSize: '0.6rem' }, children: String(s.event ?? '').toUpperCase() }), _jsx("span", { className: "text-xs font-mono", style: { color: 'var(--text-2)' }, children: String(s.desc ?? '') })] }, i))) })] })] }, "result")), tab === 'code' && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: _jsx(CCodeViewer, { algorithm: "bankers", label: "Banker's Algorithm" }) }, "code"))] })] })), !result && !loading && (_jsxs("div", { className: "flex flex-col items-center justify-center py-24 text-center", children: [_jsx("div", { className: "text-6xl mb-4 opacity-20", children: "\uD83D\uDD12" }), _jsx("p", { className: "font-mono text-sm", style: { color: 'var(--text-3)' }, children: "Configure allocation and max matrices, then run safety check" })] }))] })] }) }));
}
