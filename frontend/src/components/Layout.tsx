import { Outlet } from 'react-router-dom'
import { useStore } from '../store'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const open = useStore(s => s.sidebarOpen)
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--void)' }}>
      <Sidebar />
      <div
        className="flex flex-col flex-1 overflow-hidden transition-all duration-300"
        style={{ marginLeft: open ? 240 : 64 }}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-6 grid-bg">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
