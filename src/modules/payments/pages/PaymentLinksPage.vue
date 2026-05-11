<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useToast } from '@/shared/utils/useToast'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { usePaymentLinksStore } from '@/modules/payments/store/paymentLinks.store'

const toast = useToast()
const paymentLinksStore = usePaymentLinksStore()
const selectedQuoteId = ref<number | null>(null)
const sendForm = reactive({
  email: '',
  message: '',
})
const paymentFilter = ref<'all' | 'paid' | 'unpaid'>('all')

const filteredItems = computed(() => {
  if (paymentFilter.value === 'all') return paymentLinksStore.quotes
  return paymentLinksStore.quotes.filter((item) => String(item.payment_status || 'unpaid').toLowerCase() === paymentFilter.value)
})

function formatAmount(value: string | number | null | undefined, currencyCode?: string | null) {
  const parsed = Number(value || 0)
  const amount = Number.isFinite(parsed) ? parsed : 0
  return `${currencyCode || 'ZAR'} ${amount.toFixed(2)}`
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function getQuoteLinkState(quoteId: number) {
  return paymentLinksStore.getLinkState(quoteId)
}

function canCreate(quoteId: number) {
  if (String(getQuoteLinkState(quoteId)?.status || '').toLowerCase() === 'active') return false
  return String(filteredItems.value.find((item) => item.id === quoteId)?.payment_status || 'unpaid').toLowerCase() !== 'paid'
}

function canSend(quoteId: number) {
  const state = getQuoteLinkState(quoteId)
  if (!state?.linkId) return false
  if (String(state.status || '').toLowerCase() === 'expired') return false
  return String(filteredItems.value.find((item) => item.id === quoteId)?.payment_status || 'unpaid').toLowerCase() !== 'paid'
}

async function bootstrap() {
  await paymentLinksStore.fetchQuotes(1, paymentLinksStore.pagination.per_page)
}

async function createLink(quoteId: number) {
  try {
    await paymentLinksStore.createLink(quoteId)
    toast.success(paymentLinksStore.message || 'Payment link created.')
  } catch {
    toast.error(paymentLinksStore.message || 'Unable to create payment link.')
  }
}

function openSendDialog(quoteId: number) {
  const quote = paymentLinksStore.quotes.find((item) => item.id === quoteId)
  selectedQuoteId.value = quoteId
  sendForm.email = quote?.contact?.email || ''
  sendForm.message = 'Please use this secure payment link.'
}

function closeDialog() {
  selectedQuoteId.value = null
  sendForm.email = ''
  sendForm.message = ''
}

async function sendLink() {
  if (!selectedQuoteId.value) return
  try {
    await paymentLinksStore.sendLink(selectedQuoteId.value, {
      email: sendForm.email.trim() || undefined,
      message: sendForm.message.trim() || undefined,
    })
    toast.success(paymentLinksStore.message || 'Payment link sent.')
    closeDialog()
  } catch {
    const emailErrors = paymentLinksStore.errors.email
    if (emailErrors?.length) {
      toast.error(emailErrors[0])
      return
    }
    toast.error(paymentLinksStore.message || 'Unable to send payment link.')
  }
}

onMounted(() => {
  bootstrap().catch(() => undefined)
})
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Payment Links</h2>
        <p class="text-sm text-slate-500">Create and send payment links for quotes with full payment-status visibility.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="rounded-lg border border-[var(--rc-border-soft)] bg-white px-3 py-1.5 text-xs">
          <span class="font-semibold text-slate-700">Total Links:</span> {{ paymentLinksStore.metrics.total }}
        </div>
        <div class="rounded-lg border border-[var(--rc-border-soft)] bg-white px-3 py-1.5 text-xs">
          <span class="font-semibold text-slate-700">Active:</span> {{ paymentLinksStore.metrics.active }}
        </div>
        <div class="rounded-lg border border-[var(--rc-border-soft)] bg-white px-3 py-1.5 text-xs">
          <span class="font-semibold text-slate-700">Sent:</span> {{ paymentLinksStore.metrics.sent }}
        </div>
        <label for="payment-filter" class="ml-2 text-xs font-semibold text-slate-600">Payment Status</label>
        <select id="payment-filter" v-model="paymentFilter" class="rc-input w-40">
          <option value="all">All</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
      </div>
    </header>

    <div class="overflow-hidden rounded-xl border border-[var(--rc-border-soft)] bg-white">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Quote</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Customer</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Amount</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Quote Status</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Payment</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Link Status</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Expires</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Last Sent</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody v-if="!paymentLinksStore.loading" class="divide-y divide-slate-100">
          <tr v-for="quote in filteredItems" :key="quote.id">
            <td class="px-4 py-3 font-medium text-slate-900">{{ quote.quote_number }}</td>
            <td class="px-4 py-3 text-slate-700">
              {{ quote.contact ? `${quote.contact.first_name} ${quote.contact.last_name}` : '-' }}
              <p class="text-xs text-slate-500">{{ quote.contact?.email || '-' }}</p>
            </td>
            <td class="px-4 py-3 text-slate-700">{{ formatAmount(quote.total, quote.currency_code) }}</td>
            <td class="px-4 py-3">
              <span class="capitalize text-slate-700">{{ quote.status }}</span>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                :class="String(quote.payment_status || 'unpaid').toLowerCase() === 'paid'
                  ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80'
                  : 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80'"
              >
                {{ quote.payment_status || 'unpaid' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                :class="getQuoteLinkState(quote.id)
                  ? (String(getQuoteLinkState(quote.id)?.status || 'created').toLowerCase() === 'expired'
                    ? 'bg-rose-50 text-rose-800 ring-1 ring-rose-200/80'
                    : 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200/80')
                  : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80'"
              >
                {{ getQuoteLinkState(quote.id)?.status || (getQuoteLinkState(quote.id)?.linkId ? 'created' : 'not_created') }}
              </span>
            </td>
            <td class="px-4 py-3 text-xs text-slate-600">
              {{ formatDate(getQuoteLinkState(quote.id)?.expiresAt) }}
            </td>
            <td class="px-4 py-3 text-xs text-slate-600">
              {{ formatDate(getQuoteLinkState(quote.id)?.sentAt) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"
                  :disabled="paymentLinksStore.creatingForQuoteId === quote.id || !canCreate(quote.id)"
                  @click="createLink(quote.id)"
                >
                  {{ paymentLinksStore.creatingForQuoteId === quote.id ? 'Creating...' : 'Create Link' }}
                </button>
                <button
                  type="button"
                  class="btn-primary inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                  :disabled="paymentLinksStore.sendingForQuoteId === quote.id || !canSend(quote.id)"
                  @click="openSendDialog(quote.id)"
                >
                  Send
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!filteredItems.length">
            <td colspan="9" class="px-4 py-8 text-center text-sm text-slate-500">No quotes found for selected filter.</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="9" class="px-4 py-8 text-center text-sm text-slate-500">Loading payment links...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationControls
      :current-page="paymentLinksStore.pagination.current_page"
      :last-page="paymentLinksStore.pagination.last_page"
      @change="(page) => paymentLinksStore.fetchQuotes(page, paymentLinksStore.pagination.per_page)"
    />

    <div v-if="selectedQuoteId" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div class="w-full max-w-lg rounded-xl border border-[var(--rc-border-soft)] bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-[var(--rc-border-soft)] p-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Send Payment Link</h3>
            <p class="text-sm text-slate-500">Send created payment link for selected quote.</p>
          </div>
          <button class="rounded border px-3 py-1.5 text-sm" :disabled="paymentLinksStore.sendingForQuoteId === selectedQuoteId" @click="closeDialog">Close</button>
        </div>
        <div class="space-y-3 p-4">
          <div class="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-800">
            Link ID: <span class="font-semibold">{{ getQuoteLinkState(selectedQuoteId)?.linkId || '-' }}</span>
          </div>
          <div>
            <label for="payment-link-email" class="mb-1 block text-xs font-semibold text-slate-600">Recipient Email</label>
            <input
              id="payment-link-email"
              class="rc-input"
              type="email"
              :value="sendForm.email"
              :disabled="paymentLinksStore.sendingForQuoteId === selectedQuoteId"
              placeholder="customer@example.com"
              @input="sendForm.email = ($event.target as HTMLInputElement).value"
            />
          </div>
          <div>
            <label for="payment-link-message" class="mb-1 block text-xs font-semibold text-slate-600">Message (optional)</label>
            <textarea
              id="payment-link-message"
              class="rc-input"
              rows="4"
              :value="sendForm.message"
              :disabled="paymentLinksStore.sendingForQuoteId === selectedQuoteId"
              placeholder="Please use this secure payment link."
              @input="sendForm.message = ($event.target as HTMLTextAreaElement).value"
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-[var(--rc-border-soft)] p-4">
          <button class="rounded border px-3 py-1.5 text-sm" :disabled="paymentLinksStore.sendingForQuoteId === selectedQuoteId" @click="closeDialog">Cancel</button>
          <button
            class="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
            :disabled="paymentLinksStore.sendingForQuoteId === selectedQuoteId"
            @click="sendLink"
          >
            <span v-if="paymentLinksStore.sendingForQuoteId === selectedQuoteId" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
            {{ paymentLinksStore.sendingForQuoteId === selectedQuoteId ? 'Sending...' : 'Send Link' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
