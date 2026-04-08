import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { companiesApi, type CompanyItem } from '@/modules/companies/services/companies.api'
import type { Pagination } from '@/modules/users/services/users.api'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const useCompaniesStore = defineStore('companies', () => {
  const items = ref<CompanyItem[]>([])
  const pagination = ref<Pagination>(defaultPagination)
  const loading = ref(false)
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})
  const search = ref('')
  const status = ref<number | ''>('')

  async function fetchCompanies(page = 1, perPage = 15) {
    loading.value = true
    try {
      const { data } = await companiesApi.list({ page, per_page: perPage, search: search.value || undefined, status: status.value })
      items.value = data.data.items
      pagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function createCompany(payload: { name: string; email?: string; phone?: string; website?: string; status: number }) {
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

  async function updateCompany(companyId: number, payload: { name: string; email?: string; phone?: string; website?: string; status: number }) {
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

  return { items, pagination, loading, message, errors, search, status, fetchCompanies, createCompany, updateCompany, deleteCompany }
})
