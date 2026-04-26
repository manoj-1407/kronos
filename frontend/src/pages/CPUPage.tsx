import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Play, Shuffle, Sword } from 'lucide-react'
import { api } from '../lib/api'
import { useStore } from '../store'
import type { ProcessInput, SchedulingResult } from '../types'
import GanttChart from '../components/GanttChart'
import CCodeViewer from '../components/CCodeViewer'
import PlaybackControls from '../components/PlaybackControls'
import StatCard from '../components/StatCard'
import { randInt, clearPidColors, fmt2 } from '../lib/utils'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'

const ALGORITHMS = [
  { id: 'fcfs',       label: 'FCFS',          desc: 'First Come First Served' },
  { id: 'sjf',        label: 'SJF',           desc: 'Shortest Job First' },
  { id: 'srtf',       label: 'SRTF',          desc: 'Shortest Remaining Time' },
  { id: 'rr',         label: 'Round Robin',   desc: 'Preemptive, time quantum' },
  { id: 'priority',   label: 'Priority NP',   desc: 'Non-Preemptive Priority' },
  { id: 'priority_p', label: 'Priority P',    desc: 'Preemptive Priority' },
  { id: 'mlfq',       label: 'MLFQ',          desc: 'Multi-Level Feedback Queue' },
]

const DUEL_PAIRS = [
  ['fcfs', 'sjf'], ['sjf', 'srtf'], ['rr', 'fcfs'],
  ['priority', 'priority_p'], ['rr', 'mlfq'],
]

function randomProcesses(): ProcessInput[] {
  return Array.from({ length: 5 }, (_, i) => ({
    pid: `P${i + 1}`,
    arrival:  i === 0 ? 0 : randInt(0, 6),
    burst:    randInt(2, 10),
    priority: randInt(1, 5),
  }))
}

