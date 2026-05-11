<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import QuoteStatusBadge from '@/modules/quotes/components/QuoteStatusBadge.vue'
import { useQuotesStore } from '@/modules/quotes/store/quote.store'
import { useToast } from '@/shared/utils/useToast'

const route = useRoute()
const toast = useToast()
const quotesStore = useQuotesStore()
const token = String(route.params.token || '')
const acted = ref(false)
const redirectingToPayment = ref(false)

const quote = computed(() => quotesStore.publicQuote)

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const canPayWithPayfast = computed(() => {
  const q = quote.value
  if (!q || !token) return false
  if (quotesStore.paymentLinkSubmitting) return false
  if (String(q.payment_status || '').toLowerCase() === 'paid') return false
  return toNumber(q.total) > 0
})

function paymentStatusLabel(status: string | null | undefined) {
  const v = String(status || 'unpaid').toLowerCase()
  return v === 'paid' ? 'Paid' : 'Unpaid'
}

function paymentStatusBadgeClass(status: string | null | undefined) {
  const v = String(status || 'unpaid').toLowerCase()
  return v === 'paid'
    ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80'
    : 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80'
}

async function load() {
  if (!token) return
  try {
    await quotesStore.fetchPublicQuote(token)
  } catch {
    toast.error(quotesStore.message || 'Invalid or expired quote link.')
  }
}

async function accept() {
  if (acted.value) return
  try {
    await quotesStore.acceptQuote(token)
    acted.value = true
    toast.success('Quote accepted successfully.')
  } catch {
    toast.error(quotesStore.message || 'Unable to accept quote.')
  }
}

async function payWithPayfast() {
  if (!token) return
  if (redirectingToPayment.value) return
  redirectingToPayment.value = true
  try {
    await quotesStore.createPublicQuotePaymentLink(token)
    toast.success('Redirecting to PayFast…')
  } catch {
    toast.error(quotesStore.errors.payment?.[0] || quotesStore.message || 'Unable to start payment.')
  } finally {
    redirectingToPayment.value = false
  }
}

async function reject() {
  if (acted.value) return
  try {
    await quotesStore.rejectQuote(token)
    acted.value = true
    toast.success('Quote rejected successfully.')
  } catch {
    toast.error(quotesStore.message || 'Unable to reject quote.')
  }
}

onMounted(async () => {
  await load()
  const action = String(route.query.action || '').toLowerCase()
  if (action !== 'pay') return
  if (!canPayWithPayfast.value) return
  await payWithPayfast()
})
</script>

<template>
  <main class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 px-4 py-10 sm:px-6">
    <div class="mx-auto max-w-2xl">
      <div class="mb-6 text-center">
        <p class="text-xs font-semibold uppercase tracking-wider text-indigo-600">Quote portal</p>
        <p class="mt-1 text-sm text-slate-500">Review your quote and choose an action below.</p>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-100">
        <div v-if="quotesStore.loading" class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500">
          <span class="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"></span>
          <span>Loading your quote…</span>
        </div>
        <div v-else-if="!quote" class="px-6 py-12 text-center text-sm font-medium text-rose-600">This quote link is invalid or has expired.</div>
        <div v-else class="divide-y divide-slate-100">
          <div class="bg-gradient-to-r from-slate-50 to-indigo-50/30 px-6 py-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 class="text-xl font-bold tracking-tight text-slate-900">{{ quote.quote_number }}</h1>
                <p class="mt-1 text-sm text-slate-600">
                  {{ quote.contact ? `${quote.contact.first_name} ${quote.contact.last_name}` : 'Customer' }}
                </p>
              </div>
              <QuoteStatusBadge :status="quote.status" />
            </div>
            <div class="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span class="text-slate-500">Payment</span>
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                :class="paymentStatusBadgeClass(quote.payment_status)"
              >
                {{ paymentStatusLabel(quote.payment_status) }}
              </span>
              <span class="hidden h-4 w-px bg-slate-200 sm:inline" aria-hidden="true"></span>
              <span class="text-slate-500">Valid until <span class="font-medium text-slate-800">{{ quote.valid_until || '—' }}</span></span>
            </div>
          </div>

          <div class="px-6 py-5">
            <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Line items</h2>
            <div v-if="!quote.items || quote.items.length === 0" class="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-500">
              No line items on this quote.
            </div>
            <ul v-else class="divide-y divide-slate-100 rounded-lg border border-slate-100">
              <li v-for="item in quote.items" :key="item.id" class="flex justify-between gap-4 px-4 py-3 text-sm">
                <span class="text-slate-800">{{ item.product_name }} <span class="text-slate-500">× {{ item.quantity }}</span></span>
                <span class="shrink-0 font-medium tabular-nums text-slate-900">{{ item.line_total }}</span>
              </li>
            </ul>
            <div class="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-4">
              <span class="text-sm font-medium text-slate-600">Amount due</span>
              <span class="text-lg font-bold text-indigo-700 tabular-nums">{{ quote.currency_code || '' }} {{ quote.total }}</span>
            </div>
          </div>

          <div class="bg-slate-50/80 px-6 py-5">
            <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</p>
            <div v-if="redirectingToPayment" class="mb-3 inline-flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
              <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-700"></span>
              Redirecting to secure PayFast checkout...
            </div>
            <button
              type="button"
              class="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-md transition disabled:pointer-events-none disabled:opacity-55 sm:w-auto sm:min-w-[200px]"
              :disabled="!canPayWithPayfast || redirectingToPayment"
              @click="payWithPayfast"
            >
              <span v-if="quotesStore.paymentLinkSubmitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
              {{ quotesStore.paymentLinkSubmitting ? 'Opening PayFast…' : 'Pay securely with PayFast' }}
            </button>
            <p v-if="!canPayWithPayfast && String(quote.payment_status || '').toLowerCase() !== 'paid'" class="mt-2 max-w-md text-xs text-slate-600">
              Online payment appears when the total is above zero and PayFast is enabled for this organisation.
            </p>
            <p v-if="String(quote.payment_status || '').toLowerCase() === 'paid'" class="mt-2 text-xs font-medium text-emerald-800">This quote has been paid. Thank you.</p>
          </div>

          <div class="px-6 py-5">
            <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Respond</p>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="inline-flex flex-1 min-w-[120px] items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50 sm:flex-none"
                :disabled="acted || quotesStore.saving"
                @click="accept"
              >
                Accept quote
              </button>
              <button
                type="button"
                class="inline-flex flex-1 min-w-[120px] items-center justify-center rounded-lg border border-rose-200 bg-rose-50/80 px-4 py-2.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 disabled:opacity-50 sm:flex-none"
                :disabled="acted || quotesStore.saving"
                @click="reject"
              >
                Reject quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
