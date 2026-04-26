import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import { useStore } from '../store';
import Sidebar from './Sidebar';
import Header from './Header';
export default function Layout() {
    const open = useStore(s => s.sidebarOpen);
    return (_jsxs("div", { className: "flex h-screen overflow-hidden", style: { background: 'var(--void)' }, children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex flex-col flex-1 overflow-hidden transition-all duration-300", style: { marginLeft: open ? 240 : 64 }, children: [_jsx(Header, {}), _jsx("main", { className: "flex-1 overflow-y-auto p-6 grid-bg", children: _jsx(Outlet, {}) })] })] }));
}
