import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { dashboardApi } from '@/modules/dashboard/services/dashboard.api'
import type { LoginDashboardPayload } from '@/modules/dashboard/types/loginDashboard.types'
import {
  resolveLoginDashboardProfile,
  unwrapLoginDashboardBody,
} from '@/modules/dashboard/utils/loginDashboardResponse'
import { profileFromUser } from '@/modules/dashboard/utils/loginDashboardProfile'

const CACHE_TTL_MS = 60_000

export const useLoginDashboardStore = defineStore('loginDashboard', () => {
  const message = ref('')
  const payload = ref<LoginDashboardPayload | null>(null)
  const loading = ref(false)
  const accessDenied = ref(false)
  const lastFetchedAt = ref<number | null>(null)

  function isCacheFresh() {
    if (!payload.value || !lastFetchedAt.value) return false
    return Date.now() - lastFetchedAt.value < CACHE_TTL_MS
  }

  async function fetchLoginDashboard(force = false) {
    if (!force && isCacheFresh()) return payload.value

    const authStore = useAuthStore()
    if (!authStore.token) return null

    loading.value = true
    accessDenied.value = false
    message.value = ''

    try {
      const { data: body } = await dashboardApi.getLoginDashboard()
      if (body && typeof body === 'object' && 'success' in body && body.success === false) {
        message.value = body.message || 'Unable to load dashboard.'
        throw new Error(message.value)
      }

      const parsed = unwrapLoginDashboardBody(body)
      if (!parsed) {
        message.value = 'Dashboard response could not be parsed.'
        throw new Error(message.value)
      }

      const user = authStore.user
      if (user) {
        parsed.dashboard_profile = resolveLoginDashboardProfile(
          parsed.dashboard_profile,
          user.role,
          user.navigation_profile ?? '',
        )
      } else if (!parsed.dashboard_profile) {
        parsed.dashboard_profile = profileFromUser(null)
      }

      payload.value = parsed
      message.value = (body as { message?: string }).message || ''
      lastFetchedAt.value = Date.now()
      return parsed
    } catch (error) {
      const err = toApiError(error)
      if (err.isForbidden) {
        accessDenied.value = true
        payload.value = null
      }
      if (!err.isForbidden) message.value = err.message
      throw error
    } finally {
      loading.value = false
    }
  }

  function clearLoginDashboard() {
    payload.value = null
    message.value = ''
    accessDenied.value = false
    lastFetchedAt.value = null
  }

  return {
    message,
    payload,
    loading,
    accessDenied,
    fetchLoginDashboard,
    clearLoginDashboard,
    isCacheFresh,
  }
})
