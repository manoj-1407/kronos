import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export default function StatCard({ label, value, unit, color = 'var(--cyan)', icon, delay = 0, small }) {
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay }, className: "kronos-card flex flex-col gap-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [icon && _jsx("span", { style: { color }, children: icon }), _jsx("span", { className: "text-xs font-mono tracking-wide", style: { color: 'var(--text-3)' }, children: label })] }), _jsxs("div", { className: `font-display font-bold tabular-nums ${small ? 'text-xl' : 'text-2xl'}`, style: { color }, children: [value, unit && _jsx("span", { className: "text-sm font-normal ml-1", style: { color: 'var(--text-3)' }, children: unit })] })] }));
}
