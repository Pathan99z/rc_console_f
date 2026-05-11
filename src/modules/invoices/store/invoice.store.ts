import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { invoicesApi } from '@/modules/invoices/services/invoice.api'
import type { InvoiceModel } from '@/modules/invoices/types/invoice.types'
import type { Pagination } from '@/modules/users/services/users.api'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const useInvoicesStore = defineStore('invoices', () => {
  const items = ref<InvoiceModel[]>([])
  const current = ref<InvoiceModel | null>(null)
  const pagination = ref<Pagination>(defaultPagination)
  const loading = ref(false)
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})

  async function fetchInvoices(page = 1, perPage = 15) {
    loading.value = true
    try {
      const { data } = await invoicesApi.list({ page, per_page: perPage })
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

  async function fetchInvoice(invoiceId: number) {
    loading.value = true
    try {
      const { data } = await invoicesApi.detail(invoiceId)
      current.value = data.data.invoice
      message.value = data.message
      return current.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    current,
    pagination,
    loading,
    message,
    errors,
    fetchInvoices,
    fetchInvoice,
  }
})
