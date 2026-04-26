import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Cpu, Database, HardDrive, AlertTriangle, Zap, Activity, Clock, Layers } from 'lucide-react'
import { useStore } from '../store'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { HistoryItem } from '../types'

const MODULES = [
  {
    to: '/cpu', icon: Cpu, title: 'CPU SCHEDULER',
    subtitle: '7 algorithms', color: 'var(--amber)',
    algorithms: ['FCFS', 'SJF', 'SRTF', 'Round Robin', 'Priority NP', 'Priority P', 'MLFQ'],
    desc: 'Visualize process scheduling tick-by-tick with animated Gantt charts and per-process metrics.',
  },
  {
    to: '/memory', icon: Database, title: 'MEMORY UNIT',
    subtitle: '5 algorithms', color: 'var(--emerald)',
    algorithms: ['FIFO', 'LRU', 'Optimal', 'LFU', 'Clock'],
    desc: 'Watch page loads and evictions animate across frame slots in real-time.',
  },
  {
    to: '/disk', icon: HardDrive, title: 'DISK I/O CTRL',
    subtitle: '6 algorithms', color: 'var(--violet)',
    algorithms: ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'],
    desc: 'See the disk head traverse cylinders and compare total seek distances.',
  },
  {
    to: '/deadlock', icon: AlertTriangle, title: 'DEADLOCK ENGINE',
    subtitle: "Banker's Algo", color: 'var(--rose)',
    algorithms: ["Safety Check", "Resource Request", "Need Matrix", "Safe Sequence"],
    desc: "Run Banker's Algorithm, request resources, and prove system safety step by step.",
  },
]

const FEATURES = [
  { icon: Zap,      text: 'Step-through mode — tick by tick' },
  { icon: Activity, text: 'Algorithm Duel — side-by-side compare' },
  { icon: Clock,    text: 'Simulation history with replay' },
  { icon: Layers,   text: 'C code viewer on every algorithm' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const history  = useStore(s => s.history)
  const setHistory = useStore(s => s.setHistory)
  const [stats, setStats] = useState({ total: 0, cpu: 0, memory: 0, disk: 0, deadlock: 0 })

  useEffect(() => {
    api.getHistory(20).then((h: any) => {
      setHistory(h)
      setStats({
        total:    h.length,
        cpu:      h.filter((x: HistoryItem) => x.category === 'cpu').length,
        memory:   h.filter((x: HistoryItem) => x.category === 'memory').length,
        disk:     h.filter((x: HistoryItem) => x.category === 'disk').length,
        deadlock: h.filter((x: HistoryItem) => x.category === 'deadlock').length,
      })
    }).catch(() => {})
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="scan-line-overlay rounded-xl p-8 relative overflow-hidden"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        {/* Background grid accent */}
        <div className="absolute inset-0 opacity-30 grid-bg pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="badge badge-cyan mb-4">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                SYSTEM ONLINE
              </div>
              <h1 className="font-display text-4xl font-bold tracking-wider mb-2" style={{ color: 'var(--cyan)' }}>
                KRONOS
              </h1>
              <p className="text-lg font-display tracking-wide mb-1" style={{ color: 'var(--text-1)' }}>
                Operating System Internals Visualizer
              </p>
              <p className="text-sm font-mono" style={{ color: 'var(--text-2)' }}>
                Real-time simulation of CPU scheduling · Memory management · Disk I/O · Deadlock detection
              </p>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-3">
              {[
                { label: 'ALGORITHMS', value: '18+' },
                { label: 'CATEGORIES', value: '4' },
                { label: 'SIMULATIONS', value: stats.total },
                { label: 'C LISTINGS', value: '14' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="bracket p-4 text-center rounded"
                  style={{ background: 'rgba(0,229,255,0.05)', minWidth: 90 }}
                >
                  <div className="font-display text-2xl font-bold" style={{ color: 'var(--cyan)' }}>{s.value}</div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-3)' }}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}
              >
                <Icon size={12} style={{ color: 'var(--cyan)' }} />
                <span className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Module grid */}
      <div>
        <h2 className="font-display text-sm tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>
          SIMULATION MODULES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULES.map(({ to, icon: Icon, title, subtitle, color, algorithms, desc }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              onClick={() => navigate(to)}
              className="kronos-card cursor-pointer group relative overflow-hidden"
              style={{ border: `1px solid var(--border)`, transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = color
                e.currentTarget.style.boxShadow = `0 0 20px ${color}22`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color, opacity: 0.6 }} />

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg flex-shrink-0"
                     style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-bold text-sm tracking-wider" style={{ color: 'var(--text-1)' }}>
                      {title}
                    </span>
                    <span className="badge" style={{
                      background: `${color}18`, color, border: `1px solid ${color}40`,
                      fontSize: '0.6rem',
                    }}>
                      {subtitle}
                    </span>
                  </div>
                  <p className="text-xs font-mono mb-3" style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
                    {desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {algorithms.map(a => (
                      <span key={a} className="text-xs font-mono px-2 py-0.5 rounded"
                            style={{ background: 'var(--dim)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="text-xs font-mono tracking-wider" style={{ color }}>
                  LAUNCH SIMULATOR →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent simulations */}
      {history.length > 0 && (
        <div>
          <h2 className="font-display text-sm tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>
            RECENT SIMULATIONS
          </h2>
          <div className="kronos-card overflow-x-auto">
            <table className="w-full text-xs font-mono" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Category', 'Algorithm', 'Time'].map(h => (
                    <th key={h} className="text-left pb-2 pr-6" style={{ color: 'var(--text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 8).map((item: HistoryItem, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate('/history')}
                    className="cursor-pointer"
                    style={{ borderBottom: '1px solid rgba(30,45,71,0.4)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="py-2 pr-6" style={{ color: 'var(--text-3)' }}>{item.id}</td>
                    <td className="py-2 pr-6">
                      <span className={`badge badge-${
                        item.category === 'cpu' ? 'amber' :
                        item.category === 'memory' ? 'emerald' :
                        item.category === 'disk' ? 'violet' : 'rose'
                      }`}>
                        {item.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 pr-6" style={{ color: 'var(--text-1)' }}>{item.algorithm}</td>
                    <td className="py-2 pr-6" style={{ color: 'var(--text-3)' }}>
                      {new Date(item.created_at).toLocaleTimeString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
