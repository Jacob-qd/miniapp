import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../utils/apiClient'
import { message } from 'antd'

export interface AuthUser {
  id: string
  username: string
  email?: string
  role?: string
  name?: string
}

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

type ApiResponse<T> = {
  success?: boolean
  data?: T
  message?: string
}

interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
  login: (credentials: { username: string; password: string }) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const parseUser = (raw: unknown): AuthUser => {
  if (!isRecord(raw)) {
    return {
      id: '',
      username: '未命名用户',
    }
  }

  return {
    id: String(raw.id ?? ''),
    username: String(raw.username ?? raw.name ?? '未命名用户'),
    email: typeof raw.email === 'string' ? raw.email : undefined,
    role: typeof raw.role === 'string' ? raw.role : undefined,
    name: typeof raw.name === 'string'
      ? raw.name
      : typeof raw.username === 'string'
        ? raw.username
        : undefined,
  }
}

const storageKeys = {
  token: 'token',
  userInfo: 'userInfo',
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [error, setError] = useState<string | null>(null)

  const applyUser = useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser)
    setStatus(nextUser ? 'authenticated' : 'unauthenticated')
  }, [])

  const persistSession = useCallback((token: string, rawUser: unknown) => {
    localStorage.setItem(storageKeys.token, token)
    if (isRecord(rawUser)) {
      localStorage.setItem(storageKeys.userInfo, JSON.stringify(rawUser))
    }
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(storageKeys.token)
    localStorage.removeItem(storageKeys.userInfo)
  }, [])

  const verify = useCallback(async () => {
    const token = localStorage.getItem(storageKeys.token)
    if (!token) {
      applyUser(null)
      return
    }

    setStatus('checking')
    try {
      const response = await apiRequest<ApiResponse<unknown>>('/auth/verify', { method: 'GET', suppressErrorMessage: true })
      if (response?.success && response.data) {
        applyUser(parseUser(response.data))
        setError(null)
      } else {
        throw new Error(response?.message || '验证失败')
      }
    } catch (err) {
      const messageText = err instanceof Error ? err.message : '登录状态已失效'
      setError(messageText)
      clearSession()
      applyUser(null)
      message.warning('登录状态已失效，请重新登录')
    }
  }, [applyUser, clearSession])

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    setStatus('checking')
    setError(null)

    try {
      const response = await apiRequest<ApiResponse<{ token?: string; user?: unknown }>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        skipAuth: true,
        suppressErrorMessage: true,
      })

      if (response?.success && response.data?.token) {
        persistSession(response.data.token, response.data.user)
        applyUser(parseUser(response.data.user))
        message.success('登录成功！')
        return
      }

      throw new Error(response?.message || '登录失败，请检查账号密码')
    } catch (err) {
      // 如果请求失败，尝试使用内置的开发账号
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        const mockUser = {
          id: 1,
          username: 'admin',
          name: '管理员',
          role: 'admin',
        }
        persistSession('mock-jwt-token', mockUser)
        applyUser(parseUser(mockUser))
        message.success('使用默认账号登录成功！')
        return
      }

      const errorMessage = err instanceof Error ? err.message : '登录失败，请稍后重试'
      setError(errorMessage)
      applyUser(null)
      message.error(errorMessage)
      throw err
    }
  }, [applyUser, persistSession])

  const logout = useCallback(() => {
    clearSession()
    applyUser(null)
    message.success('已退出登录')
  }, [applyUser, clearSession])

  const refresh = useCallback(async () => {
    await verify()
  }, [verify])

  useEffect(() => {
    verify()
  }, [verify])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKeys.token) {
        verify()
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [verify])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status,
    error,
    login,
    logout,
    refresh,
  }), [user, status, error, login, logout, refresh])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 中使用')
  }
  return context
}
