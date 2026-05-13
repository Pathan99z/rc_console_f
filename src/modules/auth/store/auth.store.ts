import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/modules/auth/services/auth.api'
import { toApiError } from '@/core/http/apiClient'
import { useNavigationStore } from '@/modules/auth/store/navigation.store'
import type {
  CapabilityProfile,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
} from '@/modules/auth/types/auth.types'

const TOKEN_KEY = 'accessToken'

const defaultCapabilityProfile: CapabilityProfile = {
  role: 'user',
  roles: [],
  permissions: [],
  navigation_profile: null,
  feature_flags: {},
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const loading = ref(false)
  const hydrating = ref(false)
  const hydrated = ref(false)
  const apiMessage = ref('')
  const errors = ref<Record<string, string[]>>({})

  const isAuthenticated = computed(() => Boolean(token.value) && Boolean(user.value))
  const capabilityProfile = computed<CapabilityProfile>(() => {
    const source = user.value
    if (!source) return defaultCapabilityProfile
    return {
      role: source.role,
      roles: source.roles?.length ? source.roles : [source.role],
      permissions: source.permissions || [],
      navigation_profile: source.navigation_profile || null,
      feature_flags: source.feature_flags || {},
    }
  })

  function setToken(value: string | null) {
    token.value = value
    if (value) {
      localStorage.setItem(TOKEN_KEY, value)
      localStorage.setItem('isAuth', 'true')
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('isAuth')
    }
  }

  function setUser(value: User | null) {
    user.value = value
    if (value?.name) localStorage.setItem('userName', value.name)
  }

  function clearErrors() {
    errors.value = {}
    apiMessage.value = ''
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    clearErrors()
    try {
      const { data } = await authApi.register(payload)
      apiMessage.value = data.message
      return data
    } catch (error) {
      const normalized = toApiError(error)
      apiMessage.value = normalized.isTooManyRequests ? 'Too many attempts. Please try again later.' : normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    clearErrors()
    try {
      const { data } = await authApi.login(payload)
      setToken(data.data.token)
      setUser(data.data.user)
      apiMessage.value = data.message
      await hydrateSession(true)
      return data
    } catch (error) {
      const normalized = toApiError(error)
      apiMessage.value = normalized.isTooManyRequests ? 'Too many attempts. Please try again later.' : normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return null
    const { data } = await authApi.me()
    setUser(data.data.user)
    return data.data.user
  }

  async function hydrateSession(force = false) {
    if (hydrating.value) return isAuthenticated.value
    if (!force && hydrated.value) return isAuthenticated.value
    if (!token.value) {
      hydrated.value = true
      setUser(null)
      return false
    }

    hydrating.value = true
    const navigationStore = useNavigationStore()
    try {
      await fetchUser()
      await navigationStore.fetchNavigation()
      hydrated.value = true
      return true
    } catch (error) {
      const normalized = toApiError(error)
      apiMessage.value = normalized.message
      if (normalized.isUnauthorized || normalized.isForbidden || normalized.status === null) {
        setToken(null)
        setUser(null)
        navigationStore.reset()
      }
      hydrated.value = true
      return false
    } finally {
      hydrating.value = false
    }
  }

  function getDefaultRoute() {
    const navigationStore = useNavigationStore()
    const preferred = navigationStore.flatVisibleMenus[0]?.route
    if (preferred) return preferred
    const profile = capabilityProfile.value.navigation_profile
    if (profile?.startsWith('partner')) return '/app/prm/dashboard'
    return '/app/dashboard'
  }

  async function resendVerification() {
    loading.value = true
    clearErrors()
    try {
      const { data } = await authApi.resendVerification()
      apiMessage.value = data.message
      return data
    } catch (error) {
      const normalized = toApiError(error)
      apiMessage.value = normalized.isTooManyRequests ? 'Too many attempts. Please try again later.' : normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function forgotPassword(payload: ForgotPasswordPayload) {
    loading.value = true
    clearErrors()
    try {
      const { data } = await authApi.forgotPassword(payload)
      apiMessage.value = data.message
      return data
    } catch (error) {
      const normalized = toApiError(error)
      apiMessage.value = normalized.isTooManyRequests ? 'Too many attempts. Please try again later.' : normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(payload: ResetPasswordPayload) {
    loading.value = true
    clearErrors()
    try {
      const { data } = await authApi.resetPassword(payload)
      apiMessage.value = data.message
      return data
    } catch (error) {
      const normalized = toApiError(error)
      apiMessage.value = normalized.isTooManyRequests ? 'Too many attempts. Please try again later.' : normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function verifyEmail(pathWithQuery: string) {
    loading.value = true
    clearErrors()
    try {
      const { data } = await authApi.verifyEmail(pathWithQuery)
      apiMessage.value = data.message
      return data
    } catch (error) {
      const normalized = toApiError(error)
      apiMessage.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    const navigationStore = useNavigationStore()
    try {
      if (token.value) await authApi.logout()
    } finally {
      setToken(null)
      setUser(null)
      navigationStore.reset()
      hydrated.value = true
      localStorage.removeItem('userName')
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    hydrating,
    hydrated,
    errors,
    apiMessage,
    isAuthenticated,
    capabilityProfile,
    setToken,
    setUser,
    clearErrors,
    register,
    login,
    logout,
    fetchUser,
    hydrateSession,
    getDefaultRoute,
    forgotPassword,
    resetPassword,
    resendVerification,
    verifyEmail,
  }
})
