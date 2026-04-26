import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, Database, HardDrive, AlertTriangle,
  History, LayoutDashboard, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useStore } from '../store'
import { cn } from '../lib/utils'

const NAV = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard',   color: 'var(--cyan)' },
  { to: '/cpu',      icon: Cpu,             label: 'CPU Scheduling', color: 'var(--amber)' },
  { to: '/memory',   icon: Database,        label: 'Memory Mgmt', color: 'var(--emerald)' },
  { to: '/disk',     icon: HardDrive,       label: 'Disk Scheduling', color: 'var(--violet)' },
  { to: '/deadlock', icon: AlertTriangle,   label: 'Deadlock',    color: 'var(--rose)' },
  { to: '/history',  icon: History,         label: 'History',     color: 'var(--text-2)' },
]

export default function Sidebar() {
  const open = useStore(s => s.sidebarOpen)
  const setOpen = useStore(s => s.setSidebarOpen)
  const location = useLocation()

  return (
    <motion.aside
      animate={{ width: open ? 240 : 64 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col overflow-hidden"
      style={{ background: 'var(--panel)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center px-4 h-14 flex-shrink-0"
           style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 min-w-0">
          {/* K logo mark */}
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded"
               style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)' }}>
            <span className="font-display font-bold text-sm glow-cyan" style={{ color: 'var(--cyan)' }}>K</span>
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col min-w-0"
              >
                <span className="font-display font-bold text-sm tracking-widest" style={{ color: 'var(--cyan)' }}>KRONOS</span>
                <span className="text-xs tracking-wider" style={{ color: 'var(--text-3)' }}>OS VISUALIZER</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {NAV.map(({ to, icon: Icon, label, color }) => {
          const active = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to)
          return (
            <NavLink key={to} to={to}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  'flex items-center gap-3 px-2 py-2.5 rounded-md cursor-pointer transition-colors',
                  active
                    ? 'bg-[rgba(0,229,255,0.08)]'
                    : 'hover:bg-[rgba(255,255,255,0.04)]'
                )}
                style={active ? { borderLeft: `2px solid ${color}`, paddingLeft: '6px' } : {}}
                title={!open ? label : undefined}
              >
                <Icon
                  size={18}
                  style={{ color: active ? color : 'var(--text-2)', flexShrink: 0 }}
                />
                <AnimatePresence>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="text-sm font-display tracking-wide truncate"
                      style={{ color: active ? 'var(--text-1)' : 'var(--text-2)' }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </NavLink>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-center p-2 rounded-md btn-ghost"
          style={{ border: '1px solid var(--border)' }}
        >
          {open
            ? <ChevronLeft size={16} style={{ color: 'var(--text-2)' }} />
            : <ChevronRight size={16} style={{ color: 'var(--text-2)' }} />
          }
        </button>
      </div>
    </motion.aside>
  )
}
