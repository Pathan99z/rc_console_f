import axios, { AxiosError } from 'axios'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '')
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 30000)
const TOKEN_KEY = 'accessToken'

export type ApiValidationErrors = Record<string, string[]>

export type ApiErrorPayload = {
  success?: boolean
  message?: string
  errors?: ApiValidationErrors
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: Number.isFinite(API_TIMEOUT_MS) ? API_TIMEOUT_MS : 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const status = error.response?.status
    const payload = error.response?.data
    const requestUrl = error.config?.url || ''

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('isAuth')
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    if (status === 403) {
      const message = payload?.message || 'Access denied.'
      const isSessionUserEndpoint = requestUrl === '/user' || requestUrl.endsWith('/user')
      if (isSessionUserEndpoint && !requestUrl.includes('/users')) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('isAuth')
        if (window.location.pathname !== '/login') {
          window.location.assign(`/login?notice=forbidden&msg=${encodeURIComponent(message)}`)
        }
      } else {
        window.dispatchEvent(
          new CustomEvent('rc:toast', { detail: { type: 'error' as const, message } })
        )
      }
    }

    return Promise.reject(error)
  }
)

export function toApiError(error: unknown): {
  status: number | null
  message: string
  fieldErrors: ApiValidationErrors
  isTooManyRequests: boolean
  isUnauthorized: boolean
  isForbidden: boolean
  isValidation: boolean
} {
  const axiosError = error as AxiosError<ApiErrorPayload>
  const status = axiosError.response?.status ?? null
  const payload = axiosError.response?.data

  return {
    status,
    message: payload?.message || axiosError.message || 'Something went wrong.',
    fieldErrors: payload?.errors || {},
    isTooManyRequests: status === 429,
    isUnauthorized: status === 401,
    isForbidden: status === 403,
    isValidation: status === 422,
  }
}
