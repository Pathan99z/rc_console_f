import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { paymentLinksApi } from '@/modules/payments/services/paymentLinks.api'
import type { PaymentLinkRecord } from '@/modules/payments/types/payment.types'
import type { Pagination } from '@/modules/users/services/users.api'
import type { QuoteModel } from '@/modules/quotes/types/quote.types'
import { withRetry } from '@/shared/utils/withRetry'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

type QuoteLinkState = {
  linkId: number
  status?: string
  token?: string
  url?: string
  expiresAt?: string | null
  sentAt?: string | null
}

function toQuoteLinkState(record: PaymentLinkRecord): QuoteLinkState {
  return {
    linkId: Number(record.id),
    status: record.status,
    token: record.token,
    url: record.url,
    expiresAt: record.expires_at ?? null,
    sentAt: record.sent_at ?? null,
  }
}

export const usePaymentLinksStore = defineStore('paymentLinks', () => {
  const quotes = ref<QuoteModel[]>([])
  const pagination = ref<Pagination>(defaultPagination)
  const loading = ref(false)
  const creatingForQuoteId = ref<number | null>(null)
  const sendingForQuoteId = ref<number | null>(null)
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})
  const linksByQuoteId = ref<Record<number, QuoteLinkState>>({})

  const metrics = computed(() => {
    const total = Object.keys(linksByQuoteId.value).length
    const active = Object.values(linksByQuoteId.value).filter((x) => String(x.status || '').toLowerCase() !== 'expired').length
    const expired = Object.values(linksByQuoteId.value).filter((x) => String(x.status || '').toLowerCase() === 'expired').length
    const sent = Object.values(linksByQuoteId.value).filter((x) => !!x.sentAt).length
    return { total, active, expired, sent }
  })

  async function fetchQuotes(page = 1, perPage = 15) {
    loading.value = true
    try {
      const { data } = await paymentLinksApi.listQuotes({ page, per_page: perPage })
      quotes.value = data.data.items
      pagination.value = data.data.pagination
      message.value = data.message
      return quotes.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function createLink(quoteId: number) {
    creatingForQuoteId.value = quoteId
    errors.value = {}
    try {
      const { data } = await withRetry(() => paymentLinksApi.createPaymentLink(quoteId))
      const record = data.data.payment_link || data.data.link
      if (!record?.id) {
        throw new Error('Payment link id missing in response.')
      }
      linksByQuoteId.value[quoteId] = toQuoteLinkState(record)
      message.value = data.message
      return linksByQuoteId.value[quoteId]
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      creatingForQuoteId.value = null
    }
  }

  async function sendLink(quoteId: number, payload: { email?: string; message?: string } = {}) {
    const existing = linksByQuoteId.value[quoteId]
    if (!existing?.linkId) {
      throw new Error('Create payment link first.')
    }
    sendingForQuoteId.value = quoteId
    errors.value = {}
    try {
      const { data } = await withRetry(() => paymentLinksApi.sendPaymentLink(quoteId, existing.linkId, payload))
      const record = data.data?.payment_link || data.data?.link
      linksByQuoteId.value[quoteId] = {
        ...existing,
        ...(record ? toQuoteLinkState(record) : {}),
        linkId: existing.linkId,
        sentAt: record?.sent_at ?? new Date().toISOString(),
      }
      message.value = data.message
      return linksByQuoteId.value[quoteId]
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      sendingForQuoteId.value = null
    }
  }

  function getLinkState(quoteId: number) {
    return linksByQuoteId.value[quoteId] || null
  }

  return {
    quotes,
    pagination,
    loading,
    creatingForQuoteId,
    sendingForQuoteId,
    message,
    errors,
    linksByQuoteId,
    metrics,
    fetchQuotes,
    createLink,
    sendLink,
    getLinkState,
  }
})
