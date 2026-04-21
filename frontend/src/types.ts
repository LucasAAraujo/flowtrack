export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface Category {
  id: string
  name: string
  color: string
  created_at: string
  entry_count: number
}

export interface CategoryIn {
  name: string
  color: string
}

export interface CategoryUpdate {
  name?: string
  color?: string
}

export interface TimeEntry {
  id: string
  category_id: string
  title: string
  description?: string | null
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  created_at: string
  updated_at: string
  category_name?: string | null
  category_color?: string | null
}

export interface TimeEntryIn {
  title: string
  description?: string
  category_id: string
  date: string
  start_time: string
  end_time: string
}

export interface TimeEntryUpdate {
  title?: string
  description?: string
  category_id?: string
  date?: string
  start_time?: string
  end_time?: string
}

export interface PaginatedTimeEntries {
  items: TimeEntry[]
  total: number
  page: number
  page_size: number
}

export interface DashboardSummary {
  date: string
  total_minutes_today: number
  total_by_category: Array<{
    category_id: string
    name: string
    color: string
    total_minutes: number
  }>
  last_7_days: Array<{
    date: string
    total_minutes: number
  }>
}
