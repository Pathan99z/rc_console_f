import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { companiesApi, type CompanyItem, type CompanyPayload } from '@/modules/companies/services/companies.api'
import { usersApi, type UserItem } from '@/modules/users/services/users.api'
import type { Pagination } from '@/modules/users/services/users.api'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const useCompaniesStore = defineStore('companies', () => {
  const items = ref<CompanyItem[]>([])
  const pagination = ref<Pagination>(defaultPagination)
  const loading = ref(false)
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})
  const selected = ref<CompanyItem | null>(null)
  const assignableUsers = ref<UserItem[]>([])
  const search = ref('')
  const status = ref<number | ''>('')

  function isUserActive(statusValue: unknown): boolean {
    return statusValue === 'active' || statusValue === 1 || statusValue === '1'
  }

  async function fetchCompanies(page = 1, perPage = 15) {
    loading.value = true
    try {
      const { data } = await companiesApi.list({ page, per_page: perPage, search: search.value || undefined, status: status.value })
      items.value = data.data.items
      pagination.value = data.data.pagination
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function createCompany(payload: CompanyPayload) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await companiesApi.create(payload)
      message.value = data.message
      await fetchCompanies(pagination.value.current_page, pagination.value.per_page)
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function updateCompany(companyId: number, payload: CompanyPayload) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await companiesApi.update(companyId, payload)
      message.value = data.message
      const index = items.value.findIndex((item) => item.id === companyId)
      if (index >= 0) items.value[index] = data.data.company
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function deleteCompany(companyId: number) {
    loading.value = true
    try {
      const { data } = await companiesApi.remove(companyId)
      message.value = data.message
      items.value = items.value.filter((item) => item.id !== companyId)
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function fetchCompanyDetail(companyId: number) {
    loading.value = true
    try {
      const { data } = await companiesApi.detail(companyId)
      selected.value = data.data.company
      return selected.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function importCompanies(file: File, tenantId?: number) {
    loading.value = true
    try {
      const { data } = await companiesApi.importCsv(file, tenantId)
      message.value = data.message
      await fetchCompanies(1, pagination.value.per_page)
      return data.data
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function exportCompanies(tenantId?: number | '') {
    loading.value = true
    try {
      const response = await companiesApi.exportCsv({
        search: search.value || undefined,
        status: status.value,
        tenant_id: tenantId,
      })
      return response.data as Blob
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function fetchAssignableUsers() {
    try {
      const { data } = await usersApi.list(100, 1)
      assignableUsers.value = data.data.items.filter((user) => isUserActive(user.status))
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    }
  }

  return {
    items,
    pagination,
    loading,
    message,
    errors,
    selected,
    assignableUsers,
    search,
    status,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    fetchCompanyDetail,
    importCompanies,
    exportCompanies,
    fetchAssignableUsers,
  }
})
