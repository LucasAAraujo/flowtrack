import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { timeEntriesApi } from '@/api/timeEntries'
import { categoriesApi } from '@/api/categories'
import { timeEntrySchema, type TimeEntryForm as TForm } from '@/schemas'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/feedback/Spinner'
import { extractApiError, formatDuration, todayISO } from '@/lib/format'

export function TimeEntryForm() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  })

  const { data: existing, isLoading: loadingEntry } = useQuery({
    queryKey: ['time-entry', id],
    queryFn: () => timeEntriesApi.get(id!),
    enabled: isEdit,
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TForm>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: { date: todayISO(), start_time: '09:00', end_time: '10:00' },
  })

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        description: existing.description || '',
        category_id: existing.category_id,
        date: existing.date,
        start_time: existing.start_time.slice(0, 5),
        end_time: existing.end_time.slice(0, 5),
      })
    }
  }, [existing, reset])

  const startTime = watch('start_time')
  const endTime = watch('end_time')
  const previewMinutes =
    startTime && endTime && endTime > startTime
      ? (() => {
          const [sh, sm] = startTime.split(':').map(Number)
          const [eh, em] = endTime.split(':').map(Number)
          return (eh * 60 + em) - (sh * 60 + sm)
        })()
      : null

  const mutation = useMutation({
    mutationFn: (data: TForm) =>
      isEdit
        ? timeEntriesApi.update(id!, data)
        : timeEntriesApi.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Registro atualizado!' : 'Registro criado!')
      qc.invalidateQueries({ queryKey: ['time-entries'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      navigate('/time-entries')
    },
    onError: (err) => toast.error(extractApiError(err)),
  })

  if (isEdit && loadingEntry) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  }

  const categoryOptions = (categories || []).map((c) => ({ value: c.id, label: c.name }))

  return (
    <Card className="max-w-lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Input label="Título" {...register('title')} error={errors.title?.message} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-base" htmlFor="description">
            Descrição <span className="text-text-muted font-normal">(opcional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className="rounded-md border border-border px-3 py-2 text-sm bg-surface text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
        <Select
          label="Categoria"
          options={categoryOptions}
          placeholder="Selecione uma categoria"
          {...register('category_id')}
          error={errors.category_id?.message}
        />
        <Input label="Data" type="date" {...register('date')} error={errors.date?.message} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Início" type="time" {...register('start_time')} error={errors.start_time?.message} />
          <Input label="Término" type="time" {...register('end_time')} error={errors.end_time?.message} />
        </div>
        {previewMinutes !== null && (
          <p className="text-sm text-text-muted">
            Duração: <span className="font-semibold text-primary">{formatDuration(previewMinutes)}</span>
          </p>
        )}
        {errors.end_time && <p className="text-xs text-danger">{errors.end_time.message}</p>}
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSubmitting || mutation.isPending}>
            {isEdit ? 'Salvar alterações' : 'Criar registro'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/time-entries')}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
