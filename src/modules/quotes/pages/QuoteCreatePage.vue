<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/shared/utils/useToast'
import QuoteForm from '@/modules/quotes/components/QuoteForm.vue'
import QuoteSummary from '@/modules/quotes/components/QuoteSummary.vue'
import { useQuotesStore } from '@/modules/quotes/store/quote.store'
import type { QuoteProductRow } from '@/modules/quotes/components/QuoteProductTable.vue'
import type { DealItem } from '@/modules/deals/services/deals.api'

const router = useRouter()
const toast = useToast()
const quotesStore = useQuotesStore()

const form = reactive({
  contact_id: '',
  deal_id: '',
  quote_type: '0',
  notes: '',
  valid_until: '',
  discount_total: '',
  currency_code: 'ZAR',
  auto_create_deal: false,
  products: [{ product_id: '', quantity: '1', unit_price: '', tax_rate: '' }] as QuoteProductRow[],
})

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

const summary = computed(() => {
  const subtotal = form.products.reduce((sum, row) => {
    const qty = Number(row.quantity || 0)
    const price = toNumber(row.unit_price)
    return sum + qty * price
  }, 0)
  const taxTotal = form.products.reduce((sum, row) => {
    const qty = Number(row.quantity || 0)
    const price = toNumber(row.unit_price)
    const tax = toNumber(row.tax_rate)
    return sum + qty * price * (tax / 100)
  }, 0)
  const discount = Number(form.discount_total || 0)
  const finalTotal = subtotal + taxTotal - discount
  return { subtotal, taxTotal, discount, finalTotal }
})

const selectedDealCurrency = computed(() => {
  const selectedDealId = Number(form.deal_id || 0)
  if (!selectedDealId) return ''
  const deal = quotesStore.deals.find((item) => item.id === selectedDealId) as DealItem & { currency_code?: string }
  return deal?.currency_code || ''
})

async function onContactChange(contactId: number) {
  if (!contactId) return
  form.deal_id = ''
  await quotesStore.fetchDealOptions(contactId)
}

async function submit() {
  try {
    const quote = await quotesStore.createQuote({
      contact_id: Number(form.contact_id),
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
    toast.success('Quote created successfully.')
    void router.push(`/app/quotes/${quote.id}`)
  } catch {
    toast.error(quotesStore.message || 'Unable to create quote.')
  }
}

onMounted(async () => {
  await Promise.all([quotesStore.fetchContactOptions(), quotesStore.fetchProductOptions(), quotesStore.fetchDealOptions()])
})
</script>

<template>
  <section class="space-y-5">
    <header class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Create Quote</h2>
        <p class="text-sm text-slate-500">Build quote using customer, deal, products, and live totals.</p>
      </div>
      <button class="rounded border px-3 py-1.5 text-sm" @click="$router.push('/app/quotes')">Back</button>
    </header>

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
      @submit="submit"
    />

    <QuoteSummary
      :subtotal="summary.subtotal"
      :tax-total="summary.taxTotal"
      :discount-total="summary.discount"
      :final-total="summary.finalTotal"
      :currency-code="form.currency_code"
    />
  </section>
</template>
