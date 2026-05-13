import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/modules/auth/services/auth.api'
import { toApiError } from '@/core/http/apiClient'
import type { NavigationMenuItem, NavigationState } from '@/modules/auth/types/auth.types'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { canAccessNavItem } from '@/modules/auth/composables/useCapabilities'

const emptyNavigation: NavigationState = {
  menus: { crm: [], prm: [] },
  feature_flags: {},
  navigation_profile: null,
}

export const useNavigationStore = defineStore('navigation', () => {
  const state = ref<NavigationState>(emptyNavigation)
  const loading = ref(false)
  const initialized = ref(false)
  const message = ref('')

  const mergedFeatureFlags = computed(() => {
    const auth = useAuthStore()
    return {
      ...auth.user?.feature_flags,
      ...state.value.feature_flags,
    }
  })

  const visibleCrmMenus = computed(() => {
    const auth = useAuthStore()
    return (state.value.menus.crm || []).filter((item) => canAccessNavItem(auth.user, item, mergedFeatureFlags.value))
  })

  const visiblePrmMenus = computed(() => {
    const auth = useAuthStore()
    return (state.value.menus.prm || []).filter((item) => canAccessNavItem(auth.user, item, mergedFeatureFlags.value))
  })

  const flatVisibleMenus = computed<NavigationMenuItem[]>(() => [...visibleCrmMenus.value, ...visiblePrmMenus.value])

  async function fetchNavigation() {
    loading.value = true
    try {
      const { data } = await authApi.navigation()
      state.value = {
        menus: {
          crm: data.data.menus?.crm || [],
          prm: data.data.menus?.prm || [],
        },
        feature_flags: data.data.feature_flags || {},
        navigation_profile: data.data.navigation_profile || null,
      }
      message.value = data.message
      initialized.value = true
      return state.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      state.value = emptyNavigation
      throw normalized
    } finally {
      loading.value = false
    }
  }

  function reset() {
    state.value = emptyNavigation
    initialized.value = false
  }

  return {
    state,
    loading,
    initialized,
    message,
    mergedFeatureFlags,
    visibleCrmMenus,
    visiblePrmMenus,
    flatVisibleMenus,
    fetchNavigation,
    reset,
  }
})
