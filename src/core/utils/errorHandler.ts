import { toApiError } from '@/core/http/apiClient'

export function toUiErrorMessage(error: unknown, fallback = 'Something went wrong.') {
  const normalized = toApiError(error)
  if (normalized.isTooManyRequests) return 'Too many requests. Please retry in a moment.'
  if (normalized.isForbidden) return normalized.message || 'You do not have permission for this action.'
  if (normalized.isUnauthorized) return 'Session expired. Please login again.'
  return normalized.message || fallback
}
