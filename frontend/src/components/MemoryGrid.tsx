import { motion, AnimatePresence } from 'framer-motion'
import type { FrameState } from '../types'
import { useState } from 'react'

interface Props {
  states: FrameState[]
  currentIndex: number   // which state to display
  frameCount: number
}

export default function MemoryGrid({ states, currentIndex, frameCount }: Props) {
  const [hover, setHover] = useState<number | null>(null)

  if (!states.length) return null

  // Show states from 0..currentIndex
  const visible = states.slice(0, currentIndex + 1)
  const current = states[currentIndex]

  // Summary stats up to current
  const faultsSoFar = visible.filter(s => s.fault).length
  const hitsSoFar   = visible.length - faultsSoFar

  return (
    <div className="space-y-4">
      {/* Current frame state */}
      <div className="kronos-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
            FRAME STATE — STEP {currentIndex + 1}/{states.length}
          </span>
          <div className="flex gap-3">
            <span className="badge badge-rose">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
              {faultsSoFar} FAULTS
            </span>
            <span className="badge badge-emerald">
              {hitsSoFar} HITS
            </span>
          </div>
        </div>

        {/* Frames */}
        <div className="flex gap-3 items-end">
          {Array.from({ length: frameCount }, (_, fi) => {
            const page   = current?.frames[fi] ?? null
            const isHit  = current?.hit_index === fi
            const wasEvicted = current?.evicted !== null && states[Math.max(0, currentIndex - 1)]?.frames[fi] === current?.evicted

            return (
              <motion.div
                key={fi}
                layout
                className="flex flex-col items-center gap-2"
              >
                <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>F{fi}</span>
                <motion.div
                  animate={
                    isHit    ? { scale: [1, 1.08, 1], borderColor: 'var(--emerald)' } :
                    wasEvicted ? { scale: [1, 0.92, 1], borderColor: 'var(--rose)' } :
                    current?.fault && page !== null ? { scale: [0.8, 1], opacity: [0, 1] } : {}
                  }
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 64, height: 64,
                    background: page !== null ? 'rgba(0,229,255,0.08)' : 'var(--dim)',
                    border: `1px solid ${
                      isHit      ? 'var(--emerald)' :
                      wasEvicted ? 'var(--rose)' :
                      page !== null ? 'var(--border)' : 'rgba(30,45,71,0.3)'
                    }`,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AnimatePresence mode="wait">
                    {page !== null ? (
                      <motion.span
                        key={page}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="font-mono font-bold text-lg"
                        style={{ color: isHit ? 'var(--emerald)' : 'var(--cyan)' }}
                      >
                        {page}
                      </motion.span>
                    ) : (
                      <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>—</span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )
          })}

          {/* Current page info */}
          {current && (
            <div className="ml-4 flex flex-col justify-center">
              <div className="text-xs font-mono mb-1" style={{ color: 'var(--text-3)' }}>INCOMING</div>
              <div
                className="w-16 h-16 flex items-center justify-center rounded-md font-mono font-bold text-xl"
                style={{
                  background: current.fault ? 'rgba(255,71,87,0.15)' : 'rgba(0,230,118,0.1)',
                  border: `2px solid ${current.fault ? 'var(--rose)' : 'var(--emerald)'}`,
                  color: current.fault ? 'var(--rose)' : 'var(--emerald)',
                }}
              >
                {current.page}
              </div>
              <div className="text-xs font-mono mt-1 text-center"
                   style={{ color: current.fault ? 'var(--rose)' : 'var(--emerald)' }}>
                {current.fault ? 'FAULT' : 'HIT'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page reference string */}
      <div className="kronos-card">
        <div className="text-xs font-mono mb-3" style={{ color: 'var(--text-3)' }}>
          PAGE REFERENCE STRING
        </div>
        <div className="flex flex-wrap gap-2">
          {states.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1 }}
              onHoverStart={() => setHover(i)}
              onHoverEnd={() => setHover(null)}
              style={{
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 4,
                background: i === currentIndex
                  ? (s.fault ? 'rgba(255,71,87,0.2)' : 'rgba(0,230,118,0.2)')
                  : i < currentIndex
                  ? (s.fault ? 'rgba(255,71,87,0.08)' : 'rgba(0,230,118,0.06)')
                  : 'var(--dim)',
                border: `1px solid ${
                  i === currentIndex
                    ? (s.fault ? 'var(--rose)' : 'var(--emerald)')
                    : i < currentIndex
                    ? (s.fault ? 'rgba(255,71,87,0.3)' : 'rgba(0,230,118,0.2)')
                    : 'var(--border)'
                }`,
                cursor: 'default',
                fontSize: '0.8rem',
                fontFamily: '"Space Mono", monospace',
                fontWeight: 700,
                color: i <= currentIndex
                  ? (s.fault ? 'var(--rose)' : 'var(--emerald)')
                  : 'var(--text-3)',
                transition: 'all 0.2s',
                position: 'relative',
              }}
              title={`t=${i}: page ${s.page} — ${s.fault ? 'PAGE FAULT' : 'HIT'}`}
            >
              {s.page}
              {s.fault && i <= currentIndex && (
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--rose)',
                }} />
              )}
            </motion.div>
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--rose)' }} />
            <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>Page Fault</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--emerald)' }} />
            <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>Hit</span>
          </div>
        </div>
      </div>
    </div>
  )
}
