import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Shuffle, Sword } from 'lucide-react'
import { api } from '../lib/api'
import type { DiskResult } from '../types'
import DiskSeekChart from '../components/DiskSeekChart'
import CCodeViewer from '../components/CCodeViewer'
import PlaybackControls from '../components/PlaybackControls'
import StatCard from '../components/StatCard'
import { randInt, randomArray, fmt2 } from '../lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

const ALGORITHMS = [
  { id: 'fcfs',  label: 'FCFS',   desc: 'First Come First Served' },
  { id: 'sstf',  label: 'SSTF',   desc: 'Shortest Seek Time First' },
  { id: 'scan',  label: 'SCAN',   desc: 'Elevator Algorithm' },
  { id: 'cscan', label: 'C-SCAN', desc: 'Circular SCAN' },
  { id: 'look',  label: 'LOOK',   desc: 'LOOK Algorithm' },
  { id: 'clook', label: 'C-LOOK', desc: 'Circular LOOK' },
]

export default function DiskPage() {
  const [algorithm, setAlgorithm] = useState('sstf')
  const [reqStr, setReqStr]       = useState(randomArray(10, 0, 199).join(' '))
  const [head, setHead]           = useState(53)
  const [diskSize, setDiskSize]   = useState(200)
  const [direction, setDirection] = useState('right')
  const [result, setResult]       = useState<DiskResult | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [tab, setTab]             = useState<'chart' | 'code' | 'duel'>('chart')
  const [duelAlgB, setDuelAlgB]   = useState('scan')
  const [duelResults, setDuelResults] = useState<any>(null)

  const [step, setStep]   = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(400)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalSteps = result?.seek_sequence.length ?? 0

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

  const parseReqs = () => reqStr.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && n >= 0 && n < diskSize)

  const handleRun = async () => {
    const requests = parseReqs()
    if (!requests.length) return setError('Enter at least one cylinder request')
    setLoading(true); setError(null)
    try {
      const r = await api.simulateDisk({ algorithm, requests, initial_head: head, disk_size: diskSize, direction }) as DiskResult
      setResult(r); setStep(0); setPlaying(false); setTab('chart')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleDuel = async () => {
    const requests = parseReqs()
    if (!requests.length) return
    setLoading(true); setError(null)
    try {
      const r = await api.simulateDuel({
        category: 'disk', algorithm_a: algorithm, algorithm_b: duelAlgB,
        input_data: { requests, initial_head: head, disk_size: diskSize }
      })
      setDuelResults(r); setTab('duel')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const needsDirection = ['scan', 'look'].includes(algorithm)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">

        {/* Left */}
        <div className="space-y-4">
          <div className="kronos-card">
            <div className="text-xs font-mono mb-3" style={{ color: 'var(--text-3)' }}>ALGORITHM</div>
            <div className="space-y-1">
              {ALGORITHMS.map(a => (
                <button key={a.id} onClick={() => setAlgorithm(a.id)}
                  className="w-full text-left px-3 py-2 rounded-md transition-all"
                  style={{
                    background: algorithm === a.id ? 'rgba(124,58,237,0.1)' : 'transparent',
                    border: `1px solid ${algorithm === a.id ? 'rgba(124,58,237,0.4)' : 'transparent'}`,
                  }}>
                  <div className="font-display text-sm font-bold" style={{ color: algorithm === a.id ? '#a78bfa' : 'var(--text-1)' }}>
                    {a.label}
                  </div>
                  <div className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{a.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="kronos-card space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>CYLINDER REQUESTS</label>
                <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: '0.65rem' }}
                  onClick={() => { setReqStr(randomArray(10, 0, diskSize - 1).join(' ')); setResult(null) }}>
                  <Shuffle size={10} /> RANDOM
                </button>
              </div>
              <textarea value={reqStr} onChange={e => setReqStr(e.target.value)}
                className="kronos-input" rows={2} placeholder="e.g. 98 183 37 122 14 124 65 67" style={{ resize: 'none' }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: 'var(--text-3)' }}>INITIAL HEAD</label>
                <input type="number" min={0} max={diskSize - 1} value={head}
                  onChange={e => setHead(parseInt(e.target.value) || 0)} className="kronos-input" />
              </div>
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: 'var(--text-3)' }}>DISK SIZE</label>
                <input type="number" min={50} max={500} value={diskSize}
                  onChange={e => setDiskSize(parseInt(e.target.value) || 200)} className="kronos-input" />
              </div>
            </div>

            {needsDirection && (
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: 'var(--text-3)' }}>INITIAL DIRECTION</label>
                <div className="flex gap-2">
                  {['right', 'left'].map(d => (
                    <button key={d} onClick={() => setDirection(d)}
                      className="btn flex-1" style={{ padding: '6px',
                        background: direction === d ? 'rgba(124,58,237,0.15)' : 'transparent',
                        border: `1px solid ${direction === d ? '#a78bfa' : 'var(--border)'}`,
                        color: direction === d ? '#a78bfa' : 'var(--text-3)',
                        fontSize: '0.75rem' }}>
                      {d === 'right' ? '→ RIGHT' : '← LEFT'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Duel */}
          <div className="kronos-card">
            <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-3)' }}>⚔ ALGORITHM DUEL</div>
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-violet">{ALGORITHMS.find(a => a.id === algorithm)?.label}</span>
              <span style={{ color: 'var(--text-3)' }}>vs</span>
              <select value={duelAlgB} onChange={e => setDuelAlgB(e.target.value)} className="kronos-input flex-1" style={{ padding: '4px 8px' }}>
                {ALGORITHMS.filter(a => a.id !== algorithm).map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-amber w-full" onClick={handleDuel} disabled={loading}><Sword size={13} /> DUEL</button>
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

        {/* Right */}
        <div className="space-y-4">
          {result && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard label="TOTAL SEEK DIST" value={result.total_seek_distance} unit="cyl" color="var(--violet)" delay={0} small />
                <StatCard label="AVG SEEK TIME"   value={fmt2(result.avg_seek_time)}  unit="cyl" color="var(--cyan)"   delay={0.05} small />
                <StatCard label="REQUESTS"         value={result.seek_sequence.length - 1}        color="var(--amber)"  delay={0.1} small />
              </div>

              <div className="flex gap-1">
                {[{ id: 'chart', label: 'SEEK PATH' }, { id: 'code', label: 'C CODE' }, { id: 'duel', label: 'DUEL' }].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id as any)}
                    className="px-4 py-2 text-xs font-mono tracking-wider"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer',
                      borderBottom: `2px solid ${tab === t.id ? '#a78bfa' : 'transparent'}`,
                      color: tab === t.id ? '#a78bfa' : 'var(--text-3)' }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === 'chart' && (
                  <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
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
                    <DiskSeekChart result={result} currentStep={step} />
                  </motion.div>
                )}
                {tab === 'code' && (
                  <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <CCodeViewer algorithm={algorithm === 'sstf' ? 'sstf' : 'scan'} label={ALGORITHMS.find(a => a.id === algorithm)?.label} />
                  </motion.div>
                )}
                {tab === 'duel' && duelResults && (
                  <motion.div key="duel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="kronos-card text-center">
                      <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-3)' }}>WINNER — LESS SEEK DISTANCE</div>
                      <div className="font-display text-2xl font-bold" style={{ color: 'var(--emerald)' }}>🏆 {duelResults.winner.toUpperCase()}</div>
                    </div>
                    <div className="kronos-card">
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={[
                          { name: 'Total Seek', [duelResults.algorithm_a]: duelResults.comparison.total_seek_distance?.[duelResults.algorithm_a], [duelResults.algorithm_b]: duelResults.comparison.total_seek_distance?.[duelResults.algorithm_b] },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' }} />
                          <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' }} />
                          <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', fontFamily: 'Space Mono', fontSize: 11 }} />
                          <Bar dataKey={duelResults.algorithm_a} fill="#a78bfa" opacity={0.8} />
                          <Bar dataKey={duelResults.algorithm_b} fill="var(--amber)" opacity={0.8} />
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
              <div className="text-6xl mb-4 opacity-20">💿</div>
              <p className="font-mono text-sm" style={{ color: 'var(--text-3)' }}>Enter cylinder requests and run a simulation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
