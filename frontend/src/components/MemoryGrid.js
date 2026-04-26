import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
export default function MemoryGrid({ states, currentIndex, frameCount }) {
    const [hover, setHover] = useState(null);
    if (!states.length)
        return null;
    // Show states from 0..currentIndex
    const visible = states.slice(0, currentIndex + 1);
    const current = states[currentIndex];
    // Summary stats up to current
    const faultsSoFar = visible.filter(s => s.fault).length;
    const hitsSoFar = visible.length - faultsSoFar;
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "kronos-card", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("span", { className: "text-xs font-mono", style: { color: 'var(--text-3)' }, children: ["FRAME STATE \u2014 STEP ", currentIndex + 1, "/", states.length] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("span", { className: "badge badge-rose", children: [_jsx("span", { className: "pulse-dot w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" }), faultsSoFar, " FAULTS"] }), _jsxs("span", { className: "badge badge-emerald", children: [hitsSoFar, " HITS"] })] })] }), _jsxs("div", { className: "flex gap-3 items-end", children: [Array.from({ length: frameCount }, (_, fi) => {
                                const page = current?.frames[fi] ?? null;
                                const isHit = current?.hit_index === fi;
                                const wasEvicted = current?.evicted !== null && states[Math.max(0, currentIndex - 1)]?.frames[fi] === current?.evicted;
                                return (_jsxs(motion.div, { layout: true, className: "flex flex-col items-center gap-2", children: [_jsxs("span", { className: "text-xs font-mono", style: { color: 'var(--text-3)' }, children: ["F", fi] }), _jsx(motion.div, { animate: isHit ? { scale: [1, 1.08, 1], borderColor: 'var(--emerald)' } :
                                                wasEvicted ? { scale: [1, 0.92, 1], borderColor: 'var(--rose)' } :
                                                    current?.fault && page !== null ? { scale: [0.8, 1], opacity: [0, 1] } : {}, transition: { duration: 0.3 }, style: {
                                                width: 64, height: 64,
                                                background: page !== null ? 'rgba(0,229,255,0.08)' : 'var(--dim)',
                                                border: `1px solid ${isHit ? 'var(--emerald)' :
                                                    wasEvicted ? 'var(--rose)' :
                                                        page !== null ? 'var(--border)' : 'rgba(30,45,71,0.3)'}`,
                                                borderRadius: 6,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }, children: _jsx(AnimatePresence, { mode: "wait", children: page !== null ? (_jsx(motion.span, { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 }, className: "font-mono font-bold text-lg", style: { color: isHit ? 'var(--emerald)' : 'var(--cyan)' }, children: page }, page)) : (_jsx("span", { className: "font-mono text-xs", style: { color: 'var(--text-3)' }, children: "\u2014" })) }) })] }, fi));
                            }), current && (_jsxs("div", { className: "ml-4 flex flex-col justify-center", children: [_jsx("div", { className: "text-xs font-mono mb-1", style: { color: 'var(--text-3)' }, children: "INCOMING" }), _jsx("div", { className: "w-16 h-16 flex items-center justify-center rounded-md font-mono font-bold text-xl", style: {
                                            background: current.fault ? 'rgba(255,71,87,0.15)' : 'rgba(0,230,118,0.1)',
                                            border: `2px solid ${current.fault ? 'var(--rose)' : 'var(--emerald)'}`,
                                            color: current.fault ? 'var(--rose)' : 'var(--emerald)',
                                        }, children: current.page }), _jsx("div", { className: "text-xs font-mono mt-1 text-center", style: { color: current.fault ? 'var(--rose)' : 'var(--emerald)' }, children: current.fault ? 'FAULT' : 'HIT' })] }))] })] }), _jsxs("div", { className: "kronos-card", children: [_jsx("div", { className: "text-xs font-mono mb-3", style: { color: 'var(--text-3)' }, children: "PAGE REFERENCE STRING" }), _jsx("div", { className: "flex flex-wrap gap-2", children: states.map((s, i) => (_jsxs(motion.div, { whileHover: { scale: 1.1 }, onHoverStart: () => setHover(i), onHoverEnd: () => setHover(null), style: {
                                width: 36, height: 36,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: 4,
                                background: i === currentIndex
                                    ? (s.fault ? 'rgba(255,71,87,0.2)' : 'rgba(0,230,118,0.2)')
                                    : i < currentIndex
                                        ? (s.fault ? 'rgba(255,71,87,0.08)' : 'rgba(0,230,118,0.06)')
                                        : 'var(--dim)',
                                border: `1px solid ${i === currentIndex
                                    ? (s.fault ? 'var(--rose)' : 'var(--emerald)')
                                    : i < currentIndex
                                        ? (s.fault ? 'rgba(255,71,87,0.3)' : 'rgba(0,230,118,0.2)')
                                        : 'var(--border)'}`,
                                cursor: 'default',
                                fontSize: '0.8rem',
                                fontFamily: '"Space Mono", monospace',
                                fontWeight: 700,
                                color: i <= currentIndex
                                    ? (s.fault ? 'var(--rose)' : 'var(--emerald)')
                                    : 'var(--text-3)',
                                transition: 'all 0.2s',
                                position: 'relative',
                            }, title: `t=${i}: page ${s.page} — ${s.fault ? 'PAGE FAULT' : 'HIT'}`, children: [s.page, s.fault && i <= currentIndex && (_jsx("div", { style: {
                                        position: 'absolute', bottom: -2, right: -2,
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: 'var(--rose)',
                                    } }))] }, i))) }), _jsxs("div", { className: "flex gap-4 mt-3", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "w-3 h-3 rounded-full", style: { background: 'var(--rose)' } }), _jsx("span", { className: "text-xs font-mono", style: { color: 'var(--text-3)' }, children: "Page Fault" })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "w-3 h-3 rounded-full", style: { background: 'var(--emerald)' } }), _jsx("span", { className: "text-xs font-mono", style: { color: 'var(--text-3)' }, children: "Hit" })] })] })] })] }));
}
