// ── CPU Scheduling ────────────────────────────────────────────────────────────

export interface ProcessInput {
  pid: string
  arrival: number
  burst: number
  priority: number
}

export interface GanttEntry {
  pid: string
  start: number
  end: number
  queue?: number
}

export interface ProcessMetrics {
  pid: string
  arrival: number
  burst: number
  completion: number
  turnaround: number
  waiting: number
  response: number
  priority: number
}

export interface SchedulingResult {
  algorithm: string
  gantt: GanttEntry[]
  metrics: ProcessMetrics[]
  avg_turnaround: number
  avg_waiting: number
  avg_response: number
  throughput: number
  cpu_utilization: number
  steps: SimStep[]
  simulation_id?: number
}

// ── Memory ────────────────────────────────────────────────────────────────────

export interface FrameState {
  time: number
  page: number
  frames: (number | null)[]
  fault: boolean
  evicted: number | null
  hit_index: number | null
}

export interface MemoryResult {
  algorithm: string
  frames: number
  pages: number[]
  states: FrameState[]
  fault_count: number
  hit_count: number
  fault_rate: number
  hit_rate: number
  simulation_id?: number
}

// ── Disk ─────────────────────────────────────────────────────────────────────

export interface DiskStep {
  from: number
  to: number
  distance: number
  desc: string
}

export interface DiskResult {
  algorithm: string
  initial_head: number
  seek_sequence: number[]
  total_seek_distance: number
  avg_seek_time: number
  steps: DiskStep[]
  disk_size: number
  simulation_id?: number
}

// ── Deadlock ──────────────────────────────────────────────────────────────────

export interface BankersResult {
  is_safe: boolean
  safe_sequence: number[]
  need_matrix: number[][]
  steps: SimStep[]
  request_granted: boolean | null
  request_reason: string | null
  simulation_id?: number
}

// ── Generic ───────────────────────────────────────────────────────────────────

export type SimStep = Record<string, unknown>

export type SimCategory = 'cpu' | 'memory' | 'disk' | 'deadlock'

export interface HistoryItem {
  id: number
  category: SimCategory
  algorithm: string
  created_at: string
  input_data: Record<string, unknown>
  result_data: Record<string, unknown>
}

export interface ScenarioItem {
  id: number
  name: string
  category: SimCategory
  algorithm: string
  payload: Record<string, unknown>
  notes?: string | null
  tags: string[]
  created_at: string
}

export interface ComparePoint {
  id: number
  algorithm: string
  metric: number
  created_at: string
}

export interface CompareRunsResult {
  run_ids: number[]
  category: SimCategory
  metric_key: string
  best_run_id: number
  points: ComparePoint[]
}

export interface RunInsight {
  id: number
  category: SimCategory
  algorithm: string
  insight: string
}

// ── Duel ─────────────────────────────────────────────────────────────────────

export interface DuelResult {
  algorithm_a: string
  algorithm_b: string
  result_a: Record<string, unknown>
  result_b: Record<string, unknown>
  winner: string
  comparison: Record<string, Record<string, number>>
}

// ── WebSocket ─────────────────────────────────────────────────────────────────

export type WSMessage =
  | { type: 'start';    total_steps: number }
  | { type: 'step';     index: number; step: SimStep }
  | { type: 'complete'; result: Record<string, unknown> }
  | { type: 'error';    msg: string }

// ── Theme ─────────────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light'

// ── Algorithm metadata ────────────────────────────────────────────────────────

export interface AlgorithmMeta {
  id: string
  name: string
  category: SimCategory
  description: string
  timeComplexity: string
  spaceComplexity: string
  pros: string[]
  cons: string[]
  useCases: string[]
}
