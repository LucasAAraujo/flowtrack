import { Menu, LogOut } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/lib/format'

interface HeaderProps {
  title: string
  onMenuClick: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border h-14">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-text-muted hover:text-text-base"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-text-base">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user && (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold"
              title={user.name}
            >
              {getInitials(user.name)}
            </div>
            <button
              onClick={logout}
              className="text-text-muted hover:text-danger transition-colors"
              aria-label="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
