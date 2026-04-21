import { api } from './client'
import type { DashboardSummary } from '@/types'

export const dashboardApi = {
  summary: (date?: string) =>
    api.get<DashboardSummary>('/dashboard/summary', { params: date ? { date } : {} }).then((r) => r.data),
}
