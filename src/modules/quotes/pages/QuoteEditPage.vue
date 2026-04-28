<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/shared/utils/useToast'
import QuoteForm from '@/modules/quotes/components/QuoteForm.vue'
import QuoteSummary from '@/modules/quotes/components/QuoteSummary.vue'
import { useQuotesStore } from '@/modules/quotes/store/quote.store'
import type { QuoteProductRow } from '@/modules/quotes/components/QuoteProductTable.vue'
import type { DealItem } from '@/modules/deals/services/deals.api'

const route = useRoute()
const router = useRouter()
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
  products: [{ product_id: '', quantity: '1', unit_price: '', tax_rate: '', discount: '' }] as QuoteProductRow[],
})

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return 0
  const raw = String(value).trim()
  const normalized = raw.includes(',') && raw.includes('.')
    ? raw.replaceAll(',', '')
    : raw.replaceAll(',', '.')
  const cleaned = normalized.replaceAll(/[^0-9.-]/g, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

const summary = computed(() => {
  if (quotesStore.preview) {
    return {
      subtotal: quotesStore.preview.subtotal,
      taxTotal: quotesStore.preview.tax_total,
      discount: quotesStore.preview.discount_total,
      finalTotal: quotesStore.preview.total,
    }
  }
  return { subtotal: 0, taxTotal: 0, discount: 0, finalTotal: 0 }
})

const selectedDealCurrency = computed(() => {
  const selectedDealId = Number(form.deal_id || 0)
  if (!selectedDealId) return ''
  if (quotesStore.selectedDealDetail?.id === selectedDealId && quotesStore.selectedDealDetail.currency_code) {
    return quotesStore.selectedDealDetail.currency_code
  }
  const deal = quotesStore.deals.find((item) => item.id === selectedDealId) as DealItem & { currency_code?: string }
  return deal?.currency_code || ''
})

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
    discount: String(item.discount || 0),
  }))
  if (!form.products.length) {
    form.products = [{ product_id: '', quantity: '1', unit_price: '', tax_rate: '', discount: '' }]
  }
}

async function bootstrap() {
  if (!quoteId) return
  await Promise.all([quotesStore.fetchContactOptions(), quotesStore.fetchProductOptions(), quotesStore.fetchQuote(quoteId)])
  await quotesStore.fetchDealOptions(quotesStore.current?.contact?.id)
  syncFormFromCurrent()
  if (form.deal_id) {
    const detail = await quotesStore.fetchSelectedDealDetail(Number(form.deal_id))
    form.currency_code = detail?.currency_code || form.currency_code
  } else {
    quotesStore.clearSelectedDealDetail()
  }
}

async function onContactChange(contactId: number) {
  if (!contactId) return
  form.deal_id = ''
  quotesStore.clearSelectedDealDetail()
  await quotesStore.fetchDealOptions(contactId)
}

async function onDealChange(dealId: number) {
  if (!dealId) {
    quotesStore.clearSelectedDealDetail()
    return
  }
  const detail = await quotesStore.fetchSelectedDealDetail(dealId)
  form.currency_code = detail?.currency_code || form.currency_code
}

let previewTimer: ReturnType<typeof setTimeout> | null = null

function triggerPreviewDebounced() {
  if (previewTimer) clearTimeout(previewTimer)
  previewTimer = setTimeout(async () => {
    const products = form.products
      .filter((row) => row.product_id && toNumber(row.quantity) > 0)
      .map((row) => ({
        product_id: Number(row.product_id),
        quantity: toNumber(row.quantity),
        unit_price: row.unit_price === '' ? undefined : toNumber(row.unit_price),
        tax_rate: row.tax_rate === '' ? undefined : toNumber(row.tax_rate),
        discount: row.discount === '' ? undefined : toNumber(row.discount),
      }))

    if (!products.length) {
      quotesStore.clearPreview()
      return
    }

    try {
      await quotesStore.previewQuotePrices({
        deal_id: form.deal_id ? Number(form.deal_id) : null,
        target_currency: selectedDealCurrency.value || form.currency_code || undefined,
        discount_total: toNumber(form.discount_total),
        products,
      })
    } catch {
      quotesStore.clearPreview()
    }
  }, 300)
}

async function submit() {
  if (!quoteId) return
  try {
    await quotesStore.updateQuote(quoteId, {
      contact_id: Number(form.contact_id || 0) || undefined,
      deal_id: form.deal_id ? Number(form.deal_id) : null,
      quote_type: Number(form.quote_type) as 0 | 1,
      notes: form.notes || undefined,
      valid_until: form.valid_until || undefined,
      discount_total: toNumber(form.discount_total),
      currency_code: selectedDealCurrency.value || form.currency_code || undefined,
      products: form.products
        .filter((row) => row.product_id && toNumber(row.quantity) > 0)
        .map((row) => ({
          product_id: Number(row.product_id),
          quantity: toNumber(row.quantity),
          unit_price: row.unit_price === '' ? undefined : toNumber(row.unit_price),
          tax_rate: row.tax_rate === '' ? undefined : toNumber(row.tax_rate),
          discount: row.discount === '' ? undefined : toNumber(row.discount),
        })),
    })
    toast.success('Quote updated successfully.')
    router.push(`/app/quotes/${quoteId}`).catch(() => undefined)
  } catch {
    toast.error(quotesStore.message || 'Unable to update quote.')
  }
}

onMounted(() => {
  bootstrap().catch(() => undefined)
})

watch(
  () => ({
    deal_id: form.deal_id,
    currency_code: form.currency_code,
    discount_total: form.discount_total,
    products: form.products.map((row) => ({
      product_id: row.product_id,
      quantity: row.quantity,
      unit_price: row.unit_price,
      tax_rate: row.tax_rate,
      discount: row.discount,
    })),
  }),
  () => {
    triggerPreviewDebounced()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (previewTimer) clearTimeout(previewTimer)
  quotesStore.clearPreview()
})
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Edit Quote</h2>
        <p class="text-sm text-slate-500">Update quote details with prefilled customer, deal, and product values.</p>
      </div>
      <button class="rounded border px-3 py-1.5 text-sm" @click="$router.push(`/app/quotes/${quoteId}`)">Back</button>
    </header>

    <div v-if="quotesStore.loading && !quotesStore.current" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">
      Loading quote...
    </div>

    <template v-else>
      <QuoteForm
        v-model="form"
        :contacts="quotesStore.contacts"
        :deals="quotesStore.deals"
        :products="quotesStore.products"
        :deal-currency-code="selectedDealCurrency"
        :currency-options="['ZAR', 'USD', 'EUR', 'GBP', 'INR']"
        :loading="quotesStore.saving"
        :errors="quotesStore.errors"
        @contact-change="onContactChange"
        @deal-change="onDealChange"
        @live-change="triggerPreviewDebounced"
        @submit="submit"
      />

      <QuoteSummary
        :subtotal="summary.subtotal"
        :tax-total="summary.taxTotal"
        :discount-total="summary.discount"
        :final-total="summary.finalTotal"
        :currency-code="selectedDealCurrency || form.currency_code"
        :calculating="quotesStore.previewing"
      />
    </template>
  </section>
</template>
