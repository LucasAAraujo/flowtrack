import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Clock, Tag, X } from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const links = [
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/time-entries', icon: <Clock size={18} />, label: 'Registros' },
  { to: '/categories', icon: <Tag size={18} />, label: 'Categorias' },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-surface border-r border-border z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Flowtrack" className="w-7 h-7" />
            <span className="font-bold text-text-base text-lg">Flowtrack</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-text-muted hover:text-text-base">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-muted hover:text-text-base hover:bg-border'
                }`
              }
            >
              {l.icon}
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
