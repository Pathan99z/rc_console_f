<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/shared/utils/useToast'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useInvoicesStore } from '@/modules/invoices/store/invoice.store'

const router = useRouter()
const toast = useToast()
const invoicesStore = useInvoicesStore()

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

function openDetail(invoiceId: number) {
  router.push(`/app/invoices/${invoiceId}`).catch(() => undefined)
}

onMounted(async () => {
  try {
    await invoicesStore.fetchInvoices(1, invoicesStore.pagination.per_page)
  } catch {
    toast.error(invoicesStore.message || 'Unable to load invoices.')
  }
})
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Invoices</h2>
        <p class="text-sm text-slate-500">Track paid invoices generated from successful quote payments.</p>
      </div>
    </header>

    <div class="overflow-hidden rounded-xl border border-[var(--rc-border-soft)] bg-white">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Invoice</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Customer</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Quote</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Total</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Issued</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Paid</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Action</th>
          </tr>
        </thead>
        <tbody v-if="!invoicesStore.loading" class="divide-y divide-slate-100">
          <tr v-for="invoice in invoicesStore.items" :key="invoice.id">
            <td class="px-4 py-3 font-medium text-slate-900">{{ invoice.invoice_number }}</td>
            <td class="px-4 py-3 text-slate-700">
              {{ invoice.customer_name || '-' }}
              <p class="text-xs text-slate-500">{{ invoice.customer_email || '-' }}</p>
            </td>
            <td class="px-4 py-3 text-slate-700">#{{ invoice.quote_id }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                :class="String(invoice.status).toLowerCase() === 'paid'
                  ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80'
                  : 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80'"
              >
                {{ invoice.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-slate-700">{{ formatAmount(invoice.total, invoice.currency_code) }}</td>
            <td class="px-4 py-3 text-xs text-slate-600">{{ formatDate(invoice.issued_at) }}</td>
            <td class="px-4 py-3 text-xs text-slate-600">{{ formatDate(invoice.paid_at) }}</td>
            <td class="px-4 py-3">
              <button class="rounded border px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" @click="openDetail(invoice.id)">
                View
              </button>
            </td>
          </tr>
          <tr v-if="!invoicesStore.items.length">
            <td colspan="8" class="px-4 py-8 text-center text-sm text-slate-500">No invoices found.</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="8" class="px-4 py-8 text-center text-sm text-slate-500">Loading invoices...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationControls
      :current-page="invoicesStore.pagination.current_page"
      :last-page="invoicesStore.pagination.last_page"
      @change="(page) => invoicesStore.fetchInvoices(page, invoicesStore.pagination.per_page)"
    />
  </section>
</template>
