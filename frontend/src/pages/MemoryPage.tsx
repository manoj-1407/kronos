import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Shuffle, Sword } from 'lucide-react'
import { api } from '../lib/api'
import type { MemoryResult } from '../types'
import MemoryGrid from '../components/MemoryGrid'
import CCodeViewer from '../components/CCodeViewer'
import PlaybackControls from '../components/PlaybackControls'
import StatCard from '../components/StatCard'
import { randInt, fmt2 } from '../lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

const ALGORITHMS = [
  { id: 'fifo',    label: 'FIFO',    desc: 'First In First Out' },
  { id: 'lru',     label: 'LRU',     desc: 'Least Recently Used' },
  { id: 'optimal', label: 'Optimal', desc: "Bélády's Algorithm" },
  { id: 'lfu',     label: 'LFU',     desc: 'Least Frequently Used' },
  { id: 'clock',   label: 'Clock',   desc: 'Second Chance (Clock)' },
]

function randomPages(n = 16): number[] {
  return Array.from({ length: n }, () => randInt(1, 7))
}

export default function MemoryPage() {
  const [algorithm, setAlgorithm] = useState('fifo')
  const [frames, setFrames]       = useState(3)
  const [pagesStr, setPagesStr]   = useState(randomPages().join(' '))
  const [result, setResult]       = useState<MemoryResult | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [tab, setTab]             = useState<'grid' | 'code' | 'duel'>('grid')
  const [duelAlgB, setDuelAlgB]   = useState('lru')
  const [duelResults, setDuelResults] = useState<any>(null)

  const [step, setStep]   = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(400)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalSteps = result?.states.length ?? 0

  useEffect(() => {
    if (playing && step < totalSteps - 1) {
      timerRef.current = setInterval(() => {
        setStep(s => {
          if (s >= totalSteps - 1) { setPlaying(false); return s }
          return s + 1
        })
      }, speed)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing, speed, totalSteps])

  const parsePages = () => pagesStr.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && n > 0)

  const handleRun = async () => {
    const pages = parsePages()
    if (!pages.length) return setError('Enter at least one page number')
    setLoading(true); setError(null)
    try {
      const r = await api.simulateMemory({ algorithm, pages, frames }) as MemoryResult
      setResult(r); setStep(0); setPlaying(false); setTab('grid')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleDuel = async () => {
    const pages = parsePages()
    if (!pages.length) return
    setLoading(true); setError(null)
    try {
      const r = await api.simulateDuel({
        category: 'memory', algorithm_a: algorithm, algorithm_b: duelAlgB,
        input_data: { pages, frames }
      })
      setDuelResults(r); setTab('duel')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">

        {/* Left: inputs */}
        <div className="space-y-4">
          <div className="kronos-card">
            <div className="text-xs font-mono mb-3" style={{ color: 'var(--text-3)' }}>ALGORITHM</div>
            <div className="space-y-1">
              {ALGORITHMS.map(a => (
                <button key={a.id} onClick={() => setAlgorithm(a.id)}
                  className="w-full text-left px-3 py-2 rounded-md transition-all"
                  style={{
                    background: algorithm === a.id ? 'rgba(0,230,118,0.1)' : 'transparent',
                    border: `1px solid ${algorithm === a.id ? 'rgba(0,230,118,0.4)' : 'transparent'}`,
                  }}>
                  <div className="font-display text-sm font-bold" style={{ color: algorithm === a.id ? 'var(--emerald)' : 'var(--text-1)' }}>
                    {a.label}
                  </div>
                  <div className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{a.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="kronos-card space-y-3">
            <div>
              <label className="text-xs font-mono block mb-1" style={{ color: 'var(--text-3)' }}>FRAME COUNT</label>
              <div className="flex items-center gap-3">
                <input type="range" min={1} max={8} value={frames}
                  onChange={e => setFrames(parseInt(e.target.value))}
                  className="flex-1" style={{ accentColor: 'var(--emerald)' }} />
                <span className="font-mono font-bold text-lg w-6 text-center" style={{ color: 'var(--emerald)' }}>{frames}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>PAGE REFERENCE STRING</label>
                <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: '0.65rem' }}
                  onClick={() => { setPagesStr(randomPages().join(' ')); setResult(null) }}>
                  <Shuffle size={10} /> RANDOM
                </button>
              </div>
              <textarea
                value={pagesStr}
                onChange={e => setPagesStr(e.target.value)}
                className="kronos-input"
                rows={3}
                placeholder="e.g. 1 2 3 4 1 2 5 1 2 3 4 5"
                style={{ resize: 'vertical' }}
              />
              <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-3)' }}>
                Space or comma separated integers
              </p>
            </div>
          </div>

          {/* Duel */}
          <div className="kronos-card">
            <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-3)' }}>⚔ ALGORITHM DUEL</div>
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-emerald">{ALGORITHMS.find(a => a.id === algorithm)?.label}</span>
              <span style={{ color: 'var(--text-3)' }}>vs</span>
              <select value={duelAlgB} onChange={e => setDuelAlgB(e.target.value)} className="kronos-input flex-1" style={{ padding: '4px 8px' }}>
                {ALGORITHMS.filter(a => a.id !== algorithm).map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-amber w-full" onClick={handleDuel} disabled={loading}>
              <Sword size={13} /> DUEL
            </button>
          </div>

          <button className="btn btn-cyan w-full" style={{ padding: '10px' }} onClick={handleRun} disabled={loading}>
            {loading ? '⟳ SIMULATING...' : <><Play size={14} /> RUN SIMULATION</>}
          </button>

          {error && (
            <div className="text-xs font-mono p-3 rounded" style={{ background: 'rgba(255,71,87,0.1)', color: 'var(--rose)', border: '1px solid rgba(255,71,87,0.3)' }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Right: results */}
        <div className="space-y-4">
          {result && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="PAGE FAULTS"  value={result.fault_count} color="var(--rose)"    delay={0}    small />
                <StatCard label="PAGE HITS"    value={result.hit_count}   color="var(--emerald)" delay={0.05} small />
                <StatCard label="FAULT RATE"   value={fmt2(result.fault_rate)}  unit="%" color="var(--amber)" delay={0.1} small />
                <StatCard label="HIT RATE"     value={fmt2(result.hit_rate)}    unit="%" color="var(--cyan)"  delay={0.15} small />
              </div>

              <div className="flex gap-1">
                {[{ id: 'grid', label: 'FRAME ANIMATION' }, { id: 'code', label: 'C CODE' }, { id: 'duel', label: 'DUEL RESULTS' }].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id as any)}
                    className="px-4 py-2 text-xs font-mono tracking-wider"
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      borderBottom: `2px solid ${tab === t.id ? 'var(--emerald)' : 'transparent'}`,
                      color: tab === t.id ? 'var(--emerald)' : 'var(--text-3)',
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === 'grid' && (
                  <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <PlaybackControls
                      current={step} total={totalSteps} isPlaying={playing} speed={speed}
                      onPlay={() => { if (step >= totalSteps - 1) setStep(0); setPlaying(true) }}
                      onPause={() => setPlaying(false)}
                      onPrev={() => { setPlaying(false); setStep(s => Math.max(0, s - 1)) }}
                      onNext={() => { setPlaying(false); setStep(s => Math.min(totalSteps - 1, s + 1)) }}
                      onFirst={() => { setPlaying(false); setStep(0) }}
                      onLast={() => { setPlaying(false); setStep(totalSteps - 1) }}
                      onSpeedChange={setSpeed}
                    />
                    <MemoryGrid states={result.states} currentIndex={step} frameCount={result.frames} />
                  </motion.div>
                )}
                {tab === 'code' && (
                  <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <CCodeViewer algorithm={algorithm} label={ALGORITHMS.find(a => a.id === algorithm)?.label} />
                  </motion.div>
                )}
                {tab === 'duel' && duelResults && (
                  <motion.div key="duel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="kronos-card text-center">
                      <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-3)' }}>WINNER — FEWER PAGE FAULTS</div>
                      <div className="font-display text-2xl font-bold" style={{ color: 'var(--emerald)' }}>
                        🏆 {duelResults.winner.toUpperCase()}
                      </div>
                    </div>
                    <div className="kronos-card">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[
                          { name: 'Page Faults', [duelResults.algorithm_a]: duelResults.comparison.fault_count?.[duelResults.algorithm_a], [duelResults.algorithm_b]: duelResults.comparison.fault_count?.[duelResults.algorithm_b] },
                          { name: 'Hit Rate %',  [duelResults.algorithm_a]: duelResults.comparison.hit_rate?.[duelResults.algorithm_a],    [duelResults.algorithm_b]: duelResults.comparison.hit_rate?.[duelResults.algorithm_b] },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' }} />
                          <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' }} />
                          <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', fontFamily: 'Space Mono', fontSize: 11 }} />
                          <Bar dataKey={duelResults.algorithm_a} fill="var(--emerald)" opacity={0.8} />
                          <Bar dataKey={duelResults.algorithm_b} fill="var(--violet)" opacity={0.8} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4 opacity-20">🗄</div>
              <p className="font-mono text-sm" style={{ color: 'var(--text-3)' }}>Configure frames and page string, then run</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
