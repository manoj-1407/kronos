import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, RefreshCw, Download, ChevronDown, ChevronUp, History, Sparkles, Save, Scale, FileText } from 'lucide-react'
import { api, getExportCsvUrl } from '../lib/api'
import type { CompareRunsResult, HistoryItem, RunInsight, ScenarioItem } from '../types'
import { downloadJSON, fmt2 } from '../lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  cpu:      'var(--amber)',
  memory:   'var(--emerald)',
  disk:     '#a78bfa',
  deadlock: 'var(--rose)',
}

function MetricBadge({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-1.5 rounded"
         style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
      <span className="font-mono font-bold text-base" style={{ color }}>{value}</span>
      <span className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-3)' }}>{label}</span>
    </div>
  )
}

function HistoryRow({
  item,
  selected,
  onToggleSelect,
  onDelete,
  onSaveScenario,
}: {
  item: HistoryItem
  selected: boolean
  onToggleSelect: (id: number) => void
  onDelete: (id: number) => void
  onSaveScenario: (item: HistoryItem) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const color = CATEGORY_COLORS[item.category] ?? 'var(--text-2)'
  const rd    = item.result_data as any

  const metrics = item.category === 'cpu' ? [
    { label: 'Avg Wait',  value: rd.avg_waiting?.toFixed(2) ?? '—' },
    { label: 'Avg TAT',   value: rd.avg_turnaround?.toFixed(2) ?? '—' },
    { label: 'CPU Util',  value: rd.cpu_utilization != null ? `${rd.cpu_utilization.toFixed(1)}%` : '—' },
  ] : item.category === 'memory' ? [
    { label: 'Faults',    value: rd.fault_count ?? '—' },
    { label: 'Hits',      value: rd.hit_count ?? '—' },
    { label: 'Fault %',   value: rd.fault_rate != null ? `${rd.fault_rate.toFixed(1)}%` : '—' },
  ] : item.category === 'disk' ? [
    { label: 'Seek Dist', value: rd.total_seek_distance ?? '—' },
    { label: 'Avg Seek',  value: rd.avg_seek_time?.toFixed(2) ?? '—' },
  ] : item.category === 'deadlock' ? [
    { label: 'State',     value: rd.is_safe ? 'SAFE' : 'UNSAFE' },
    { label: 'Seq Len',   value: rd.safe_sequence?.length ?? '—' },
  ] : []

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="kronos-card"
      style={{ border: `1px solid var(--border)` }}
    >
      <div className="flex items-center gap-4">
        <input type="checkbox" checked={selected} onChange={() => onToggleSelect(item.id)} />
        <span className="font-mono text-xs w-8 flex-shrink-0" style={{ color: 'var(--text-3)' }}>#{item.id}</span>

        {/* Category badge */}
        <span className="badge flex-shrink-0" style={{
          background: `${color}18`, color, border: `1px solid ${color}40`, fontSize: '0.65rem'
        }}>
          {item.category.toUpperCase()}
        </span>

        {/* Algorithm */}
        <span className="font-display font-bold text-sm flex-shrink-0" style={{ color: 'var(--text-1)' }}>
          {item.algorithm}
        </span>

        {/* Metrics */}
        <div className="flex gap-2 flex-1 flex-wrap">
          {metrics.map((m, i) => (
            <MetricBadge key={i} label={m.label} value={m.value} color={color} />
          ))}
        </div>

        {/* Time */}
        <span className="font-mono text-xs flex-shrink-0" style={{ color: 'var(--text-3)' }}>
          {new Date(item.created_at).toLocaleString()}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onSaveScenario(item)}
            className="btn btn-ghost" style={{ padding: '4px 6px' }}
            title="Save as scenario preset"
          >
            <Save size={12} />
          </button>
          <button
            onClick={() => downloadJSON(item, `kronos-sim-${item.id}.json`)}
            className="btn btn-ghost" style={{ padding: '4px 6px' }}
            title="Download JSON"
          >
            <Download size={12} />
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="btn btn-ghost" style={{ padding: '4px 6px' }}
            title="Show details"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="btn btn-ghost" style={{ padding: '4px 6px', color: 'var(--rose)' }}
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-3)' }}>INPUT</div>
                  <pre className="text-xs font-mono p-3 rounded overflow-auto"
                       style={{ background: 'var(--void)', border: '1px solid var(--border)',
                                color: 'var(--text-2)', maxHeight: 200 }}>
                    {JSON.stringify(item.input_data, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-3)' }}>RESULT (SUMMARY)</div>
                  <pre className="text-xs font-mono p-3 rounded overflow-auto"
                       style={{ background: 'var(--void)', border: '1px solid var(--border)',
                                color: 'var(--text-2)', maxHeight: 200 }}>
                    {JSON.stringify(
                      Object.fromEntries(
                        Object.entries(item.result_data).filter(([k]) =>
                          !['steps', 'gantt', 'states', 'seek_sequence', 'metrics'].includes(k)
                        )
                      ), null, 2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([])
  const [compareResult, setCompareResult] = useState<CompareRunsResult | null>(null)
  const [insightMap, setInsightMap] = useState<Record<number, RunInsight>>({})
  const [selectedRuns, setSelectedRuns] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [tab, setTab] = useState<'history' | 'scenarios'>('history')

  const load = async () => {
    setLoading(true)
    try {
      const h = await api.getHistory(100) as HistoryItem[]
      setHistory(h)
      const s = await api.listScenarios() as ScenarioItem[]
      setScenarios(s)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    await api.deleteHistory(id).catch(() => {})
    setHistory(h => h.filter(x => x.id !== id))
  }

  const handleToggleSelect = (id: number) => {
    setSelectedRuns(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id].slice(-4))
  }

  const handleCompare = async () => {
    if (selectedRuns.length < 2) return
    try {
      const result = await api.compareRuns(selectedRuns) as CompareRunsResult
      setCompareResult(result)
    } catch {}
  }

  const fetchInsight = async (id: number) => {
    if (insightMap[id]) return
    try {
      const result = await api.getRunInsight(id) as RunInsight
      setInsightMap(prev => ({ ...prev, [id]: result }))
    } catch {}
  }

  const handleSaveScenario = async (item: HistoryItem) => {
    const name = window.prompt('Scenario name', `${item.category.toUpperCase()} ${item.algorithm} baseline`)
    if (!name) return
    const notes = window.prompt('Scenario notes (optional)', 'Saved from simulation history')
    try {
      await api.createScenario({
        name,
        category: item.category,
        algorithm: item.algorithm,
        payload: item.input_data,
        notes,
        tags: [item.category, item.algorithm],
      })
      const s = await api.listScenarios() as ScenarioItem[]
      setScenarios(s)
      setTab('scenarios')
    } catch {}
  }

  const handleDeleteScenario = async (id: number) => {
    await api.deleteScenario(id).catch(() => {})
    setScenarios(prev => prev.filter(x => x.id !== id))
  }

  const handleClear = async () => {
    if (!confirm('Clear all simulation history?')) return
    await api.clearHistory().catch(() => {})
    setHistory([])
  }

  const filtered = filter === 'all' ? history : history.filter(h => h.category === filter)
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={18} style={{ color: 'var(--text-2)' }} />
          <span className="font-display font-bold tracking-wider" style={{ color: 'var(--text-1)' }}>
            SIMULATION LOG
          </span>
          <span className="badge badge-cyan ml-2">{filtered.length}</span>
        </div>
        <div className="flex gap-2">
          <a className="btn btn-ghost" href={getExportCsvUrl(500)} target="_blank" rel="noreferrer">
            <FileText size={13} /> EXPORT CSV
          </a>
          <button className="btn btn-ghost" onClick={load}>
            <RefreshCw size={13} /> REFRESH
          </button>
          <button className="btn btn-rose" onClick={handleClear} disabled={!history.length}>
            <Trash2 size={13} /> CLEAR ALL
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {(['history', 'scenarios'] as const).map(view => (
          <button key={view} className="btn" onClick={() => setTab(view)} style={{
            padding: '5px 14px',
            background: tab === view ? 'rgba(0,229,255,0.15)' : 'transparent',
            border: `1px solid ${tab === view ? 'var(--cyan)' : 'var(--border)'}`,
            color: tab === view ? 'var(--cyan)' : 'var(--text-3)',
            fontSize: '0.72rem',
          }}>
            {view.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'history' && (
      <>
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'cpu', 'memory', 'disk', 'deadlock'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="btn" style={{
              padding: '5px 14px',
              background: filter === f ? (f === 'all' ? 'rgba(0,229,255,0.15)' : `${CATEGORY_COLORS[f] ?? 'var(--cyan)'}18`) : 'transparent',
              border: `1px solid ${filter === f ? (CATEGORY_COLORS[f] ?? 'var(--cyan)') : 'var(--border)'}`,
              color: filter === f ? (CATEGORY_COLORS[f] ?? 'var(--cyan)') : 'var(--text-3)',
              fontSize: '0.7rem',
            }}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="kronos-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>
            Select up to 4 runs in the same category to compare.
          </div>
          <button className="btn btn-ghost" disabled={selectedRuns.length < 2} onClick={handleCompare}>
            <Scale size={12} /> COMPARE SELECTED
          </button>
        </div>
        <div className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
          Selected: {selectedRuns.join(', ') || 'none'}
        </div>
        {compareResult && (
          <div className="rounded p-3" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} style={{ color: 'var(--cyan)' }} />
              <span className="font-mono text-xs" style={{ color: 'var(--text-2)' }}>
                BEST RUN #{compareResult.best_run_id} using metric {compareResult.metric_key}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {compareResult.points.map(point => (
                <div key={point.id} className="rounded p-2" style={{ border: '1px solid var(--border)' }}>
                  <div className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>
                    #{point.id} {point.algorithm}
                  </div>
                  <div className="font-mono text-sm" style={{ color: 'var(--text-1)' }}>
                    {fmt2(point.metric)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 font-mono text-sm" style={{ color: 'var(--text-3)' }}>
          Loading simulations...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center">
          <div className="text-5xl mb-4 opacity-20">📋</div>
          <p className="font-mono text-sm" style={{ color: 'var(--text-3)' }}>
            No simulations recorded yet. Run some simulations to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(item => (
              <div key={item.id} className="space-y-2">
                <HistoryRow
                  item={item}
                  selected={selectedRuns.includes(item.id)}
                  onToggleSelect={handleToggleSelect}
                  onDelete={handleDelete}
                  onSaveScenario={handleSaveScenario}
                />
                <div className="flex justify-end">
                  <button className="btn btn-ghost" style={{ fontSize: '0.65rem' }} onClick={() => fetchInsight(item.id)}>
                    <Sparkles size={12} /> INSIGHT
                  </button>
                </div>
                {insightMap[item.id] && (
                  <div className="kronos-card" style={{ padding: '10px 12px', marginTop: '-4px' }}>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>
                      {insightMap[item.id].insight}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
      </>
      )}

      {tab === 'scenarios' && (
        <div className="space-y-3">
          {scenarios.length === 0 ? (
            <div className="kronos-card text-sm font-mono" style={{ color: 'var(--text-3)' }}>
              No scenarios yet. Save one from the history tab.
            </div>
          ) : scenarios.map(scenario => (
            <div key={scenario.id} className="kronos-card">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-display text-sm" style={{ color: 'var(--text-1)' }}>{scenario.name}</div>
                  <div className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
                    {scenario.category.toUpperCase()} - {scenario.algorithm}
                  </div>
                  {scenario.notes && (
                    <p className="text-xs mt-2" style={{ color: 'var(--text-2)' }}>{scenario.notes}</p>
                  )}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {scenario.tags.map(tag => (
                      <span key={tag} className="badge">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-ghost" onClick={() => downloadJSON(scenario.payload, `${scenario.name}.json`)}>
                    <Download size={12} /> PAYLOAD
                  </button>
                  <button className="btn btn-ghost" style={{ color: 'var(--rose)' }} onClick={() => handleDeleteScenario(scenario.id)}>
                    <Trash2 size={12} /> DELETE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
