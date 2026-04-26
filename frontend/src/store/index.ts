import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Theme, SimCategory, HistoryItem,
  SchedulingResult, MemoryResult, DiskResult, BankersResult
} from '../types'

interface AppState {
  // Theme
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void

  // Simulation state
  category: SimCategory
  setCategory: (c: SimCategory) => void

  isSimulating: boolean
  setIsSimulating: (v: boolean) => void

  // Live step playback
  currentStep: number
  totalSteps: number
  isPlaying: boolean
  playSpeed: number         // ms between steps
  setCurrentStep: (n: number) => void
  setTotalSteps:  (n: number) => void
  setIsPlaying:   (v: boolean) => void
  setPlaySpeed:   (ms: number) => void
  resetPlayback:  () => void

  // Results cache
  cpuResult:      SchedulingResult | null
  memoryResult:   MemoryResult    | null
  diskResult:     DiskResult      | null
  deadlockResult: BankersResult   | null
  setCpuResult:      (r: SchedulingResult | null) => void
  setMemoryResult:   (r: MemoryResult    | null) => void
  setDiskResult:     (r: DiskResult      | null) => void
  setDeadlockResult: (r: BankersResult   | null) => void

  // History
  history: HistoryItem[]
  setHistory: (h: HistoryItem[]) => void
  addHistory: (h: HistoryItem) => void

  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),

      // Category
      category: 'cpu',
      setCategory: (c) => set({ category: c }),

      // Simulation
      isSimulating: false,
      setIsSimulating: (v) => set({ isSimulating: v }),

      // Playback
      currentStep: 0,
      totalSteps:  0,
      isPlaying:   false,
      playSpeed:   400,
      setCurrentStep: (n) => set({ currentStep: n }),
      setTotalSteps:  (n) => set({ totalSteps: n }),
      setIsPlaying:   (v) => set({ isPlaying: v }),
      setPlaySpeed:   (ms) => set({ playSpeed: ms }),
      resetPlayback:  () => set({ currentStep: 0, totalSteps: 0, isPlaying: false }),

      // Results
      cpuResult:      null,
      memoryResult:   null,
      diskResult:     null,
      deadlockResult: null,
      setCpuResult:      (r) => set({ cpuResult: r }),
      setMemoryResult:   (r) => set({ memoryResult: r }),
      setDiskResult:     (r) => set({ diskResult: r }),
      setDeadlockResult: (r) => set({ deadlockResult: r }),

      // History
      history: [],
      setHistory: (h) => set({ history: h }),
      addHistory: (h) => set({ history: [h, ...get().history].slice(0, 100) }),

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
    }),
    {
      name: 'kronos-state',
      partialize: (s) => ({ theme: s.theme, sidebarOpen: s.sidebarOpen, playSpeed: s.playSpeed }),
    }
  )
)
