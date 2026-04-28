import { apiClient } from '@/core/http/apiClient'
import type {
  QuoteLayoutsResponse,
  QuoteListQuery,
  QuotePayload,
  QuotePreviewPayload,
  QuotePreviewResponse,
  QuoteResponse,
  QuotesListResponse,
  QuoteSendPayload,
  QuoteStatus,
  QuoteUpdatePayload,
} from '@/modules/quotes/types/quote.types'

function toOptionalNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const quotesApi = {
  listLayouts() {
    return apiClient.get<QuoteLayoutsResponse>('/quote-layouts')
  },
  list(params: QuoteListQuery) {
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
  create(payload: QuotePayload) {
    return apiClient.post<QuoteResponse>('/quotes', payload)
  },
  previewPrices(payload: QuotePreviewPayload) {
    return apiClient.post<QuotePreviewResponse>('/quotes/preview-prices', payload)
  },
  detail(quoteId: number) {
    return apiClient.get<QuoteResponse>(`/quotes/${quoteId}`)
  },
  update(quoteId: number, payload: QuoteUpdatePayload) {
    return apiClient.put<QuoteResponse>(`/quotes/${quoteId}`, payload)
  },
  remove(quoteId: number) {
    return apiClient.delete<{ success: boolean; message: string }>(`/quotes/${quoteId}`)
  },
  updateStatus(quoteId: number, status: QuoteStatus) {
    return apiClient.patch<QuoteResponse>(`/quotes/${quoteId}/status`, { status })
  },
  send(quoteId: number, payload: QuoteSendPayload = {}) {
    return apiClient.post<QuoteResponse>(`/quotes/${quoteId}/send`, payload)
  },
  uploadAttachment(quoteId: number, payload: { name: string; file: File }) {
    const form = new FormData()
    form.append('name', payload.name)
    form.append('file', payload.file)
    return apiClient.post<{ success: boolean; message: string; data: { attachment: Record<string, unknown> } }>(
      `/quotes/${quoteId}/attachments`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  },
  publicDetail(token: string) {
    return apiClient.get<QuoteResponse>(`/quotes/public/${token}`)
  },
  publicAccept(token: string) {
    return apiClient.post<QuoteResponse>(`/quotes/public/${token}/accept`, {})
  },
  publicReject(token: string) {
    return apiClient.post<QuoteResponse>(`/quotes/public/${token}/reject`, {})
  },
}
