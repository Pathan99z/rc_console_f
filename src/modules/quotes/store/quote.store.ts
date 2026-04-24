import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { quotesApi } from '@/modules/quotes/services/quote.api'
import type { QuoteModel, QuotePayload, QuoteStatus, QuoteUpdatePayload } from '@/modules/quotes/types/quote.types'
import type { Pagination } from '@/modules/users/services/users.api'
import { contactsApi, type ContactItem } from '@/modules/contacts/services/contacts.api'
import { dealsApi, type DealItem } from '@/modules/deals/services/deals.api'
import { productsApi } from '@/modules/products/services/product.api'
import type { ProductItem } from '@/modules/products/types/product.types'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const useQuotesStore = defineStore('quotes', () => {
  const items = ref<QuoteModel[]>([])
  const current = ref<QuoteModel | null>(null)
  const publicQuote = ref<QuoteModel | null>(null)
  const contacts = ref<ContactItem[]>([])
  const deals = ref<DealItem[]>([])
  const products = ref<ProductItem[]>([])
  const pagination = ref<Pagination>(defaultPagination)
  const loading = ref(false)
  const saving = ref(false)
  const deletingId = ref<number | null>(null)
  const statusUpdating = ref(false)
  const uploadingAttachment = ref(false)
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})
  const filters = ref({
    status: '' as number | '',
    deal_id: '' as number | '',
    contact_id: '' as number | '',
    from_date: '',
    to_date: '',
  })

  async function fetchQuotes(page = 1, perPage = 15) {
    loading.value = true
    try {
      const { data } = await quotesApi.list({
        page,
        per_page: perPage,
        status: filters.value.status,
        deal_id: filters.value.deal_id,
        contact_id: filters.value.contact_id,
        from_date: filters.value.from_date || undefined,
        to_date: filters.value.to_date || undefined,
      })
      items.value = data.data.items
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

  async function fetchQuote(quoteId: number) {
    loading.value = true
    try {
      const { data } = await quotesApi.detail(quoteId)
      current.value = data.data.quote
      return current.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function createQuote(payload: QuotePayload) {
    saving.value = true
    errors.value = {}
    try {
      const { data } = await quotesApi.create(payload)
      message.value = data.message
      return data.data.quote
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      saving.value = false
    }
  }

  async function updateQuote(quoteId: number, payload: QuoteUpdatePayload) {
    saving.value = true
    errors.value = {}
    try {
      const { data } = await quotesApi.update(quoteId, payload)
      message.value = data.message
      current.value = data.data.quote
      const index = items.value.findIndex((item) => item.id === quoteId)
      if (index >= 0) items.value[index] = data.data.quote
      return data.data.quote
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      saving.value = false
    }
  }

  async function deleteQuote(quoteId: number) {
    deletingId.value = quoteId
    try {
      const { data } = await quotesApi.remove(quoteId)
      message.value = data.message
      items.value = items.value.filter((item) => item.id !== quoteId)
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      deletingId.value = null
    }
  }

  async function updateStatus(quoteId: number, status: QuoteStatus) {
    statusUpdating.value = true
    errors.value = {}
    try {
      const { data } = await quotesApi.updateStatus(quoteId, status)
      message.value = data.message
      current.value = data.data.quote
      const index = items.value.findIndex((item) => item.id === quoteId)
      if (index >= 0) items.value[index] = data.data.quote
      return data.data.quote
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      statusUpdating.value = false
    }
  }

  async function uploadAttachment(quoteId: number, payload: { name: string; file: File }) {
    uploadingAttachment.value = true
    errors.value = {}
    try {
      const { data } = await quotesApi.uploadAttachment(quoteId, payload)
      message.value = data.message
      return data.data.attachment
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      uploadingAttachment.value = false
    }
  }

  async function fetchPublicQuote(token: string) {
    loading.value = true
    try {
      const { data } = await quotesApi.publicDetail(token)
      publicQuote.value = data.data.quote
      return publicQuote.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function acceptQuote(token: string) {
    saving.value = true
    try {
      const { data } = await quotesApi.publicAccept(token)
      publicQuote.value = data.data.quote
      message.value = data.message
      return data.data.quote
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      saving.value = false
    }
  }

  async function rejectQuote(token: string) {
    saving.value = true
    try {
      const { data } = await quotesApi.publicReject(token)
      publicQuote.value = data.data.quote
      message.value = data.message
      return data.data.quote
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      saving.value = false
    }
  }

  async function fetchContactOptions() {
    const { data } = await contactsApi.list({ page: 1, per_page: 100 })
    contacts.value = data.data.items
    return contacts.value
  }

  async function fetchDealOptions(contactId?: number) {
    const { data } = await dealsApi.list({ page: 1, per_page: 100, search: undefined })
    deals.value = contactId ? data.data.items.filter((item) => item.contact?.id === contactId || item.contact_id === contactId) : data.data.items
    return deals.value
  }

  async function fetchProductOptions() {
    const { data } = await productsApi.list({ page: 1, per_page: 100, status: 1 })
    products.value = data.data.items
    return products.value
  }

  return {
    items,
    current,
    publicQuote,
    contacts,
    deals,
    products,
    pagination,
    loading,
    saving,
    deletingId,
    statusUpdating,
    uploadingAttachment,
    message,
    errors,
    filters,
    fetchQuotes,
    fetchQuote,
    createQuote,
    updateQuote,
    deleteQuote,
    updateStatus,
    uploadAttachment,
    fetchPublicQuote,
    acceptQuote,
    rejectQuote,
    fetchContactOptions,
    fetchDealOptions,
    fetchProductOptions,
  }
})
