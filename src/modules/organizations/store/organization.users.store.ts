import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { organizationsApi } from '@/modules/organizations/services/organization.api'
import type {
  OrganizationUserInvitePayload,
  OrganizationUserItem,
  OrganizationUserStatus,
} from '@/modules/organizations/types/organization.users.types'
import type { Pagination } from '@/modules/users/services/users.api'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const useOrganizationUsersStore = defineStore('organizationUsers', () => {
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})
  const items = ref<OrganizationUserItem[]>([])
  const pagination = ref<Pagination>(defaultPagination)
  const loading = ref(false)
  const submitting = ref(false)
  const organizationId = ref<number | null>(null)

  async function fetchUsers(orgId: number, page = 1, perPage = 15) {
    organizationId.value = orgId
    loading.value = true
    errors.value = {}
    try {
      const { data } = await organizationsApi.listUsers(orgId, { page, per_page: perPage })
      items.value = data.data.items
      pagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      errors.value = n.fieldErrors
      throw n
    } finally {
      loading.value = false
    }
  }

  async function inviteUser(orgId: number, payload: OrganizationUserInvitePayload) {
    submitting.value = true
    errors.value = {}
    try {
      const { data } = await organizationsApi.inviteUser(orgId, payload)
      message.value = data.message
      await fetchUsers(orgId, pagination.value.current_page, pagination.value.per_page)
      return data.data
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      errors.value = n.fieldErrors
      throw n
    } finally {
      submitting.value = false
    }
  }

  async function updateUserStatus(orgId: number, userId: number, status: OrganizationUserStatus) {
    submitting.value = true
    try {
      const { data } = await organizationsApi.updateUserStatus(orgId, userId, { status })
      message.value = data.message
      await fetchUsers(orgId, pagination.value.current_page, pagination.value.per_page)
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    } finally {
      submitting.value = false
    }
  }

  async function resetUserPassword(orgId: number, userId: number) {
    submitting.value = true
    try {
      const { data } = await organizationsApi.resetUserPassword(orgId, userId)
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    } finally {
      submitting.value = false
    }
  }

  return {
    message,
    errors,
    items,
    pagination,
    loading,
    submitting,
    organizationId,
    fetchUsers,
    inviteUser,
    updateUserStatus,
    resetUserPassword,
  }
})
