import { api } from './client'
import type { Category, CategoryIn, CategoryUpdate } from '@/types'

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories').then((r) => r.data),

  get: (id: string) => api.get<Category>(`/categories/${id}`).then((r) => r.data),

  create: (data: CategoryIn) => api.post<Category>('/categories', data).then((r) => r.data),

  update: (id: string, data: CategoryUpdate) =>
    api.put<Category>(`/categories/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/categories/${id}`),
}
