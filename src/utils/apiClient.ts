import { message } from 'antd'

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

const resolveBaseUrl = () => {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
  const configured = env?.VITE_API_BASE_URL
  if (configured) {
    return configured
  }

  const mode = env?.MODE
  return mode === 'production'
    ? 'https://your-api-domain.com/api'
    : 'http://localhost:3001/api'
}

export const API_BASE_URL = resolveBaseUrl()

type RequestOptions = Omit<RequestInit, 'headers'> & {
  skipAuth?: boolean
  suppressErrorMessage?: boolean
  headers?: HeadersInit
}

const extractMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const messageValue = record.message ?? record.error
    if (typeof messageValue === 'string') {
      return messageValue
    }
  }
  return fallback
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, suppressErrorMessage = false, headers, body, ...rest } = options
  const url = `${API_BASE_URL}${path}`
  const requestHeaders = new Headers(headers)

  if (body && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (!skipAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      body,
    })

    const text = await response.text()
    let data: unknown = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
    }

    if (!response.ok) {
      const errorMessage = extractMessage(data, response.statusText)
      if (!suppressErrorMessage) {
        message.error(errorMessage)
      }
      throw new ApiError(errorMessage, response.status, data)
    }

    return data as T
  } catch (error) {
    if (!suppressErrorMessage) {
      const errorMessage = error instanceof Error ? error.message : '请求失败，请稍后重试'
      message.error(errorMessage)
    }
    throw error
  }
}
