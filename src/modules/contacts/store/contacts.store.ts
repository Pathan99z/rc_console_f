import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { contactsApi, type ContactItem } from '@/modules/contacts/services/contacts.api'
import { usersApi, type UserItem } from '@/modules/users/services/users.api'
import { companiesApi, type CompanyItem } from '@/modules/companies/services/companies.api'
import type { Pagination } from '@/modules/users/services/users.api'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }
const stageCodeMap: Record<string, number> = {
  lead: 0,
  prospect: 1,
  customer: 2,
  inactive: 3,
}

export const useContactsStore = defineStore('contacts', () => {
  const items = ref<ContactItem[]>([])
  const selected = ref<ContactItem | null>(null)
  const pagination = ref<Pagination>(defaultPagination)
  const loading = ref(false)
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})
  const assignableUsers = ref<UserItem[]>([])
  const companyOptions = ref<CompanyItem[]>([])
  const filters = ref({
    stage: '',
    owner_id: '' as number | '',
    company_id: '' as number | '',
    search: '',
  })

  function toOptionalNumber(value: number | ''): number | undefined {
    if (value === '') return undefined
    return Number(value)
  }

  function toStageCode(stage: string): number | undefined {
    if (!stage) return undefined
    return stageCodeMap[stage]
  }

  async function fetchContacts(page = 1, perPage = 15) {
    loading.value = true
    try {
      const { data } = await contactsApi.list({
        page,
        per_page: perPage,
        stage: toStageCode(filters.value.stage),
        owner_id: toOptionalNumber(filters.value.owner_id),
        company_id: toOptionalNumber(filters.value.company_id),
        search: filters.value.search || undefined,
      })
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

  async function fetchContactDetail(contactId: number) {
    loading.value = true
    try {
      const { data } = await contactsApi.detail(contactId)
      selected.value = data.data.contact
      message.value = data.message
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function createContact(payload: Parameters<typeof contactsApi.create>[0]) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await contactsApi.create(payload)
      message.value = data.message
      await fetchContacts(pagination.value.current_page, pagination.value.per_page)
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function updateContact(contactId: number, payload: Parameters<typeof contactsApi.update>[1]) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await contactsApi.update(contactId, payload)
      message.value = data.message
      const index = items.value.findIndex((item) => item.id === contactId)
      if (index >= 0) items.value[index] = data.data.contact
      if (selected.value?.id === contactId) selected.value = data.data.contact
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function deleteContact(contactId: number) {
    loading.value = true
    try {
      const { data } = await contactsApi.remove(contactId)
      message.value = data.message
      items.value = items.value.filter((item) => item.id !== contactId)
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function addActivity(contactId: number, payload: { type: string; note: string; occurred_at: string }) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await contactsApi.addActivity(contactId, payload)
      selected.value = data.data.contact
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

  async function importContacts(file: File) {
    loading.value = true
    try {
      const { data } = await contactsApi.importCsv(file)
      message.value = data.message
      await fetchContacts(1, pagination.value.per_page)
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

  async function exportContacts() {
    loading.value = true
    try {
      const response = await contactsApi.exportCsv({
        stage: toStageCode(filters.value.stage),
        owner_id: toOptionalNumber(filters.value.owner_id),
        company_id: toOptionalNumber(filters.value.company_id),
        search: filters.value.search || undefined,
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

  async function attachCompany(contactId: number, companyId: number) {
    loading.value = true
    try {
      const { data } = await contactsApi.attachCompany(contactId, companyId)
      message.value = data.message
      if (selected.value?.id === contactId) selected.value = data.data.contact
      const index = items.value.findIndex((item) => item.id === contactId)
      if (index >= 0) items.value[index] = data.data.contact
      return data.data.contact
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function detachCompany(contactId: number) {
    loading.value = true
    try {
      const { data } = await contactsApi.detachCompany(contactId)
      message.value = data.message
      if (selected.value?.id === contactId) selected.value = data.data.contact
      const index = items.value.findIndex((item) => item.id === contactId)
      if (index >= 0) items.value[index] = data.data.contact
      return data.data.contact
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
      assignableUsers.value = data.data.items.filter((user) => user.status === 'active')
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    }
  }

  async function fetchCompanyOptions(search = '') {
    try {
      const { data } = await companiesApi.list({
        per_page: 100,
        page: 1,
        status: 1,
        search: search || undefined,
      })
      companyOptions.value = data.data.items
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
    assignableUsers,
    companyOptions,
    filters,
    fetchContacts,
    fetchContactDetail,
    createContact,
    updateContact,
    deleteContact,
    addActivity,
    importContacts,
    exportContacts,
    attachCompany,
    detachCompany,
    fetchAssignableUsers,
    fetchCompanyOptions,
  }
})
