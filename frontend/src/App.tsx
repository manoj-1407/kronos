import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CPUPage from './pages/CPUPage'
import MemoryPage from './pages/MemoryPage'
import DiskPage from './pages/DiskPage'
import DeadlockPage from './pages/DeadlockPage'
import HistoryPage from './pages/HistoryPage'
import { useStore } from './store'

export default function App() {
  const theme = useStore(s => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  // System preference detection on first load
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    if (!localStorage.getItem('kronos-state')) {
      useStore.getState().setTheme(mq.matches ? 'dark' : 'light')
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index          element={<Dashboard />}   />
          <Route path="cpu"     element={<CPUPage />}     />
          <Route path="memory"  element={<MemoryPage />}  />
          <Route path="disk"    element={<DiskPage />}    />
          <Route path="deadlock"element={<DeadlockPage />}/>
          <Route path="history" element={<HistoryPage />} />
          <Route path="*"       element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
