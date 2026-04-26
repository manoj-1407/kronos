import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    return (_jsx("circle", { cx: cx, cy: cy, r: 5, fill: "var(--void)", stroke: "var(--cyan)", strokeWidth: 2 }));
};
export default function DiskSeekChart({ result, currentStep }) {
    const seq = result.seek_sequence.slice(0, currentStep + 1);
    const data = seq.map((pos, i) => ({
        step: i,
        position: pos,
        dist: i > 0 ? Math.abs(seq[i] - seq[i - 1]) : 0,
        label: i === 0 ? 'Start' : `${pos}`,
    }));
    const totalVisible = data.slice(1).reduce((s, d) => s + d.dist, 0);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "kronos-card", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("span", { className: "text-xs font-mono", style: { color: 'var(--text-3)' }, children: ["DISK HEAD SEEK PATH \u2014 ", result.algorithm] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("span", { className: "badge badge-amber", children: [totalVisible, " CYLINDERS"] }), _jsxs("span", { className: "badge badge-cyan", children: ["STEP ", currentStep, "/", result.seek_sequence.length - 1] })] })] }), _jsx(ResponsiveContainer, { width: "100%", height: 260, children: _jsxs(LineChart, { data: data, margin: { top: 8, right: 24, left: 0, bottom: 0 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "step", label: { value: 'Request Order', position: 'insideBottom', offset: -2,
                                        fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' }, tick: { fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' } }), _jsx(YAxis, { domain: [0, result.disk_size], label: { value: 'Cylinder', angle: -90, position: 'insideLeft',
                                        fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' }, tick: { fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' } }), _jsx(Tooltip, { contentStyle: { background: 'var(--panel)', border: '1px solid var(--border)', fontSize: 12, fontFamily: 'Space Mono' }, labelFormatter: (l) => `Request #${l}`, formatter: (v, n) => [v, n === 'position' ? 'Cylinder' : 'Distance'] }), _jsx(Line, { type: "linear", dataKey: "position", stroke: "var(--cyan)", strokeWidth: 2, dot: _jsx(CustomDot, {}), isAnimationActive: false })] }) })] }), _jsxs("div", { className: "kronos-card", children: [_jsx("div", { className: "text-xs font-mono mb-3", style: { color: 'var(--text-3)' }, children: "SEEK SEQUENCE" }), _jsx("div", { className: "flex flex-wrap gap-2 items-center", children: result.seek_sequence.map((pos, i) => (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: i <= currentStep ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.8 }, transition: { duration: 0.2 }, style: {
                                        padding: '4px 10px',
                                        background: i === currentStep
                                            ? 'rgba(0,229,255,0.15)'
                                            : i < currentStep
                                                ? 'rgba(0,229,255,0.06)'
                                                : 'var(--dim)',
                                        border: `1px solid ${i <= currentStep ? 'rgba(0,229,255,0.4)' : 'var(--border)'}`,
                                        borderRadius: 4,
                                        fontFamily: '"Space Mono", monospace',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        color: i === 0 ? 'var(--amber)' : i <= currentStep ? 'var(--cyan)' : 'var(--text-3)',
                                    }, children: pos }), i < result.seek_sequence.length - 1 && (_jsx("span", { style: { color: 'var(--text-3)', fontSize: 12 }, children: "\u2192" }))] }, i))) }), currentStep > 0 && (_jsxs("div", { className: "mt-3 text-xs font-mono", style: { color: 'var(--text-3)' }, children: ["Last move:", ' ', _jsxs("span", { style: { color: 'var(--amber)' }, children: [result.seek_sequence[currentStep - 1], " \u2192 ", result.seek_sequence[currentStep], ' ', "(", Math.abs(result.seek_sequence[currentStep] - result.seek_sequence[currentStep - 1]), " cylinders)"] })] }))] })] }));
}
