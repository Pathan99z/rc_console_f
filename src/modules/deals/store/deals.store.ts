import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { dealsApi, type DealItem, type DealStatusCode, type DealStatusLabel } from '@/modules/deals/services/deals.api'
import { usersApi, type UserItem } from '@/modules/users/services/users.api'
import { contactsApi, type ContactItem } from '@/modules/contacts/services/contacts.api'
import { companiesApi, type CompanyItem } from '@/modules/companies/services/companies.api'
import type { Pagination } from '@/modules/users/services/users.api'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const useDealsStore = defineStore('deals', () => {
  const items = ref<DealItem[]>([])
  const selected = ref<DealItem | null>(null)
  const pagination = ref<Pagination>(defaultPagination)
  const loading = ref(false)
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})
  const users = ref<UserItem[]>([])
  const contacts = ref<ContactItem[]>([])
  const companies = ref<CompanyItem[]>([])
  const filters = ref({
    pipeline_id: '' as number | '',
    pipeline_stage_id: '' as number | '',
    owner_user_id: '' as number | '',
    status: '' as DealStatusCode | '',
    search: '',
    tenant_id: '' as number | '',
  })

  function normalizeDeal(item: DealItem): DealItem {
    return {
      ...item,
      pipeline_stage_id: item.pipeline_stage_id ?? item.stage?.id ?? 0,
      owner_user_id: item.owner_user_id ?? item.owner?.id ?? null,
      currency_code: item.currency_code ?? null,
      probability: item.probability ?? null,
      value:
        item.value ??
        (item as DealItem & { estimated_value?: number | string | null }).estimated_value ??
        (item.company as CompanyItem | null | undefined)?.revenue ??
        null,
    }
  }

  function normalizeDeals(items: DealItem[]) {
    return items.map(normalizeDeal)
  }

  async function fetchDeals(page = 1, perPage = 15) {
    loading.value = true
    try {
      const { data } = await dealsApi.list({
        page,
        per_page: perPage,
        pipeline_id: filters.value.pipeline_id,
        pipeline_stage_id: filters.value.pipeline_stage_id,
        owner_user_id: filters.value.owner_user_id,
        status: filters.value.status,
        search: filters.value.search || undefined,
        tenant_id: filters.value.tenant_id,
      })
      items.value = normalizeDeals(data.data.items)
      pagination.value = data.data.pagination
      message.value = data.message
      return items.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function fetchDealDetail(dealId: number) {
    loading.value = true
    try {
      const { data } = await dealsApi.detail(dealId)
      const normalized = normalizeDeal(data.data.deal)
      selected.value = normalized
      return normalized
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function createDeal(payload: Parameters<typeof dealsApi.create>[0]) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await dealsApi.create(payload)
      message.value = data.message
      await fetchDeals(pagination.value.current_page, pagination.value.per_page)
      return normalizeDeal(data.data.deal)
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function updateDeal(dealId: number, payload: Parameters<typeof dealsApi.update>[1]) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await dealsApi.update(dealId, payload)
      message.value = data.message
      const normalized = normalizeDeal(data.data.deal)
      const index = items.value.findIndex((item) => item.id === dealId)
      if (index >= 0) items.value[index] = normalized
      if (selected.value?.id === dealId) selected.value = normalized
      return normalized
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function deleteDeal(dealId: number) {
    loading.value = true
    try {
      const { data } = await dealsApi.remove(dealId)
      message.value = data.message
      items.value = items.value.filter((item) => item.id !== dealId)
      if (selected.value?.id === dealId) selected.value = null
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function moveDealStage(dealId: number, stageId: number) {
    const existing = items.value.find((item) => item.id === dealId)
    if (existing) existing.pipeline_stage_id = stageId
    try {
      const { data } = await dealsApi.moveStage(dealId, stageId)
      message.value = data.message
      const index = items.value.findIndex((item) => item.id === dealId)
      if (index >= 0) items.value[index] = normalizeDeal(data.data.deal)
      return normalizeDeal(data.data.deal)
    } catch (error) {
      if (existing) await fetchDeals(pagination.value.current_page, pagination.value.per_page)
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    }
  }

  async function updateDealStatus(dealId: number, status: DealStatusLabel) {
    loading.value = true
    try {
      const { data } = await dealsApi.updateStatus(dealId, status)
      message.value = data.message
      const index = items.value.findIndex((item) => item.id === dealId)
      const normalized = normalizeDeal(data.data.deal)
      if (index >= 0) items.value[index] = normalized
      if (selected.value?.id === dealId) selected.value = normalized
      return normalized
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function fetchUsers() {
    try {
      const { data } = await usersApi.list(100, 1)
      users.value = data.data.items
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    }
  }

  async function fetchContacts() {
    try {
      const { data } = await contactsApi.list({ per_page: 100, page: 1 })
      contacts.value = data.data.items
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    }
  }

  async function fetchCompanies() {
    try {
      const { data } = await companiesApi.list({ per_page: 100, page: 1, status: 1 })
      companies.value = data.data.items
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    }
  }

  return {
    items,
    selected,
    pagination,
    loading,
    message,
    errors,
    users,
    contacts,
    companies,
    filters,
    fetchDeals,
    fetchDealDetail,
    createDeal,
    updateDeal,
    deleteDeal,
    moveDealStage,
    updateDealStatus,
    fetchUsers,
    fetchContacts,
    fetchCompanies,
  }
})