export default function CPUPage() {
  const [processes, setProcesses] = useState<ProcessInput[]>(randomProcesses())
  const [algorithm, setAlgorithm] = useState('fcfs')
  const [quantum, setQuantum]     = useState(2)
  const [queues, setQueues]       = useState(3)
  const [result, setResult]       = useState<SchedulingResult | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [tab, setTab]             = useState<'gantt' | 'code' | 'compare'>('gantt')
  const [duelResult, setDuelResult] = useState<any>(null)
  const [duelAlgB, setDuelAlgB]   = useState('sjf')

  // Playback
  const [step, setStep]           = useState(0)
  const [playing, setPlaying]     = useState(false)
  const playSpeed = useStore(s => s.playSpeed)
  const setPlaySpeed = useStore(s => s.setPlaySpeed)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSteps = result?.steps.length ?? 0

  useEffect(() => {
    if (playing && step < totalSteps - 1) {
      timerRef.current = setInterval(() => {
        setStep(s => {
          if (s >= totalSteps - 1) { setPlaying(false); return s }
          return s + 1
        })
      }, playSpeed)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing, playSpeed, totalSteps])

  const handleRun = async () => {
    setLoading(true); setError(null); clearPidColors()
    try {
      const r = await api.simulateCPU({ algorithm, processes, quantum, queues }) as SchedulingResult
      setResult(r); setStep(0); setPlaying(false); setTab('gantt')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleDuel = async () => {
    setLoading(true); setError(null)
    try {
      const r = await api.simulateDuel({
        category: 'cpu', algorithm_a: algorithm, algorithm_b: duelAlgB,
        input_data: { processes, quantum }
      })
      setDuelResult(r); setTab('compare')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const addProcess = () => {
    const n = processes.length + 1
    setProcesses(p => [...p, { pid: `P${n}`, arrival: 0, burst: 4, priority: 1 }])
  }
  const removeProcess = (i: number) => setProcesses(p => p.filter((_, j) => j !== i))
  const updateProcess = (i: number, field: keyof ProcessInput, val: string) =>
    setProcesses(p => p.map((proc, j) =>
      j === i ? { ...proc, [field]: field === 'pid' ? val : Math.max(0, parseInt(val) || 0) } : proc
    ))

  // Current gantt highlight based on step
  const currentStepData = result?.steps[step]
  const ganttUpTo = currentStepData
    ? (currentStepData.until as number ?? result!.gantt[result!.gantt.length - 1].end)
    : undefined

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">

        {/* ── Left panel: inputs ── */}
        <div className="space-y-4">

          {/* Algorithm selector */}
          <div className="kronos-card">
            <div className="text-xs font-mono mb-3" style={{ color: 'var(--text-3)' }}>ALGORITHM</div>
            <div className="space-y-1">
              {ALGORITHMS.map(a => (
                <button
                  key={a.id}
                  onClick={() => setAlgorithm(a.id)}
                  className="w-full text-left px-3 py-2 rounded-md transition-all"
                  style={{
                    background: algorithm === a.id ? 'rgba(255,179,0,0.1)' : 'transparent',
                    border: `1px solid ${algorithm === a.id ? 'rgba(255,179,0,0.4)' : 'transparent'}`,
                  }}
                >
                  <div className="font-display text-sm font-bold" style={{ color: algorithm === a.id ? 'var(--amber)' : 'var(--text-1)' }}>
                    {a.label}
                  </div>
                  <div className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{a.desc}</div>
                </button>
              ))}
            </div>

            {/* Quantum / Queues */}
            {(algorithm === 'rr' || algorithm === 'mlfq') && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono block mb-1" style={{ color: 'var(--text-3)' }}>QUANTUM</label>
                  <input type="number" min={1} max={20} value={quantum}
                    onChange={e => setQuantum(parseInt(e.target.value) || 2)}
                    className="kronos-input" />
                </div>
                {algorithm === 'mlfq' && (
                  <div>
                    <label className="text-xs font-mono block mb-1" style={{ color: 'var(--text-3)' }}>QUEUES</label>
                    <input type="number" min={2} max={5} value={queues}
                      onChange={e => setQueues(parseInt(e.target.value) || 3)}
                      className="kronos-input" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Process table */}
          <div className="kronos-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>PROCESSES</span>
              <div className="flex gap-2">
                <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                  onClick={() => { setProcesses(randomProcesses()); setResult(null) }}>
                  <Shuffle size={11} /> RANDOM
                </button>
                <button className="btn btn-cyan" style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                  onClick={addProcess} disabled={processes.length >= 10}>
                  <Plus size={11} /> ADD
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_24px] gap-1 mb-1">
              {['PID', 'ARR', 'BURST', 'PRI', '', ''].map((h, i) => (
                <span key={i} className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{h}</span>
              ))}
            </div>
            <div className="space-y-1">
              {processes.map((p, i) => (
                <motion.div key={i} layout className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_24px] gap-1 items-center">
                  <input value={p.pid} onChange={e => updateProcess(i, 'pid', e.target.value)}
                    className="kronos-input text-center" style={{ padding: '4px' }} maxLength={4} />
                  {(['arrival','burst','priority'] as const).map(f => (
                    <input key={f} type="number" min={0} max={99} value={p[f]}
                      onChange={e => updateProcess(i, f, e.target.value)}
                      className="kronos-input" style={{ padding: '4px' }} />
                  ))}
                  <div />
                  <button onClick={() => removeProcess(i)} disabled={processes.length <= 1}
                    style={{ color: 'var(--rose)', opacity: processes.length <= 1 ? 0.3 : 1, background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Duel selector */}
          <div className="kronos-card">
            <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-3)' }}>⚔ ALGORITHM DUEL</div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono badge badge-amber">{ALGORITHMS.find(a => a.id === algorithm)?.label}</span>
              <span style={{ color: 'var(--text-3)' }}>vs</span>
              <select value={duelAlgB} onChange={e => setDuelAlgB(e.target.value)}
                className="kronos-input flex-1" style={{ padding: '4px 8px' }}>
                {ALGORITHMS.filter(a => a.id !== algorithm).map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-amber w-full" onClick={handleDuel} disabled={loading}>
              <Sword size={13} /> DUEL
            </button>
          </div>

          {/* Run */}
          <button className="btn btn-cyan w-full" style={{ padding: '10px' }} onClick={handleRun} disabled={loading}>
            {loading ? '⟳ SIMULATING...' : <><Play size={14} /> RUN SIMULATION</>}
          </button>

          {error && (
            <div className="text-xs font-mono p-3 rounded" style={{ background: 'rgba(255,71,87,0.1)', color: 'var(--rose)', border: '1px solid rgba(255,71,87,0.3)' }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {/* ── Right panel: results ── */}
        <div className="space-y-4">
          {result && (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="AVG WAITING"     value={fmt2(result.avg_waiting)}   unit="units" color="var(--cyan)"    delay={0}    small />
                <StatCard label="AVG TURNAROUND"  value={fmt2(result.avg_turnaround)} unit="units" color="var(--amber)"  delay={0.05} small />
                <StatCard label="AVG RESPONSE"    value={fmt2(result.avg_response)}  unit="units" color="var(--emerald)" delay={0.1}  small />
                <StatCard label="CPU UTILIZATION" value={fmt2(result.cpu_utilization)} unit="%"  color="var(--violet)"  delay={0.15} small />
              </div>

              {/* Tabs */}
              <div className="flex gap-1" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
                {[
                  { id: 'gantt',   label: 'GANTT + METRICS' },
                  { id: 'code',    label: 'C CODE' },
                  { id: 'compare', label: 'DUEL RESULTS' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id as any)}
                    className="px-4 py-2 text-xs font-mono tracking-wider border-b-2 transition-colors"
                    style={{
                      borderBottomColor: tab === t.id ? 'var(--amber)' : 'transparent',
                      color: tab === t.id ? 'var(--amber)' : 'var(--text-3)',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      borderBottom: `2px solid ${tab === t.id ? 'var(--amber)' : 'transparent'}`,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === 'gantt' && (
                  <motion.div key="gantt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <PlaybackControls
                      current={step} total={totalSteps} isPlaying={playing} speed={playSpeed}
                      onPlay={() => { if (step >= totalSteps - 1) setStep(0); setPlaying(true) }}
                      onPause={() => setPlaying(false)}
                      onPrev={() => { setPlaying(false); setStep(s => Math.max(0, s - 1)) }}
                      onNext={() => { setPlaying(false); setStep(s => Math.min(totalSteps - 1, s + 1)) }}
                      onFirst={() => { setPlaying(false); setStep(0) }}
                      onLast={() => { setPlaying(false); setStep(totalSteps - 1) }}
                      onSpeedChange={setPlaySpeed}
                    />

                    {/* Step log */}
                    {currentStepData && (
                      <div className="kronos-card">
                        <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>STEP LOG</span>
                        <p className="text-sm font-mono mt-1" style={{ color: 'var(--cyan)' }}>
                          ▶ {String(currentStepData.desc ?? JSON.stringify(currentStepData))}
                        </p>
                      </div>
                    )}

                    <GanttChart gantt={result.gantt} metrics={result.metrics} animatedUpTo={ganttUpTo} />
                  </motion.div>
                )}

                {tab === 'code' && (
                  <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <CCodeViewer algorithm={algorithm} label={ALGORITHMS.find(a => a.id === algorithm)?.label} />
                  </motion.div>
                )}

                {tab === 'compare' && duelResult && (
                  <motion.div key="compare" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="kronos-card text-center">
                      <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-3)' }}>WINNER</div>
                      <div className="font-display text-2xl font-bold" style={{ color: 'var(--emerald)' }}>
                        🏆 {duelResult.winner.toUpperCase()}
                      </div>
                      <div className="text-xs font-mono mt-1" style={{ color: 'var(--text-2)' }}>
                        (lower avg. waiting time)
                      </div>
                    </div>

                    <div className="kronos-card">
                      <div className="text-xs font-mono mb-4" style={{ color: 'var(--text-3)' }}>COMPARISON</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={Object.entries(duelResult.comparison).map(([key, vals]: any) => ({
                          metric: key.replace('avg_', '').replace('_', ' ').toUpperCase(),
                          [duelResult.algorithm_a]: vals[duelResult.algorithm_a],
                          [duelResult.algorithm_b]: vals[duelResult.algorithm_b],
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="metric" tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'Space Mono' }} />
                          <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'Space Mono' }} />
                          <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', fontFamily: 'Space Mono', fontSize: 11 }} />
                          <Bar dataKey={duelResult.algorithm_a} fill="var(--cyan)" opacity={0.8} />
                          <Bar dataKey={duelResult.algorithm_b} fill="var(--amber)" opacity={0.8} />
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
              <div className="text-6xl mb-4 opacity-20">⚙</div>
              <p className="font-mono text-sm" style={{ color: 'var(--text-3)' }}>
                Configure processes and run a simulation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
