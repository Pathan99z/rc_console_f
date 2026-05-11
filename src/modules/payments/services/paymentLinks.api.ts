import { apiClient } from '@/core/http/apiClient'
import type { QuoteListQuery, QuotesListResponse } from '@/modules/quotes/types/quote.types'
import type { PaymentLinkCreateResponse, PaymentLinkSendResponse } from '@/modules/payments/types/payment.types'

function toOptionalNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const paymentLinksApi = {
  listQuotes(params: QuoteListQuery) {
    return apiClient.get<QuotesListResponse>('/quotes', {
      params: {
        page: params.page,
        per_page: params.per_page,
        status: params.status === '' ? undefined : params.status,
        deal_id: toOptionalNumber(params.deal_id),
        contact_id: toOptionalNumber(params.contact_id),
        from_date: params.from_date || undefined,
        to_date: params.to_date || undefined,
      },
    })
  },
  createPaymentLink(quoteId: number) {
    return apiClient.post<PaymentLinkCreateResponse>(`/quotes/${quoteId}/payment-links`, {})
  },
  sendPaymentLink(quoteId: number, linkId: number, payload: { email?: string; message?: string } = {}) {
    return apiClient.post<PaymentLinkSendResponse>(`/quotes/${quoteId}/payment-links/${linkId}/send`, payload)
  },
}
