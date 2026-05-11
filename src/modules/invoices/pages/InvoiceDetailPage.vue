<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/shared/utils/useToast'
import { useInvoicesStore } from '@/modules/invoices/store/invoice.store'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const invoicesStore = useInvoicesStore()
const invoiceId = Number(route.params.id || 0)

const invoice = computed(() => invoicesStore.current)

function formatAmount(value: string | number, currency?: string | null) {
  const amount = Number(value || 0)
  const safe = Number.isFinite(amount) ? amount : 0
  return `${currency || 'ZAR'} ${safe.toFixed(2)}`
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

onMounted(async () => {
  if (!invoiceId) {
    router.push('/app/invoices').catch(() => undefined)
    return
  }
  try {
    await invoicesStore.fetchInvoice(invoiceId)
  } catch {
    toast.error(invoicesStore.message || 'Unable to load invoice.')
    router.push('/app/invoices').catch(() => undefined)
  }
})
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Invoice Details</h2>
        <p class="text-sm text-slate-500">Review invoice and payment context generated from ITN success.</p>
      </div>
      <button class="rounded border px-3 py-1.5 text-sm" @click="$router.push('/app/invoices')">Back</button>
    </header>

    <div v-if="invoicesStore.loading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">
      Loading invoice...
    </div>

    <div v-else-if="invoice" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rc-border-soft)] pb-3">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">{{ invoice.invoice_number }}</h3>
          <p class="text-sm text-slate-500">Quote #{{ invoice.quote_id }} · Payment record #{{ invoice.payment_record_id || '-' }}</p>
        </div>
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
          :class="String(invoice.status).toLowerCase() === 'paid'
            ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80'
            : 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80'"
        >
          {{ invoice.status }}
        </span>
      </div>

      <div class="grid gap-3 text-sm md:grid-cols-2">
        <p><span class="font-semibold text-slate-700">Customer:</span> {{ invoice.customer_name || '-' }}</p>
        <p><span class="font-semibold text-slate-700">Email:</span> {{ invoice.customer_email || '-' }}</p>
        <p><span class="font-semibold text-slate-700">Subtotal:</span> {{ formatAmount(invoice.subtotal, invoice.currency_code) }}</p>
        <p><span class="font-semibold text-slate-700">Tax Total:</span> {{ formatAmount(invoice.tax_total, invoice.currency_code) }}</p>
        <p><span class="font-semibold text-slate-700">Discount:</span> {{ formatAmount(invoice.discount_total, invoice.currency_code) }}</p>
        <p><span class="font-semibold text-slate-700">Total:</span> {{ formatAmount(invoice.total, invoice.currency_code) }}</p>
        <p><span class="font-semibold text-slate-700">Issued At:</span> {{ formatDate(invoice.issued_at) }}</p>
        <p><span class="font-semibold text-slate-700">Paid At:</span> {{ formatDate(invoice.paid_at) }}</p>
      </div>
    </div>
  </section>
</template>
