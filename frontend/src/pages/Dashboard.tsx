import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Clock, Plus } from 'lucide-react'
import { dashboardApi } from '@/api/dashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/feedback/Skeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { formatDuration, formatDate } from '@/lib/format'

export function Dashboard() {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.summary(),
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (isError || !data) {
    return <ErrorState onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-text-muted text-sm">{formatDate(data.date)}</p>
        <Button size="sm" onClick={() => navigate('/time-entries/new')}>
          <Plus size={16} /> Novo registro
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-primary" size={20} />
            <span className="text-sm font-medium text-text-muted">Hoje</span>
          </div>
          <p className="text-3xl font-bold text-text-base">
            {formatDuration(data.total_minutes_today)}
          </p>
        </Card>

        {data.total_by_category.slice(0, 2).map((cat) => (
          <Card key={cat.category_id}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-sm font-medium text-text-muted">{cat.name}</span>
            </div>
            <p className="text-3xl font-bold text-text-base">{formatDuration(cat.total_minutes)}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-base font-semibold text-text-base mb-4">Últimos 7 dias</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.last_7_days} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDate(v).slice(0, 5)}
              tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
            />
            <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
            <Tooltip
              formatter={(v: number) => [formatDuration(v), 'Total']}
              labelFormatter={(l: string) => formatDate(l)}
              contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }}
            />
            <Bar dataKey="total_minutes" radius={[4, 4, 0, 0]} fill="var(--color-primary)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {data.total_by_category.length > 0 && (
        <Card>
          <h2 className="text-base font-semibold text-text-base mb-4">Por categoria (hoje)</h2>
          <div className="space-y-3">
            {data.total_by_category.map((cat) => {
              const pct = data.total_minutes_today > 0
                ? Math.round((cat.total_minutes / data.total_minutes_today) * 100)
                : 0
              return (
                <div key={cat.category_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2 text-text-base">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="text-text-muted">{formatDuration(cat.total_minutes)}</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
