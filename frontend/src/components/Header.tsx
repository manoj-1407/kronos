import { useLocation } from 'react-router-dom'
import { Sun, Moon, Wifi, WifiOff } from 'lucide-react'
import { useStore } from '../store'
import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/':         { title: 'MISSION CONTROL',   subtitle: 'OS Internals Overview' },
  '/cpu':      { title: 'CPU SCHEDULER',      subtitle: 'Process Scheduling Algorithms' },
  '/memory':   { title: 'MEMORY UNIT',        subtitle: 'Page Replacement Algorithms' },
  '/disk':     { title: 'DISK I/O CONTROLLER',subtitle: 'Disk Scheduling Algorithms' },
  '/deadlock': { title: 'DEADLOCK ANALYZER',  subtitle: "Banker's Algorithm & Detection" },
  '/history':  { title: 'SIMULATION LOG',     subtitle: 'Past Simulations & Replay' },
}

export default function Header() {
  const location = useLocation()
  const theme = useStore(s => s.theme)
  const toggleTheme = useStore(s => s.toggleTheme)
  const [apiOk, setApiOk] = useState<boolean | null>(null)
  const [clock, setClock] = useState(new Date())

  const meta = PAGE_META[location.pathname] ?? { title: 'KRONOS', subtitle: '' }

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) })
        setApiOk(res.ok)
      } catch {
        setApiOk(false)
      }
    }
    check()
    const id = setInterval(check, 10000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      className="h-14 flex items-center justify-between px-6 flex-shrink-0"
      style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Page title */}
      <div className="flex flex-col">
        <span className="font-display font-bold text-sm tracking-widest" style={{ color: 'var(--cyan)' }}>
          {meta.title}
        </span>
        <span className="text-xs tracking-wide" style={{ color: 'var(--text-3)' }}>
          {meta.subtitle}
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* System clock */}
        <span className="font-mono text-xs tabular-nums" style={{ color: 'var(--text-3)' }}>
          {clock.toLocaleTimeString('en-US', { hour12: false })}
        </span>

        {/* API status */}
        <div className="flex items-center gap-1.5">
          {apiOk === null ? (
            <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: 'var(--text-3)' }} />
          ) : apiOk ? (
            <>
              <Wifi size={13} style={{ color: 'var(--emerald)' }} />
              <span className="text-xs font-mono" style={{ color: 'var(--emerald)' }}>API ONLINE</span>
            </>
          ) : (
            <>
              <WifiOff size={13} style={{ color: 'var(--rose)' }} />
              <span className="text-xs font-mono" style={{ color: 'var(--rose)' }}>API OFFLINE</span>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md btn-ghost"
          style={{ border: '1px solid var(--border)' }}
          title="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun size={15} style={{ color: 'var(--amber)' }} />
            : <Moon size={15} style={{ color: 'var(--violet)' }} />
          }
        </button>
      </div>
    </header>
  )
}
