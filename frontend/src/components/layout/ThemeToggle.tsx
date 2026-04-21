import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const options = [
    { value: 'light' as const, icon: <Sun size={16} />, label: 'Claro' },
    { value: 'dark' as const, icon: <Moon size={16} />, label: 'Escuro' },
    { value: 'system' as const, icon: <Monitor size={16} />, label: 'Sistema' },
  ]
  return (
    <div className="flex rounded-md border border-border overflow-hidden">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => setTheme(o.value)}
          aria-label={o.label}
          className={`flex items-center justify-center p-2 transition-colors ${
            theme === o.value
              ? 'bg-primary text-white'
              : 'bg-surface text-text-muted hover:text-text-base'
          }`}
        >
          {o.icon}
        </button>
      ))}
    </div>
  )
}
