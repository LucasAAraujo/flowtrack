import { api } from './client'
import type { TimeEntry, TimeEntryIn, TimeEntryUpdate, PaginatedTimeEntries } from '@/types'

export interface TimeEntryFilters {
  date_from?: string
  date_to?: string
  category_id?: string
  page?: number
  page_size?: number
}

export const timeEntriesApi = {
  list: (filters: TimeEntryFilters = {}) =>
    api.get<PaginatedTimeEntries>('/time-entries', { params: filters }).then((r) => r.data),

  get: (id: string) => api.get<TimeEntry>(`/time-entries/${id}`).then((r) => r.data),

  create: (data: TimeEntryIn) => api.post<TimeEntry>('/time-entries', data).then((r) => r.data),

  update: (id: string, data: TimeEntryUpdate) =>
    api.put<TimeEntry>(`/time-entries/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/time-entries/${id}`),
}
