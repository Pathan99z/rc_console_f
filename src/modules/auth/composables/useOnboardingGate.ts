import { ref } from 'vue'
import type { ApiErrorPayload } from '@/core/http/apiClient'

const ONBOARDING_BLOCKED_KEY = 'rc:onboarding_blocked'

export const onboardingBlocked = ref(readBlocked())

function readBlocked(): boolean {
  try {
    return sessionStorage.getItem(ONBOARDING_BLOCKED_KEY) === '1'
  } catch {
    return false
  }
}

export function isOnboardingBlockedResponse(status: number | null | undefined, payload?: ApiErrorPayload | null): boolean {
  if (status !== 403 || !payload) return false
  const msg = (payload.message || '').toLowerCase()
  if (msg.includes('onboarding') && msg.includes('not complete')) return true
  const field = payload.errors?.onboarding_status
  if (Array.isArray(field) && field.length) return true
  return false
}

export function setOnboardingBlocked(blocked: boolean) {
  onboardingBlocked.value = blocked
  try {
    if (blocked) sessionStorage.setItem(ONBOARDING_BLOCKED_KEY, '1')
    else sessionStorage.removeItem(ONBOARDING_BLOCKED_KEY)
  } catch {
    /* ignore */
  }
}

export function clearOnboardingBlocked() {
  setOnboardingBlocked(false)
}

export function useOnboardingGate() {
  return {
    onboardingBlocked,
    setOnboardingBlocked,
    clearOnboardingBlocked,
    isOnboardingBlockedResponse,
  }
}
