import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit2, Trash2, Tag } from 'lucide-react'
import { categoriesApi } from '@/api/categories'
import { categorySchema, type CategoryForm } from '@/schemas'
import type { Category } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SkeletonCard } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { extractApiError } from '@/lib/format'

const PRESET_COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#F97316', '#EC4899',
]

function CategoryModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing?: Category
}) {
  const qc = useQueryClient()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: editing?.name || '', color: editing?.color || '#6366F1' },
  })

  const selectedColor = watch('color')

  const mutation = useMutation({
    mutationFn: (data: CategoryForm) =>
      editing ? categoriesApi.update(editing.id, data) : categoriesApi.create(data),
    onSuccess: () => {
      toast.success(editing ? 'Categoria atualizada!' : 'Categoria criada!')
      qc.invalidateQueries({ queryKey: ['categories'] })
      reset()
      onClose()
    },
    onError: (err) => toast.error(extractApiError(err)),
  })

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar categoria' : 'Nova categoria'}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Input label="Nome" {...register('name')} error={errors.name?.message} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-base">Cor</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('color', c)}
                className={`w-7 h-7 rounded-full transition-transform ${selectedColor === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
          <Input
            label="Hex personalizado"
            {...register('color')}
            error={errors.color?.message}
            placeholder="#RRGGBB"
          />
        </div>
        <div className="flex gap-3 pt-1">
          <Button type="submit" loading={isSubmitting || mutation.isPending}>
            {editing ? 'Salvar' : 'Criar'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function Categories() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      toast.success('Categoria excluída')
      qc.invalidateQueries({ queryKey: ['categories'] })
      setDeleteId(null)
    },
    onError: (err) => {
      toast.error(extractApiError(err))
      setDeleteId(null)
    },
  })

  const openCreate = () => { setEditing(undefined); setModalOpen(true) }
  const openEdit = (cat: Category) => { setEditing(cat); setModalOpen(true) }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus size={16} /> Nova categoria
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState
          icon={<Tag size={48} />}
          title="Nenhuma categoria ainda"
          description="Crie categorias para organizar seus registros de tempo."
          cta={{ label: 'Nova categoria', onClick: openCreate }}
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((cat) => (
            <div
              key={cat.id}
              className="bg-surface rounded-lg border border-border p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <p className="font-medium text-text-base">{cat.name}</p>
                  <p className="text-xs text-text-muted">{cat.entry_count} registro(s)</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 text-text-muted hover:text-primary transition-colors"
                  aria-label="Editar"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => setDeleteId(cat.id)}
                  className="p-1.5 text-text-muted hover:text-danger transition-colors"
                  aria-label="Excluir"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Excluir categoria"
        description="Tem certeza? Categorias com registros não podem ser excluídas."
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
