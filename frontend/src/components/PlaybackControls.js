import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';
const SPEEDS = [
    { label: '0.25×', ms: 1600 },
    { label: '0.5×', ms: 800 },
    { label: '1×', ms: 400 },
    { label: '2×', ms: 200 },
    { label: '4×', ms: 100 },
];
export default function PlaybackControls(props) {
    const { current, total, isPlaying, speed } = props;
    const pct = total > 1 ? (current / (total - 1)) * 100 : 0;
    return (_jsxs("div", { className: "kronos-card flex flex-col gap-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs font-mono mb-1.5", style: { color: 'var(--text-3)' }, children: [_jsxs("span", { children: ["STEP ", current + 1, " / ", total] }), _jsxs("span", { children: [pct.toFixed(0), "%"] })] }), _jsx("div", { className: "w-full rounded-full overflow-hidden cursor-pointer", style: { height: 4, background: 'var(--dim)' }, onClick: (e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pct = (e.clientX - rect.left) / rect.width;
                            const step = Math.round(pct * (total - 1));
                            props.onFirst(); // reset first
                            // jump via calling next N times is inefficient; just expose setStep
                        }, children: _jsx(motion.div, { animate: { width: `${pct}%` }, transition: { duration: 0.1 }, style: { height: '100%', background: 'var(--cyan)', borderRadius: 9999 } }) })] }), _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("button", { className: "btn btn-ghost", onClick: props.onFirst, title: "First", children: _jsx(SkipBack, { size: 14 }) }), _jsx("button", { className: "btn btn-ghost", onClick: props.onPrev, disabled: current === 0, title: "Prev", children: _jsx(ChevronLeft, { size: 14 }) }), _jsx("button", { className: `btn ${isPlaying ? 'btn-rose' : 'btn-cyan'}`, onClick: isPlaying ? props.onPause : props.onPlay, disabled: current >= total - 1 && !isPlaying, style: { minWidth: 80 }, children: isPlaying ? _jsxs(_Fragment, { children: [_jsx(Pause, { size: 14 }), " PAUSE"] }) : _jsxs(_Fragment, { children: [_jsx(Play, { size: 14 }), " PLAY"] }) }), _jsx("button", { className: "btn btn-ghost", onClick: props.onNext, disabled: current >= total - 1, title: "Next", children: _jsx(ChevronRight, { size: 14 }) }), _jsx("button", { className: "btn btn-ghost", onClick: props.onLast, title: "Last", children: _jsx(SkipForward, { size: 14 }) })] }), _jsxs("div", { className: "flex items-center justify-center gap-1", children: [_jsx("span", { className: "text-xs font-mono mr-2", style: { color: 'var(--text-3)' }, children: "SPEED:" }), SPEEDS.map(s => (_jsx("button", { onClick: () => props.onSpeedChange(s.ms), className: "btn", style: {
                            padding: '3px 8px', fontSize: '0.7rem',
                            background: speed === s.ms ? 'rgba(0,229,255,0.15)' : 'transparent',
                            border: `1px solid ${speed === s.ms ? 'var(--cyan)' : 'var(--border)'}`,
                            color: speed === s.ms ? 'var(--cyan)' : 'var(--text-3)',
                        }, children: s.label }, s.ms)))] })] }));
}
