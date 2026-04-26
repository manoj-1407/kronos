import { motion } from 'framer-motion'
import type { GanttEntry, ProcessMetrics } from '../types'
import { pidColor } from '../lib/utils'

interface Props {
  gantt: GanttEntry[]
  metrics: ProcessMetrics[]
  currentStep?: number
  animatedUpTo?: number   // animate bars up to this end time
}

export default function GanttChart({ gantt, metrics, animatedUpTo }: Props) {
  if (!gantt.length) return null
  const totalTime = Math.max(...gantt.map(g => g.end))
  const pxPerUnit = 100 / totalTime    // percentage per time unit

  return (
    <div className="space-y-4">
      {/* Timeline bar */}
      <div className="kronos-card">
        <div className="text-xs font-mono mb-3" style={{ color: 'var(--text-3)' }}>
          GANTT CHART — TIME UNITS
        </div>

        {/* Bars */}
        <div className="relative" style={{ height: 48, marginBottom: 24 }}>
          {gantt.map((entry, i) => {
            const left  = entry.start / totalTime * 100
            const width = (entry.end - entry.start) / totalTime * 100
            const isVisible = animatedUpTo === undefined || entry.start < animatedUpTo

            return (
              <motion.div
                key={`${entry.pid}-${i}`}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={isVisible ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                style={{
                  position: 'absolute',
                  left:   `${left}%`,
                  width:  `${width}%`,
                  top:    0,
                  height: 40,
                  background: pidColor(entry.pid) + '22',
                  border:     `1px solid ${pidColor(entry.pid)}66`,
                  borderRadius: 3,
                  transformOrigin: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
                title={`${entry.pid}: ${entry.start}–${entry.end} (${entry.end - entry.start} units)`}
              >
                <span className="font-display font-bold text-xs truncate px-1"
                      style={{ color: pidColor(entry.pid) }}>
                  {width > 4 ? entry.pid : ''}
                </span>
              </motion.div>
            )
          })}

          {/* Time markers */}
          <div className="absolute bottom-0 left-0 right-0 flex" style={{ top: 44 }}>
            {Array.from({ length: Math.min(totalTime + 1, 21) }, (_, i) => {
              const step = totalTime <= 20 ? 1 : Math.ceil(totalTime / 20)
              const t = i * step
              if (t > totalTime) return null
              return (
                <div key={t} style={{ position: 'absolute', left: `${t / totalTime * 100}%` }}>
                  <div className="w-px h-2" style={{ background: 'var(--border)' }} />
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-3)', marginLeft: -4 }}>
                    {t}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-2">
          {[...new Set(gantt.map(g => g.pid))].map(pid => (
            <div key={pid} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: pidColor(pid) + '44', border: `1px solid ${pidColor(pid)}` }} />
              <span className="font-mono text-xs" style={{ color: 'var(--text-2)' }}>{pid}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics table */}
      <div className="kronos-card overflow-x-auto">
        <div className="text-xs font-mono mb-3" style={{ color: 'var(--text-3)' }}>
          PROCESS METRICS TABLE
        </div>
        <table className="w-full text-xs font-mono" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['PID','Arrival','Burst','Completion','Turnaround','Waiting','Response'].map(h => (
                <th key={h} className="text-left pb-2 pr-4" style={{ color: 'var(--text-3)', fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, i) => (
              <motion.tr
                key={m.pid}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ borderBottom: '1px solid rgba(30,45,71,0.5)' }}
              >
                <td className="py-2 pr-4 font-bold" style={{ color: pidColor(m.pid) }}>{m.pid}</td>
                <td className="py-2 pr-4" style={{ color: 'var(--text-2)' }}>{m.arrival}</td>
                <td className="py-2 pr-4" style={{ color: 'var(--text-2)' }}>{m.burst}</td>
                <td className="py-2 pr-4" style={{ color: 'var(--text-1)' }}>{m.completion}</td>
                <td className="py-2 pr-4" style={{ color: 'var(--amber)' }}>{m.turnaround}</td>
                <td className="py-2 pr-4" style={{ color: 'var(--cyan)' }}>{m.waiting}</td>
                <td className="py-2 pr-4" style={{ color: 'var(--emerald)' }}>{m.response}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
