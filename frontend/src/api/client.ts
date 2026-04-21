import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({ baseURL: BASE_URL })

const STORAGE_ACCESS = 'flowtrack:access_token'
const STORAGE_REFRESH = 'flowtrack:refresh_token'

export const storage = {
  getAccess: () => localStorage.getItem(STORAGE_ACCESS),
  getRefresh: () => localStorage.getItem(STORAGE_REFRESH),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(STORAGE_ACCESS, access)
    localStorage.setItem(STORAGE_REFRESH, refresh)
  },
  clear: () => {
    localStorage.removeItem(STORAGE_ACCESS)
    localStorage.removeItem(STORAGE_REFRESH)
  },
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storage.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise: Promise<string> | null = null

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = storage.getRefresh()
      if (!refreshToken) {
        storage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
          .then((r) => {
            storage.setTokens(r.data.access_token, r.data.refresh_token)
            return r.data.access_token
          })
          .catch(() => {
            storage.clear()
            window.location.href = '/login'
            throw error
          })
          .finally(() => {
            refreshPromise = null
          })
      }
      const newToken = await refreshPromise
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    }
    return Promise.reject(error)
  },
)
