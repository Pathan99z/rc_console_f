import { ref } from 'vue'
import { defineStore } from 'pinia'
import { usersApi, type Pagination, type UserItem } from '@/modules/users/services/users.api'
import { toApiError } from '@/core/http/apiClient'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const useUsersStore = defineStore('users', () => {
  const items = ref<UserItem[]>([])
  const pagination = ref<Pagination>(defaultPagination)
  const loading = ref(false)
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})

  async function fetchUsers(page = 1, perPage = 15) {
    loading.value = true
    try {
      const { data } = await usersApi.list(perPage, page)
      items.value = data.data.items
      pagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.isTooManyRequests
        ? 'Too many attempts. Please try again later.'
        : normalized.isForbidden
          ? normalized.message || 'You do not have access to this resource.'
          : normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function createUser(payload: Parameters<typeof usersApi.create>[0]) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await usersApi.create(payload)
      message.value = data.message
      await fetchUsers(pagination.value.current_page, pagination.value.per_page)
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(userId: number, status: 'active' | 'inactive') {
    loading.value = true
    try {
      const { data } = await usersApi.updateStatus(userId, status)
      message.value = data.message
      const index = items.value.findIndex((x) => x.id === userId)
      if (index >= 0) items.value[index] = data.data.user
    } finally {
      loading.value = false
    }
  }

  async function updateRole(userId: number, role: 'user' | 'company_admin') {
    loading.value = true
    try {
      const { data } = await usersApi.updateRole(userId, role)
      message.value = data.message
      const index = items.value.findIndex((x) => x.id === userId)
      if (index >= 0) items.value[index] = data.data.user
    } finally {
      loading.value = false
    }
  }

  return { items, pagination, loading, message, errors, fetchUsers, createUser, updateStatus, updateRole }
})
