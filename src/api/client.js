import axios from 'axios'
import { env } from '@/config/env'
import { STORAGE_KEYS } from '@/config/storageKeys'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl || undefined,
  timeout: Number.isFinite(env.apiTimeoutMs) ? env.apiTimeoutMs : 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export default apiClient
