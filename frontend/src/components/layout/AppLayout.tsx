import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/time-entries': 'Registros de Tempo',
  '/time-entries/new': 'Novo Registro',
  '/categories': 'Categorias',
}

function usePageTitle() {
  const { pathname } = useLocation()
  if (titles[pathname]) return titles[pathname]
  if (pathname.includes('/edit')) return 'Editar Registro'
  return 'Flowtrack'
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title = usePageTitle()

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
