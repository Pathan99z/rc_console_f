import { ref } from 'vue'
import { defineStore } from 'pinia'
import { tenantsApi, type TenantItem } from '@/modules/tenants/services/tenants.api'
import { toApiError } from '@/core/http/apiClient'
import type { Pagination } from '@/modules/users/services/users.api'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const useTenantsStore = defineStore('tenants', () => {
  const items = ref<TenantItem[]>([])
  const pagination = ref<Pagination>(defaultPagination)
  const loading = ref(false)
  const message = ref('')

  async function fetchTenants(page = 1, perPage = 15) {
    loading.value = true
    try {
      const { data } = await tenantsApi.list(perPage, page)
      items.value = data.data.items
      pagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(tenantId: number, status: 'active' | 'suspended') {
    loading.value = true
    try {
      const { data } = await tenantsApi.updateStatus(tenantId, status)
      message.value = data.message
      const index = items.value.findIndex((x) => x.id === tenantId)
      if (index >= 0) items.value[index] = data.data.tenant
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      loading.value = false
    }
  }

  return { items, pagination, loading, message, fetchTenants, updateStatus }
})
