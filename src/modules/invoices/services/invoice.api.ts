import { apiClient } from '@/core/http/apiClient'
import type { InvoiceResponse, InvoicesListResponse } from '@/modules/invoices/types/invoice.types'

export const invoicesApi = {
  list(params: { page?: number; per_page?: number }) {
    return apiClient.get<InvoicesListResponse>('/invoices', { params })
  },
  detail(invoiceId: number) {
    return apiClient.get<InvoiceResponse>(`/invoices/${invoiceId}`)
  },
}
