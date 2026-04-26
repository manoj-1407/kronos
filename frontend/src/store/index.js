import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useStore = create()(persist((set, get) => ({
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
    totalSteps: 0,
    isPlaying: false,
    playSpeed: 400,
    setCurrentStep: (n) => set({ currentStep: n }),
    setTotalSteps: (n) => set({ totalSteps: n }),
    setIsPlaying: (v) => set({ isPlaying: v }),
    setPlaySpeed: (ms) => set({ playSpeed: ms }),
    resetPlayback: () => set({ currentStep: 0, totalSteps: 0, isPlaying: false }),
    // Results
    cpuResult: null,
    memoryResult: null,
    diskResult: null,
    deadlockResult: null,
    setCpuResult: (r) => set({ cpuResult: r }),
    setMemoryResult: (r) => set({ memoryResult: r }),
    setDiskResult: (r) => set({ diskResult: r }),
    setDeadlockResult: (r) => set({ deadlockResult: r }),
    // History
    history: [],
    setHistory: (h) => set({ history: h }),
    addHistory: (h) => set({ history: [h, ...get().history].slice(0, 100) }),
    // Sidebar
    sidebarOpen: true,
    setSidebarOpen: (v) => set({ sidebarOpen: v }),
}), {
    name: 'kronos-state',
    partialize: (s) => ({ theme: s.theme, sidebarOpen: s.sidebarOpen, playSpeed: s.playSpeed }),
}));
