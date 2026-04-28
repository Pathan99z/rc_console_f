<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import QuoteStatusBadge from '@/modules/quotes/components/QuoteStatusBadge.vue'
import QuoteAttachmentUpload from '@/modules/quotes/components/QuoteAttachmentUpload.vue'
import QuoteSummary from '@/modules/quotes/components/QuoteSummary.vue'
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
const showSendModal = ref(false)
const sendForm = reactive({
  email: '',
  message: '',
  layout_code: '',
  attach_pdf: true,
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

const selectedDealCurrency = computed(() => {
  const selectedDealId = Number(form.deal_id || 0)
  if (!selectedDealId) return ''
  if (quotesStore.selectedDealDetail?.id === selectedDealId && quotesStore.selectedDealDetail.currency_code) {
    return quotesStore.selectedDealDetail.currency_code
  }
  const deal = quotesStore.deals.find((item) => item.id === selectedDealId) as DealItem & { currency_code?: string }
  return deal?.currency_code || ''
})

const summary = computed(() => {
  const subtotal = form.products.reduce((sum, row) => {
    const qty = toNumber(row.quantity)
    const unitPrice = toNumber(row.unit_price)
    const lineSubtotal = qty * unitPrice
    return sum + lineSubtotal
  }, 0)
  const taxTotal = form.products.reduce((sum, row) => {
    const qty = toNumber(row.quantity)
    const unitPrice = toNumber(row.unit_price)
    const taxRate = toNumber(row.tax_rate)
    const lineSubtotal = qty * unitPrice
    const lineTax = lineSubtotal * taxRate / 100
    return sum + lineTax
  }, 0)
  const discount = toNumber(form.discount_total)
  const finalTotal = subtotal + taxTotal - discount
  return { subtotal, taxTotal, discount, finalTotal }
})

function formatMoney(value: string | number | null | undefined) {
  const amount = toNumber(value)
  const code = selectedDealCurrency.value || form.currency_code || quotesStore.current?.currency_code || 'ZAR'
  return `${code} ${amount.toFixed(2)}`
}

function formatDisplayDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
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
  if (form.deal_id) {
    const detail = await quotesStore.fetchSelectedDealDetail(Number(form.deal_id))
    form.currency_code = detail?.currency_code || form.currency_code
  } else {
    quotesStore.clearSelectedDealDetail()
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

async function sendQuoteEmail() {
  if (!quoteId) return
  try {
    await quotesStore.sendQuote(quoteId, {
      email: sendForm.email || undefined,
      message: sendForm.message || undefined,
      layout_code: sendForm.layout_code || undefined,
      attach_pdf: sendForm.attach_pdf,
    })
    toast.success('Quote sent successfully.')
    showSendModal.value = false
    await quotesStore.fetchQuote(quoteId)
    syncFormFromCurrent()
  } catch {
    const emailErrors = quotesStore.errors.email
    if (emailErrors?.length) {
      toast.error(emailErrors[0])
      return
    }
    toast.error(quotesStore.message || 'Unable to send quote.')
  }
}

const selectedLayout = computed(() => quotesStore.layouts.find((layout) => layout.code === sendForm.layout_code) || null)

async function openSendModal() {
  try {
    if (!quotesStore.layouts.length) await quotesStore.fetchQuoteLayouts()
    const fromQuery = typeof route.query.sendLayout === 'string' ? route.query.sendLayout : ''
    const fromStorage = quoteId ? globalThis.localStorage.getItem(`quote-send-layout:${quoteId}`) || '' : ''
    const preferred = fromQuery || fromStorage
    if (preferred && quotesStore.layouts.some((layout) => layout.code === preferred)) {
      sendForm.layout_code = preferred
    } else if (!sendForm.layout_code && quotesStore.layouts.length) {
      sendForm.layout_code = quotesStore.layouts[0].code
    }
    sendForm.email = quotesStore.current?.contact?.email || ''
    sendForm.message = ''
    sendForm.attach_pdf = true
    showSendModal.value = true
  } catch {
    toast.error(quotesStore.message || 'Unable to load quote layouts.')
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
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-lg font-semibold text-slate-900">{{ quotesStore.current.quote_number }}</h3>
              <QuoteStatusBadge :status="quotesStore.current.status" />
            </div>
            <p class="mt-1 text-sm text-slate-500">
              {{ quotesStore.current.contact ? `${quotesStore.current.contact.first_name} ${quotesStore.current.contact.last_name}` : '-' }}
              · Created {{ formatDisplayDate(quotesStore.current.created_at) }}
              · Valid until {{ formatDisplayDate(quotesStore.current.valid_until) }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="rounded border px-3 py-1.5 text-sm text-indigo-700 disabled:opacity-60" :disabled="quotesStore.sending" @click="openSendModal">
              Send Quote
            </button>
            <button class="rounded border px-3 py-1.5 text-sm" :disabled="quotesStore.statusUpdating" @click="updateStatus('sent')">Mark as Sent</button>
            <button class="rounded border px-3 py-1.5 text-sm text-emerald-700" :disabled="quotesStore.statusUpdating" @click="updateStatus('accepted')">Accept</button>
            <button class="rounded border px-3 py-1.5 text-sm text-rose-700" :disabled="quotesStore.statusUpdating" @click="updateStatus('rejected')">Reject</button>
          </div>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-3">
        <div class="space-y-4 xl:col-span-2">
          <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
            <h4 class="mb-3 font-semibold text-slate-900">Client Information</h4>
            <div class="grid gap-3 text-sm md:grid-cols-2">
              <p><span class="font-semibold text-slate-700">Contact Name:</span> {{ quotesStore.current.contact ? `${quotesStore.current.contact.first_name} ${quotesStore.current.contact.last_name}` : '-' }}</p>
              <p><span class="font-semibold text-slate-700">Contact Email:</span> {{ quotesStore.current.contact?.email || '-' }}</p>
              <p><span class="font-semibold text-slate-700">Quote Type:</span> {{ Number(quotesStore.current.quote_type || 0) === 1 ? 'Custom' : 'Standard' }}</p>
              <p><span class="font-semibold text-slate-700">Currency:</span> {{ quotesStore.current.currency_code || form.currency_code }}</p>
            </div>
          </div>

          <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
            <h4 class="mb-3 font-semibold text-slate-900">Related Deal</h4>
            <div class="grid gap-3 text-sm md:grid-cols-2">
              <p><span class="font-semibold text-slate-700">Deal Name:</span> {{ quotesStore.current.deal?.name || '-' }}</p>
              <p><span class="font-semibold text-slate-700">Deal Status:</span> {{ quotesStore.current.deal?.status || '-' }}</p>
              <p><span class="font-semibold text-slate-700">Subtotal:</span> {{ formatMoney(quotesStore.current.subtotal) }}</p>
              <p><span class="font-semibold text-slate-700">Tax Total:</span> {{ formatMoney(quotesStore.current.tax_total) }}</p>
            </div>
          </div>

          <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
            <h4 class="mb-3 font-semibold text-slate-900">Line Items</h4>
            <div v-if="!quotesStore.current.items?.length" class="text-sm text-slate-500">No line items available.</div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200 text-sm">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-3 py-2 text-left font-semibold text-slate-600">Item</th>
                    <th class="px-3 py-2 text-left font-semibold text-slate-600">Qty</th>
                    <th class="px-3 py-2 text-left font-semibold text-slate-600">Unit Price</th>
                    <th class="px-3 py-2 text-left font-semibold text-slate-600">Tax (%)</th>
                    <th class="px-3 py-2 text-left font-semibold text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="item in quotesStore.current.items" :key="item.id" class="hover:bg-slate-50">
                    <td class="px-3 py-2 text-slate-900">{{ item.product_name }}</td>
                    <td class="px-3 py-2 text-slate-700">{{ item.quantity }}</td>
                    <td class="px-3 py-2 text-slate-700">{{ formatMoney(item.unit_price) }}</td>
                    <td class="px-3 py-2 text-slate-700">{{ toNumber(item.tax_rate).toFixed(2) }}%</td>
                    <td class="px-3 py-2 font-semibold text-slate-900">{{ formatMoney(item.line_total) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <QuoteAttachmentUpload
            :attachments="quotesStore.current.attachments || []"
            :uploading="quotesStore.uploadingAttachment"
            @upload="uploadAttachment"
            @preview="previewAttachment"
          />

        </div>

        <div class="space-y-4">
          <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
            <h4 class="mb-3 font-semibold text-slate-900">Quote Summary</h4>
            <div class="space-y-2 text-sm text-slate-700">
              <p class="flex justify-between"><span>Quote Number</span><span>{{ quotesStore.current.quote_number }}</span></p>
              <p class="flex justify-between"><span>Status</span><span class="capitalize">{{ quotesStore.current.status }}</span></p>
              <p class="flex justify-between"><span>Currency</span><span>{{ quotesStore.current.currency_code || form.currency_code }}</span></p>
              <p class="flex justify-between"><span>Subtotal</span><span>{{ formatMoney(quotesStore.current.subtotal) }}</span></p>
              <p class="flex justify-between"><span>Tax Total</span><span>{{ formatMoney(quotesStore.current.tax_total) }}</span></p>
              <p class="flex justify-between"><span>Discount</span><span>- {{ formatMoney(quotesStore.current.discount_total) }}</span></p>
              <p class="flex justify-between border-t pt-2 font-semibold text-slate-900">
                <span>Total Amount</span>
                <span>{{ formatMoney(quotesStore.current.total) }}</span>
              </p>
              <p class="flex justify-between"><span>Created</span><span>{{ formatDisplayDate(quotesStore.current.created_at) }}</span></p>
              <p class="flex justify-between"><span>Valid Until</span><span>{{ formatDisplayDate(quotesStore.current.valid_until) }}</span></p>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div v-if="showSendModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div class="w-full max-w-4xl rounded-xl border border-[var(--rc-border-soft)] bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-[var(--rc-border-soft)] p-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Send Quote</h3>
            <p class="text-sm text-slate-500">Choose a layout template and send quote email.</p>
          </div>
          <button class="rounded border px-3 py-1.5 text-sm" :disabled="quotesStore.sending" @click="showSendModal = false">Close</button>
        </div>

        <div class="grid gap-4 p-4 lg:grid-cols-3">
          <aside class="space-y-2 lg:col-span-1">
            <h4 class="text-sm font-semibold text-slate-800">Layouts</h4>
            <button
              v-for="layout in quotesStore.layouts"
              :key="layout.code"
              class="w-full rounded-lg border p-3 text-left transition"
              :class="sendForm.layout_code === layout.code ? 'border-indigo-400 bg-indigo-50' : 'border-[var(--rc-border-soft)] hover:bg-slate-50'"
              @click="sendForm.layout_code = layout.code"
            >
              <p class="font-medium text-slate-900">{{ layout.name }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ layout.description || 'Default quote template.' }}</p>
            </button>
          </aside>

          <div class="space-y-3 lg:col-span-2">
            <div class="rounded-lg border border-[var(--rc-border-soft)] bg-slate-50 p-3">
              <p class="text-sm font-semibold text-slate-800">Template Preview</p>
              <p class="mt-1 text-sm text-slate-600">{{ selectedLayout?.description || 'Select a template to preview details.' }}</p>
              <p class="mt-1 text-xs text-slate-500">Code: {{ selectedLayout?.code || '-' }} | View: {{ selectedLayout?.pdf_view || '-' }}</p>
            </div>

            <div class="grid gap-3 md:grid-cols-2">
              <div>
                <p class="mb-1 block text-xs font-semibold text-slate-600">Recipient Email (optional override)</p>
                <input class="rc-input" type="email" :value="sendForm.email" placeholder="customer@example.com" @input="sendForm.email = ($event.target as HTMLInputElement).value" />
              </div>
              <div class="flex items-end">
                <label class="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" :checked="sendForm.attach_pdf" @change="sendForm.attach_pdf = ($event.target as HTMLInputElement).checked" />
                  Attach PDF
                </label>
              </div>
            </div>

            <div>
              <p class="mb-1 block text-xs font-semibold text-slate-600">Message (optional)</p>
              <textarea class="rc-input" rows="4" :value="sendForm.message" placeholder="Please review and confirm this quote." @input="sendForm.message = ($event.target as HTMLTextAreaElement).value"></textarea>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t border-[var(--rc-border-soft)] p-4">
          <button class="rounded border px-3 py-1.5 text-sm" :disabled="quotesStore.sending" @click="showSendModal = false">Cancel</button>
          <button class="btn-primary rounded px-4 py-2 text-sm font-semibold disabled:opacity-60" :disabled="quotesStore.sending || !sendForm.layout_code" @click="sendQuoteEmail">
            {{ quotesStore.sending ? 'Sending...' : 'Send Quote' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
