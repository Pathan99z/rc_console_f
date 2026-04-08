import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/modules/auth/services/auth.api'
import { toApiError } from '@/core/http/apiClient'
import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
} from '@/modules/auth/types/auth.types'

const TOKEN_KEY = 'accessToken'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const loading = ref(false)
  const apiMessage = ref('')
  const errors = ref<Record<string, string[]>>({})

  const isAuthenticated = computed(() => Boolean(token.value))

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
      apiMessage.value = normalized.isTooManyRequests
        ? 'Too many attempts. Please try again later.'
        : normalized.message
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
      user.value = data.data.user
      localStorage.setItem('userName', data.data.user.name)
      apiMessage.value = data.message
      return data
    } catch (error) {
      const normalized = toApiError(error)
      apiMessage.value = normalized.isTooManyRequests
        ? 'Too many attempts. Please try again later.'
        : normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return null
    loading.value = true
    try {
      const { data } = await authApi.me()
      user.value = data.data.user
      localStorage.setItem('userName', data.data.user.name)
      return data.data.user
    } catch (error) {
      const normalized = toApiError(error)
      if (normalized.isUnauthorized || normalized.isForbidden) {
        setToken(null)
        user.value = null
      }
      return null
    } finally {
      loading.value = false
    }
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
      apiMessage.value = normalized.isTooManyRequests
        ? 'Too many attempts. Please try again later.'
        : normalized.message
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
      apiMessage.value = normalized.isTooManyRequests
        ? 'Too many attempts. Please try again later.'
        : normalized.message
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
      apiMessage.value = normalized.isTooManyRequests
        ? 'Too many attempts. Please try again later.'
        : normalized.message
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
    try {
      if (token.value) {
        await authApi.logout()
      }
    } finally {
      setToken(null)
      user.value = null
      localStorage.removeItem('userName')
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    errors,
    apiMessage,
    isAuthenticated,
    clearErrors,
    register,
    login,
    logout,
    fetchUser,
    forgotPassword,
    resetPassword,
    resendVerification,
    verifyEmail,
  }
})
