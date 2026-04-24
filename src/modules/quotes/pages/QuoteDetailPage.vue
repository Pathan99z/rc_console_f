<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import QuoteStatusBadge from '@/modules/quotes/components/QuoteStatusBadge.vue'
import QuoteAttachmentUpload from '@/modules/quotes/components/QuoteAttachmentUpload.vue'
import QuoteSummary from '@/modules/quotes/components/QuoteSummary.vue'
import QuoteForm from '@/modules/quotes/components/QuoteForm.vue'
import { useQuotesStore } from '@/modules/quotes/store/quote.store'
import { useToast } from '@/shared/utils/useToast'
import type { QuoteProductRow } from '@/modules/quotes/components/QuoteProductTable.vue'
import type { QuoteStatus } from '@/modules/quotes/types/quote.types'
import type { DealItem } from '@/modules/deals/services/deals.api'

const route = useRoute()
const toast = useToast()
const quotesStore = useQuotesStore()
const quoteId = Number(route.params.id || 0)

const form = reactive({
  contact_id: '',
  deal_id: '',
  quote_type: '0',
  notes: '',
  valid_until: '',
  discount_total: '',
  currency_code: 'ZAR',
  auto_create_deal: false,
  products: [] as QuoteProductRow[],
})

const canEdit = computed(() => quotesStore.current?.status === 'draft')

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return 0
  const raw = String(value).trim()
  const normalized = raw.includes(',') && raw.includes('.')
    ? raw.replace(/,/g, '')
    : raw.replace(',', '.')
  const cleaned = normalized.replace(/[^0-9.-]/g, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

const selectedDealCurrency = computed(() => {
  const selectedDealId = Number(form.deal_id || 0)
  if (!selectedDealId) return ''
  const deal = quotesStore.deals.find((item) => item.id === selectedDealId) as DealItem & { currency_code?: string }
  return deal?.currency_code || ''
})

const summary = computed(() => {
  const subtotal = form.products.reduce((sum, row) => sum + Number(row.quantity || 0) * toNumber(row.unit_price), 0)
  const taxTotal = form.products.reduce(
    (sum, row) => sum + Number(row.quantity || 0) * toNumber(row.unit_price) * (toNumber(row.tax_rate) / 100),
    0
  )
  const discount = Number(form.discount_total || 0)
  const finalTotal = subtotal + taxTotal - discount
  return { subtotal, taxTotal, discount, finalTotal }
})

function formatMoney(value: string | number | null | undefined) {
  const amount = toNumber(value)
  const code = selectedDealCurrency.value || form.currency_code || quotesStore.current?.currency_code || 'ZAR'
  return `${code} ${amount.toFixed(2)}`
}

function syncFormFromCurrent() {
  const quote = quotesStore.current
  if (!quote) return
  form.contact_id = quote.contact?.id ? String(quote.contact.id) : ''
  form.deal_id = quote.deal?.id ? String(quote.deal.id) : ''
  form.quote_type = String(quote.quote_type ?? 0)
  form.notes = quote.notes || ''
  form.valid_until = quote.valid_until ? String(quote.valid_until).slice(0, 10) : ''
  form.discount_total = String(quote.discount_total || 0)
  form.currency_code = quote.currency_code || 'ZAR'
  form.products = (quote.items || []).map((item) => ({
    product_id: String(item.product_id),
    quantity: String(item.quantity),
    unit_price: String(item.unit_price),
    tax_rate: String(item.tax_rate),
  }))
}

async function loadQuote() {
  if (!quoteId) return
  await Promise.all([quotesStore.fetchContactOptions(), quotesStore.fetchProductOptions(), quotesStore.fetchQuote(quoteId)])
  await quotesStore.fetchDealOptions(quotesStore.current?.contact?.id)
  syncFormFromCurrent()
}

async function onContactChange(contactId: number) {
  if (!contactId) return
  form.deal_id = ''
  await quotesStore.fetchDealOptions(contactId)
}

async function saveQuote() {
  if (!quoteId) return
  try {
    await quotesStore.updateQuote(quoteId, {
      contact_id: Number(form.contact_id || 0) || undefined,
      deal_id: form.deal_id ? Number(form.deal_id) : null,
      quote_type: Number(form.quote_type) as 0 | 1,
      notes: form.notes || undefined,
      valid_until: form.valid_until || undefined,
      discount_total: Number(form.discount_total || 0),
      currency_code: selectedDealCurrency.value || form.currency_code || undefined,
      products: form.products
        .filter((row) => row.product_id && Number(row.quantity || 0) > 0)
        .map((row) => ({
          product_id: Number(row.product_id),
          quantity: Number(row.quantity),
          unit_price: row.unit_price === '' ? undefined : toNumber(row.unit_price),
          tax_rate: row.tax_rate === '' ? undefined : toNumber(row.tax_rate),
        })),
    })
    toast.success('Quote updated successfully.')
  } catch {
    toast.error(quotesStore.message || 'Unable to update quote.')
  }
}

async function updateStatus(status: QuoteStatus) {
  if (!quoteId) return
  try {
    await quotesStore.updateStatus(quoteId, status)
    toast.success('Quote status updated.')
    await quotesStore.fetchQuote(quoteId)
    syncFormFromCurrent()
  } catch {
    toast.error(quotesStore.message || 'Unable to update status.')
  }
}

async function uploadAttachment(payload: { name: string; file: File }) {
  if (!quoteId) return
  try {
    await quotesStore.uploadAttachment(quoteId, payload)
    toast.success('Attachment uploaded successfully.')
    await quotesStore.fetchQuote(quoteId)
  } catch {
    toast.error(quotesStore.message || 'Attachment upload failed.')
  }
}

async function previewAttachment(attachmentId: number) {
  if (!quoteId) return
  try {
    const detail = await quotesStore.fetchQuote(quoteId)
    const target = detail?.attachments?.find((x) => x.id === attachmentId)
    if (!target?.signed_url) {
      toast.error('Unable to generate signed URL.')
      return
    }
    window.open(target.signed_url, '_blank', 'noopener,noreferrer')
  } catch {
    toast.error(quotesStore.message || 'Unable to preview attachment.')
  }
}

onMounted(() => {
  void loadQuote()
})
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Quote Details</h2>
        <p class="text-sm text-slate-500">Review and manage quote lifecycle, pricing, and attachments.</p>
      </div>
      <button class="rounded border px-3 py-1.5 text-sm" @click="$router.push('/app/quotes')">Back</button>
    </header>

    <div v-if="quotesStore.loading && !quotesStore.current" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">
      Loading quote...
    </div>

    <div v-else-if="quotesStore.current" class="space-y-4">
      <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">{{ quotesStore.current.quote_number }}</h3>
            <p class="text-sm text-slate-500">Customer: {{ quotesStore.current.contact ? `${quotesStore.current.contact.first_name} ${quotesStore.current.contact.last_name}` : '-' }}</p>
          </div>
          <QuoteStatusBadge :status="quotesStore.current.status" />
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <button class="rounded border px-3 py-1.5 text-sm" :disabled="quotesStore.statusUpdating" @click="updateStatus('sent')">Mark as Sent</button>
          <button class="rounded border px-3 py-1.5 text-sm text-emerald-700" :disabled="quotesStore.statusUpdating" @click="updateStatus('accepted')">Accept</button>
          <button class="rounded border px-3 py-1.5 text-sm text-rose-700" :disabled="quotesStore.statusUpdating" @click="updateStatus('rejected')">Reject</button>
        </div>
      </div>

      <QuoteForm
        v-if="canEdit"
        v-model="form"
        :contacts="quotesStore.contacts"
        :deals="quotesStore.deals"
        :products="quotesStore.products"
        :deal-currency-code="selectedDealCurrency"
        :currency-options="['ZAR', 'USD', 'EUR', 'GBP', 'INR']"
        :loading="quotesStore.saving"
        :errors="quotesStore.errors"
        @contact-change="onContactChange"
        @submit="saveQuote"
      />

      <QuoteSummary
        :subtotal="summary.subtotal"
        :tax-total="summary.taxTotal"
        :discount-total="summary.discount"
        :final-total="summary.finalTotal"
        :currency-code="form.currency_code"
      />

      <QuoteAttachmentUpload
        :attachments="quotesStore.current.attachments || []"
        :uploading="quotesStore.uploadingAttachment"
        @upload="uploadAttachment"
        @preview="previewAttachment"
      />
    </div>
  </section>
</template>
