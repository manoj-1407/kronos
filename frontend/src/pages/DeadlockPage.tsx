import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Plus, Minus, ShieldCheck, ShieldAlert } from 'lucide-react'
import { api } from '../lib/api'
import type { BankersResult } from '../types'
import CCodeViewer from '../components/CCodeViewer'
import PlaybackControls from '../components/PlaybackControls'

const DEFAULT_ALLOC   = [[0,1,0],[2,0,0],[3,0,2],[2,1,1],[0,0,2]]
const DEFAULT_MAX     = [[7,5,3],[3,2,2],[9,0,2],[2,2,2],[4,3,3]]
const DEFAULT_AVAIL   = [3,3,2]

function MatrixInput({ label, matrix, onChange, color }: {
  label: string; matrix: number[][]; onChange: (m: number[][]) => void; color: string
}) {
  const n = matrix.length, m = matrix[0]?.length ?? 0
  return (
    <div>
      <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-3)' }}>{label}</div>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th className="text-xs font-mono pr-2 pb-1" style={{ color: 'var(--text-3)' }}>P\R</th>
              {Array.from({ length: m }, (_, j) => (
                <th key={j} className="text-xs font-mono w-12 pb-1 text-center" style={{ color }}>R{j}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="text-xs font-mono pr-2 py-0.5" style={{ color: 'var(--text-3)' }}>P{i}</td>
                {row.map((val, j) => (
                  <td key={j} className="py-0.5 px-0.5">
                    <input type="number" min={0} max={99} value={val}
                      onChange={e => {
                        const m2 = matrix.map((r, ri) => r.map((v, ci) => ri===i&&ci===j ? parseInt(e.target.value)||0 : v))
                        onChange(m2)
                      }}
                      className="kronos-input text-center"
                      style={{ width: 44, padding: '3px', fontSize: '0.75rem', color }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function DeadlockPage() {
  const [processes, setProcesses] = useState(5)
  const [resources, setResources] = useState(3)
  const [allocation, setAllocation] = useState(DEFAULT_ALLOC)
  const [maxNeed, setMaxNeed]       = useState(DEFAULT_MAX)
  const [available, setAvailable]   = useState(DEFAULT_AVAIL)
  const [reqPid, setReqPid]         = useState<number | ''>('')
  const [reqVec, setReqVec]         = useState<string>('')
  const [result, setResult]         = useState<BankersResult | null>(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [tab, setTab]               = useState<'result' | 'code'>('result')

  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalSteps = result?.steps.length ?? 0

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

  const resizeMatrices = (p: number, r: number) => {
    const expand = (m: number[][], rows: number, cols: number) =>
      Array.from({ length: rows }, (_, i) =>
        Array.from({ length: cols }, (_, j) => m[i]?.[j] ?? 0))
    setAllocation(expand(allocation, p, r))
    setMaxNeed(expand(maxNeed, p, r))
    setAvailable(a => Array.from({ length: r }, (_, j) => a[j] ?? 0))
  }

  const adjustProcesses = (delta: number) => {
    const p = Math.max(1, Math.min(8, processes + delta))
    setProcesses(p); resizeMatrices(p, resources)
  }
  const adjustResources = (delta: number) => {
    const r = Math.max(1, Math.min(6, resources + delta))
    setResources(r); resizeMatrices(processes, r)
  }

  const handleRun = async (withRequest = false) => {
    setLoading(true); setError(null)
    try {
      const body: any = { processes, resources: resources, allocation, max_need: maxNeed, available }
      if (withRequest && reqPid !== '' && reqVec.trim()) {
        body.request_pid = reqPid
        body.request     = reqVec.trim().split(/[\s,]+/).map(Number)
      }
      const r = await api.simulateDeadlock(body) as BankersResult
      setResult(r); setStep(0); setPlaying(false); setTab('result')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const currentStep = result?.steps[step]

  // Compute Need matrix for display
  const need = allocation.map((row, i) => row.map((v, j) => (maxNeed[i]?.[j] ?? 0) - v))

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">

        {/* Left: inputs */}
        <div className="space-y-4">
          {/* Dimensions */}
          <div className="kronos-card">
            <div className="text-xs font-mono mb-3" style={{ color: 'var(--text-3)' }}>SYSTEM CONFIGURATION</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono block mb-2" style={{ color: 'var(--text-3)' }}>PROCESSES</label>
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => adjustProcesses(-1)}><Minus size={12} /></button>
                  <span className="font-display font-bold text-xl w-6 text-center" style={{ color: 'var(--rose)' }}>{processes}</span>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => adjustProcesses(1)}><Plus size={12} /></button>
                </div>
              </div>
              <div>
                <label className="text-xs font-mono block mb-2" style={{ color: 'var(--text-3)' }}>RESOURCE TYPES</label>
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => adjustResources(-1)}><Minus size={12} /></button>
                  <span className="font-display font-bold text-xl w-6 text-center" style={{ color: 'var(--cyan)' }}>{resources}</span>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => adjustResources(1)}><Plus size={12} /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Available */}
          <div className="kronos-card">
            <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-3)' }}>AVAILABLE RESOURCES</div>
            <div className="flex gap-2">
              {available.map((v, j) => (
                <div key={j} className="flex flex-col items-center gap-1">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>R{j}</span>
                  <input type="number" min={0} max={99} value={v}
                    onChange={e => {
                      const a2 = [...available]; a2[j] = parseInt(e.target.value)||0; setAvailable(a2)
                    }}
                    className="kronos-input text-center"
                    style={{ width: 52, padding: '4px', fontSize: '0.85rem', color: 'var(--cyan)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Matrices */}
          <div className="kronos-card">
            <MatrixInput label="ALLOCATION MATRIX" matrix={allocation} onChange={setAllocation} color="var(--amber)" />
          </div>
          <div className="kronos-card">
            <MatrixInput label="MAX NEED MATRIX" matrix={maxNeed} onChange={setMaxNeed} color="var(--rose)" />
          </div>

          {/* Computed Need */}
          <div className="kronos-card">
            <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-3)' }}>NEED MATRIX (AUTO-COMPUTED: Max − Alloc)</div>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th className="text-xs font-mono pr-2 pb-1" style={{ color: 'var(--text-3)' }}>P\R</th>
                    {Array.from({ length: resources }, (_, j) => (
                      <th key={j} className="text-xs font-mono w-12 pb-1 text-center" style={{ color: 'var(--emerald)' }}>R{j}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {need.map((row, i) => (
                    <tr key={i}>
                      <td className="text-xs font-mono pr-2" style={{ color: 'var(--text-3)' }}>P{i}</td>
                      {row.map((v, j) => (
                        <td key={j} className="py-0.5 px-0.5">
                          <div className="w-11 h-7 flex items-center justify-center rounded"
                               style={{ background: v < 0 ? 'rgba(255,71,87,0.15)' : 'var(--dim)', color: v < 0 ? 'var(--rose)' : 'var(--emerald)', fontFamily: 'Space Mono', fontSize: '0.75rem', fontWeight: 700 }}>
                            {v}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resource request */}
          <div className="kronos-card">
            <div className="text-xs font-mono mb-3" style={{ color: 'var(--text-3)' }}>RESOURCE REQUEST (OPTIONAL)</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: 'var(--text-3)' }}>PROCESS</label>
                <select value={reqPid} onChange={e => setReqPid(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="kronos-input">
                  <option value="">None</option>
                  {Array.from({ length: processes }, (_, i) => <option key={i} value={i}>P{i}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: 'var(--text-3)' }}>REQUEST VECTOR</label>
                <input value={reqVec} onChange={e => setReqVec(e.target.value)}
                  className="kronos-input" placeholder="e.g. 1 0 2" />
              </div>
            </div>
            <button className="btn btn-rose w-full" onClick={() => handleRun(true)} disabled={loading || reqPid === ''}>
              TEST REQUEST
            </button>
          </div>

          <button className="btn btn-cyan w-full" style={{ padding: '10px' }} onClick={() => handleRun(false)} disabled={loading}>
            {loading ? '⟳ RUNNING BANKER\'S...' : <><Play size={14} /> RUN SAFETY CHECK</>}
          </button>

          {error && (
            <div className="text-xs font-mono p-3 rounded" style={{ background: 'rgba(255,71,87,0.1)', color: 'var(--rose)', border: '1px solid rgba(255,71,87,0.3)' }}>⚠ {error}</div>
          )}
        </div>

        {/* Right: results */}
        <div className="space-y-4">
          {result && (
            <>
              {/* Safety banner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="kronos-card flex items-center gap-4 p-5"
                style={{ border: `1px solid ${result.is_safe ? 'rgba(0,230,118,0.4)' : 'rgba(255,71,87,0.4)'}`,
                         background: result.is_safe ? 'rgba(0,230,118,0.05)' : 'rgba(255,71,87,0.05)' }}
              >
                {result.is_safe
                  ? <ShieldCheck size={36} style={{ color: 'var(--emerald)', flexShrink: 0 }} />
                  : <ShieldAlert  size={36} style={{ color: 'var(--rose)', flexShrink: 0 }} />
                }
                <div>
                  <div className="font-display font-bold text-xl" style={{ color: result.is_safe ? 'var(--emerald)' : 'var(--rose)' }}>
                    {result.is_safe ? 'SAFE STATE' : 'UNSAFE STATE'}
                  </div>
                  {result.request_reason && (
                    <div className="text-sm font-mono mt-1" style={{ color: 'var(--text-2)' }}>{result.request_reason}</div>
                  )}
                  {result.is_safe && result.safe_sequence.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>SAFE SEQUENCE:</span>
                      {result.safe_sequence.map((pid, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="badge badge-emerald font-display"
                          >
                            P{pid}
                          </motion.span>
                          {i < result.safe_sequence.length - 1 && <span style={{ color: 'var(--text-3)' }}>→</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              <div className="flex gap-1">
                {[{ id: 'result', label: 'STEP-BY-STEP' }, { id: 'code', label: 'C CODE' }].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id as any)}
                    className="px-4 py-2 text-xs font-mono tracking-wider"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer',
                      borderBottom: `2px solid ${tab === t.id ? 'var(--rose)' : 'transparent'}`,
                      color: tab === t.id ? 'var(--rose)' : 'var(--text-3)' }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === 'result' && (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
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

                    {/* Current step display */}
                    {currentStep && (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="kronos-card"
                        style={{
                          border: `1px solid ${
                            (currentStep as any).event === 'grant' ? 'rgba(0,230,118,0.4)' :
                            (currentStep as any).event === 'result' && !result.is_safe ? 'rgba(255,71,87,0.4)' :
                            'var(--border)'
                          }`
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="badge badge-cyan mt-0.5">{String((currentStep as any).event ?? '').toUpperCase()}</span>
                          <div>
                            <p className="text-sm font-mono" style={{ color: 'var(--text-1)' }}>
                              {String((currentStep as any).desc ?? '')}
                            </p>
                            {(currentStep as any).work && (
                              <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-3)' }}>
                                Work: [{String((currentStep as any).work)}]
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* All steps log */}
                    <div className="kronos-card" style={{ maxHeight: 300, overflowY: 'auto' }}>
                      <div className="text-xs font-mono mb-3" style={{ color: 'var(--text-3)' }}>FULL EXECUTION LOG</div>
                      <div className="space-y-1">
                        {result.steps.map((s: any, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            onClick={() => setStep(i)}
                            className="flex items-start gap-2 cursor-pointer p-2 rounded-md"
                            style={{
                              background: i === step ? 'rgba(0,229,255,0.08)' : 'transparent',
                              border: `1px solid ${i === step ? 'rgba(0,229,255,0.3)' : 'transparent'}`,
                            }}
                          >
                            <span className="text-xs font-mono w-4 flex-shrink-0" style={{ color: 'var(--text-3)' }}>{i + 1}</span>
                            <span className={`badge flex-shrink-0 ${
                              s.event === 'grant' ? 'badge-emerald' :
                              s.event === 'check' && s.can ? 'badge-cyan' :
                              s.event === 'check' ? 'badge-rose' :
                              'badge-amber'
                            }`} style={{ fontSize: '0.6rem' }}>
                              {String(s.event ?? '').toUpperCase()}
                            </span>
                            <span className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>{String(s.desc ?? '')}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                {tab === 'code' && (
                  <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <CCodeViewer algorithm="bankers" label="Banker's Algorithm" />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4 opacity-20">🔒</div>
              <p className="font-mono text-sm" style={{ color: 'var(--text-3)' }}>
                Configure allocation and max matrices, then run safety check
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
