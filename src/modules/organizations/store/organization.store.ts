import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { toApiError } from '@/core/http/apiClient'
import { organizationsApi } from '@/modules/organizations/services/organization.api'
import type {
  OrganizationItem,
  OrganizationListQuery,
  OrganizationOnboardingStatus,
  OrganizationStatus,
  OrganizationType,
} from '@/modules/organizations/types/organization.types'
import type { Pagination } from '@/modules/users/services/users.api'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const useOrganizationStore = defineStore('organizations', () => {
  const items = ref<OrganizationItem[]>([])
  const current = ref<OrganizationItem | null>(null)
  const loading = ref(false)
  const detailLoading = ref(false)
  const submitting = ref(false)
  const actionLoading = ref<Record<string, boolean>>({})
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})
  const pagination = ref<Pagination>(defaultPagination)

  const filters = reactive<Required<Pick<OrganizationListQuery, 'search' | 'type' | 'status' | 'onboarding_status'>>>({
    search: '',
    type: '',
    status: '',
    onboarding_status: '',
  })

  const parentOptions = computed(() => {
    return items.value.map((item) => ({
      id: item.id,
      label: item.display_name || item.legal_name,
      type: item.type,
    }))
  })

  async function fetchOrganizations(page = 1, perPage = 15, tenantId?: number | '') {
    loading.value = true
    try {
      const { data } = await organizationsApi.list({
        page,
        per_page: perPage,
        search: filters.search || undefined,
        type: filters.type,
        status: filters.status,
        onboarding_status: filters.onboarding_status,
        tenant_id: tenantId,
      })
      items.value = data.data.items
      pagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.isForbidden ? 'You do not have access to organizations.' : normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function fetchOrganization(organizationId: number) {
    detailLoading.value = true
    try {
      const { data } = await organizationsApi.detail(organizationId)
      current.value = data.data.organization
      message.value = data.message
      return current.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      detailLoading.value = false
    }
  }

  async function createOrganization(payload: Parameters<typeof organizationsApi.create>[0]) {
    submitting.value = true
    errors.value = {}
    try {
      const { data } = await organizationsApi.create(payload)
      message.value = data.message
      await fetchOrganizations(pagination.value.current_page, pagination.value.per_page)
      return data.data.organization
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      submitting.value = false
    }
  }

  async function updateOrganization(organizationId: number, payload: Parameters<typeof organizationsApi.update>[1]) {
    submitting.value = true
    errors.value = {}
    try {
      const { data } = await organizationsApi.update(organizationId, payload)
      message.value = data.message
      current.value = data.data.organization
      await fetchOrganizations(pagination.value.current_page, pagination.value.per_page)
      return current.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      submitting.value = false
    }
  }

  async function updateStatus(organizationId: number, status: OrganizationStatus) {
    actionLoading.value[`status-${organizationId}`] = true
    try {
      const { data } = await organizationsApi.updateStatus(organizationId, status)
      message.value = data.message
      replaceItem(data.data.organization)
      return data.data.organization
    } finally {
      actionLoading.value[`status-${organizationId}`] = false
    }
  }

  async function approveOrganization(organizationId: number) {
    actionLoading.value[`approve-${organizationId}`] = true
    try {
      const { data } = await organizationsApi.approve(organizationId)
      message.value = data.message
      replaceItem(data.data.organization)
      return data.data.organization
    } finally {
      actionLoading.value[`approve-${organizationId}`] = false
    }
  }

  async function rejectOrganization(organizationId: number, reason: string) {
    actionLoading.value[`reject-${organizationId}`] = true
    try {
      const { data } = await organizationsApi.reject(organizationId, reason)
      message.value = data.message
      replaceItem(data.data.organization)
      return data.data.organization
    } finally {
      actionLoading.value[`reject-${organizationId}`] = false
    }
  }

  async function suspendOrganization(organizationId: number) {
    actionLoading.value[`suspend-${organizationId}`] = true
    try {
      const { data } = await organizationsApi.suspend(organizationId)
      message.value = data.message
      replaceItem(data.data.organization)
      return data.data.organization
    } finally {
      actionLoading.value[`suspend-${organizationId}`] = false
    }
  }

  function replaceItem(next: OrganizationItem) {
    const index = items.value.findIndex((item) => item.id === next.id)
    if (index >= 0) items.value[index] = next
    if (current.value?.id === next.id) current.value = next
  }

  function clearFilters() {
    filters.search = ''
    filters.type = ''
    filters.status = ''
    filters.onboarding_status = ''
  }

  function isActionBusy(action: 'approve' | 'reject' | 'suspend' | 'status', id: number) {
    return !!actionLoading.value[`${action}-${id}`]
  }

  return {
    items,
    current,
    loading,
    detailLoading,
    submitting,
    actionLoading,
    message,
    errors,
    pagination,
    filters,
    parentOptions,
    fetchOrganizations,
    fetchOrganization,
    createOrganization,
    updateOrganization,
    updateStatus,
    approveOrganization,
    rejectOrganization,
    suspendOrganization,
    clearFilters,
    isActionBusy,
  }
})
