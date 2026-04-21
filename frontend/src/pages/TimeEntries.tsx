import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2, Clock } from 'lucide-react'
import { timeEntriesApi } from '@/api/timeEntries'
import { categoriesApi } from '@/api/categories'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SkeletonRow } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { formatDuration, formatDate, formatTime, extractApiError } from '@/lib/format'

export function TimeEntries() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['time-entries', page, dateFrom, dateTo, categoryFilter],
    queryFn: () =>
      timeEntriesApi.list({
        page,
        page_size: 20,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        category_id: categoryFilter || undefined,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => timeEntriesApi.delete(id),
    onSuccess: () => {
      toast.success('Registro excluído')
      qc.invalidateQueries({ queryKey: ['time-entries'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      setDeleteId(null)
    },
    onError: (err) => {
      toast.error(extractApiError(err))
      setDeleteId(null)
    },
  })

  const categoryOptions = (categories || []).map((c) => ({ value: c.id, label: c.name }))
  const totalPages = data ? Math.ceil(data.total / 20) : 1

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="flex-1"
            aria-label="De"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="flex-1"
            aria-label="Até"
          />
        </div>
        <Select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          options={categoryOptions}
          placeholder="Todas as categorias"
          className="sm:w-48"
        />
        <Button onClick={() => navigate('/time-entries/new')}>
          <Plus size={16} /> Novo
        </Button>
      </div>

      {isLoading && (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          icon={<Clock size={48} />}
          title="Nenhum registro encontrado"
          description="Comece criando seu primeiro registro de tempo."
          cta={{ label: 'Novo registro', onClick: () => navigate('/time-entries/new') }}
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-left text-text-muted">
                    <th className="px-4 py-3 font-medium">Título</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Categoria</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Data</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Horário</th>
                    <th className="px-4 py-3 font-medium">Duração</th>
                    <th className="px-4 py-3 font-medium w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((entry) => (
                    <tr key={entry.id} className="hover:bg-bg transition-colors">
                      <td className="px-4 py-3 text-text-base font-medium">{entry.title}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1.5 text-text-muted">
                          {entry.category_color && (
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.category_color }} />
                          )}
                          {entry.category_name || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted hidden md:table-cell">{formatDate(entry.date)}</td>
                      <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                        {formatTime(entry.start_time)} – {formatTime(entry.end_time)}
                      </td>
                      <td className="px-4 py-3 text-text-base font-medium">{formatDuration(entry.duration_minutes)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => navigate(`/time-entries/${entry.id}/edit`)}
                            className="p-1.5 text-text-muted hover:text-primary transition-colors"
                            aria-label="Editar"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteId(entry.id)}
                            className="p-1.5 text-text-muted hover:text-danger transition-colors"
                            aria-label="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>Total: {data.total} registro(s)</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Anterior
                </Button>
                <span className="flex items-center px-2">{page} / {totalPages}</span>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Excluir registro"
        description="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
