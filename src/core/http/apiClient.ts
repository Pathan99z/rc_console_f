import axios, { AxiosError } from 'axios'
import { isOnboardingBlockedResponse, setOnboardingBlocked } from '@/modules/auth/composables/useOnboardingGate'

function normalizeLoopbackBaseUrl(rawBaseUrl: string | undefined): string | undefined {
  if (!rawBaseUrl) return undefined
  const trimmed = rawBaseUrl.replace(/\/+$/, '')
  try {
    const parsed = new URL(trimmed)
    const isLoopback = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost'
    const frontendHost = globalThis.location.hostname
    const frontendIsLoopback = frontendHost === '127.0.0.1' || frontendHost === 'localhost'
    if (isLoopback && frontendIsLoopback && parsed.hostname !== frontendHost) {
      parsed.hostname = frontendHost
      return parsed.toString().replace(/\/+$/, '')
    }
    return trimmed
  } catch {
    return trimmed
  }
}

const API_BASE_URL = normalizeLoopbackBaseUrl(import.meta.env.VITE_API_BASE_URL)
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
      if (globalThis.location.pathname !== '/login') {
        globalThis.location.assign('/login')
      }
    }

    if (status === 403) {
      const message = payload?.message || 'Access denied.'
      const isSessionUserEndpoint = requestUrl === '/user' || requestUrl.endsWith('/user')
      if (isOnboardingBlockedResponse(status, payload)) {
        setOnboardingBlocked(true)
        globalThis.dispatchEvent(new CustomEvent('rc:onboarding-blocked', { detail: { message } }))
      } else if (isSessionUserEndpoint && !requestUrl.includes('/users')) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('isAuth')
        if (globalThis.location.pathname !== '/login') {
          globalThis.location.assign(`/login?notice=forbidden&msg=${encodeURIComponent(message)}`)
        }
      } else {
        globalThis.dispatchEvent(
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
  const networkMessage = API_BASE_URL
    ? `Cannot reach API server at ${API_BASE_URL}. Check backend server and CORS settings.`
    : 'Cannot reach API server. Check VITE_API_BASE_URL and backend server.'

  return {
    status,
    message: payload?.message || (status === null ? networkMessage : axiosError.message) || 'Something went wrong.',
    fieldErrors: payload?.errors || {},
    isTooManyRequests: status === 429,
    isUnauthorized: status === 401,
    isForbidden: status === 403,
    isValidation: status === 422,
  }
}
