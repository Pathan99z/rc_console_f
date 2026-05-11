import { toApiError } from '@/core/http/apiClient'

const RETRYABLE_STATUS = new Set([429, 503])
const DEFAULT_MAX_ATTEMPTS = 3
const DEFAULT_BASE_DELAY_MS = 400

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: { maxAttempts?: number; baseDelayMs?: number }
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS
  const baseDelayMs = options?.baseDelayMs ?? DEFAULT_BASE_DELAY_MS
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const normalized = toApiError(error)
      if (!RETRYABLE_STATUS.has(normalized.status ?? 0) || attempt === maxAttempts) {
        throw error
      }
      await sleep(baseDelayMs * attempt)
    }
  }

  throw lastError
}
