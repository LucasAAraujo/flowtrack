import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi } from '@/api/auth'
import { storage } from '@/api/client'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (access: string, refresh: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const rehydrate = useCallback(async () => {
    const token = storage.getAccess()
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const me = await authApi.me()
      setUser(me)
    } catch {
      storage.clear()
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    rehydrate()
  }, [rehydrate])

  const login = async (access: string, refresh: string) => {
    storage.setTokens(access, refresh)
    const me = await authApi.me()
    setUser(me)
  }

  const logout = () => {
    storage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
