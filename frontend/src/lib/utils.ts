import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Pretty time format
export function fmtTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

// Deterministic colour per PID
const PALETTE = [
  '#00e5ff', '#ffb300', '#00e676', '#ff4757',
  '#7c3aed', '#f06292', '#4dd0e1', '#ff8f00',
  '#69f0ae', '#ea4c89',
]
const pidMap = new Map<string, string>()

export function pidColor(pid: string): string {
  if (!pidMap.has(pid)) {
    pidMap.set(pid, PALETTE[pidMap.size % PALETTE.length])
  }
  return pidMap.get(pid)!
}

export function clearPidColors() { pidMap.clear() }

// Clamp
export const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v))

// Random int in [lo, hi]
export const randInt = (lo: number, hi: number) =>
  Math.floor(Math.random() * (hi - lo + 1)) + lo

// Array of random integers
export function randomArray(n: number, lo: number, hi: number): number[] {
  const seen = new Set<number>()
  const arr: number[] = []
  while (arr.length < n) {
    const v = randInt(lo, hi)
    if (!seen.has(v)) { seen.add(v); arr.push(v) }
  }
  return arr
}

// Download JSON
export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// Simple number formatter
export const fmt2 = (n: number) => n.toFixed(2)
