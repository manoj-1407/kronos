import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { Code2 } from 'lucide-react';
import hljs from 'highlight.js/lib/core';
import c from 'highlight.js/lib/languages/c';
import { C_CODE } from '../lib/ccode';
hljs.registerLanguage('c', c);
export default function CCodeViewer({ algorithm, label }) {
    const ref = useRef(null);
    const code = C_CODE[algorithm.toLowerCase().replace(/[\s()]/g, '_').replace(/\(np\)/, '').replace(/\(p\)/, '_p')]
        ?? C_CODE[algorithm.toLowerCase()]
        ?? `// C implementation for ${algorithm}\n// Coming soon...`;
    useEffect(() => {
        if (ref.current) {
            ref.current.removeAttribute('data-highlighted');
            hljs.highlightElement(ref.current);
        }
    }, [algorithm]);
    return (_jsxs("div", { className: "kronos-card flex flex-col", style: { minHeight: 0 }, children: [_jsxs("div", { className: "flex items-center gap-2 mb-3 flex-shrink-0", children: [_jsx(Code2, { size: 14, style: { color: 'var(--cyan)' } }), _jsxs("span", { className: "text-xs font-mono tracking-wide", style: { color: 'var(--text-3)' }, children: ["C IMPLEMENTATION \u2014 ", label ?? algorithm.toUpperCase()] })] }), _jsxs("div", { className: "flex items-center gap-1.5 mb-3", children: [_jsx("div", { className: "w-3 h-3 rounded-full", style: { background: '#ff5f56' } }), _jsx("div", { className: "w-3 h-3 rounded-full", style: { background: '#ffbd2e' } }), _jsx("div", { className: "w-3 h-3 rounded-full", style: { background: '#27c93f' } }), _jsxs("span", { className: "ml-2 text-xs font-mono", style: { color: 'var(--text-3)' }, children: [algorithm.toLowerCase(), ".c"] })] }), _jsx("div", { className: "overflow-auto rounded-md p-4 flex-1", style: { background: 'var(--void)', border: '1px solid var(--border)', minHeight: 180 }, children: _jsx("pre", { className: "m-0", children: _jsx("code", { ref: ref, className: "language-c code-block", children: code }) }) }), _jsx("p", { className: "mt-2 text-xs font-mono", style: { color: 'var(--text-3)' }, children: "\u2191 This is what the visualizer animates \u2014 live C logic" })] }));
}
