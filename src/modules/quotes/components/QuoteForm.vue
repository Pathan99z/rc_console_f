<script setup lang="ts">
import type { ContactItem } from '@/modules/contacts/services/contacts.api'
import type { DealItem } from '@/modules/deals/services/deals.api'
import type { ProductItem } from '@/modules/products/types/product.types'
import QuoteProductTable, { type QuoteProductRow } from '@/modules/quotes/components/QuoteProductTable.vue'

const props = defineProps<{
  modelValue: {
    contact_id: string
    deal_id: string
    quote_type: string
    notes: string
    valid_until: string
    discount_total: string
    currency_code: string
    auto_create_deal: boolean
    products: QuoteProductRow[]
  }
  contacts: ContactItem[]
  deals: DealItem[]
  products: ProductItem[]
  dealCurrencyCode?: string
  currencyOptions?: string[]
  loading?: boolean
  errors?: Record<string, string[]>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: {
    contact_id: string
    deal_id: string
    quote_type: string
    notes: string
    valid_until: string
    discount_total: string
    currency_code: string
    auto_create_deal: boolean
    products: QuoteProductRow[]
  }): void
  (e: 'contact-change', contactId: number): void
  (e: 'deal-change', dealId: number): void
  (e: 'live-change'): void
  (e: 'submit'): void
}>()

function patch(partial: Partial<typeof props.modelValue>) {
  Object.assign(props.modelValue, partial)
  emit('update:modelValue', { ...props.modelValue, ...partial })
  emit('live-change')
}

function onContactChange(value: string) {
  patch({ contact_id: value, deal_id: '', auto_create_deal: false })
  emit('contact-change', Number(value || 0))
  emit('deal-change', 0)
}

function onDealChange(value: string) {
  patch({ deal_id: value })
  emit('deal-change', Number(value || 0))
}

const defaultCurrencyOptions = ['ZAR', 'USD', 'EUR', 'GBP', 'INR']
</script>

<template>
  <form class="space-y-4" @submit.prevent="emit('submit')">
    <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <h4 class="mb-3 font-semibold text-slate-900">Quote Information</h4>
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label for="quote-contact-id" class="mb-1 block text-xs font-semibold text-slate-600">Customer <span class="text-red-500">*</span></label>
          <select id="quote-contact-id" class="rc-input" :value="modelValue.contact_id" @change="onContactChange(($event.target as HTMLSelectElement).value)">
            <option value="">Select contact</option>
            <option v-for="contact in contacts" :key="contact.id" :value="String(contact.id)">{{ contact.first_name }} {{ contact.last_name }}</option>
          </select>
          <p v-if="errors?.contact_id?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.contact_id[0] }}</p>
        </div>
        <div>
          <label for="quote-deal-id" class="mb-1 block text-xs font-semibold text-slate-600">Deal</label>
          <select id="quote-deal-id" class="rc-input" :value="modelValue.deal_id" @change="onDealChange(($event.target as HTMLSelectElement).value)">
            <option value="">None selected</option>
            <option v-for="deal in deals" :key="deal.id" :value="String(deal.id)">{{ deal.name }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <label class="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" :checked="modelValue.auto_create_deal" @change="patch({ auto_create_deal: ($event.target as HTMLInputElement).checked })" />
            Auto-create deal if none selected
          </label>
        </div>
        <div>
          <label for="quote-type" class="mb-1 block text-xs font-semibold text-slate-600">Quote Type</label>
          <select id="quote-type" class="rc-input" :value="modelValue.quote_type" @change="patch({ quote_type: ($event.target as HTMLSelectElement).value })">
            <option value="0">Standard</option>
            <option value="1">Custom</option>
          </select>
        </div>
        <div>
          <label for="quote-valid-until" class="mb-1 block text-xs font-semibold text-slate-600">Valid Until</label>
          <input id="quote-valid-until" class="rc-input" type="date" :value="modelValue.valid_until" @input="patch({ valid_until: ($event.target as HTMLInputElement).value })" />
        </div>
        <div>
          <label for="quote-discount-total" class="mb-1 block text-xs font-semibold text-slate-600">Discount Total</label>
          <input id="quote-discount-total" class="rc-input" type="number" min="0" step="0.01" :value="modelValue.discount_total" @input="patch({ discount_total: ($event.target as HTMLInputElement).value })" />
        </div>
        <div>
          <label for="quote-currency" class="mb-1 block text-xs font-semibold text-slate-600">Currency</label>
          <input id="quote-currency" v-if="modelValue.deal_id" class="rc-input bg-slate-50" :value="dealCurrencyCode || modelValue.currency_code" readonly />
          <select
            v-else
            id="quote-currency"
            class="rc-input"
            :value="modelValue.currency_code"
            @change="patch({ currency_code: ($event.target as HTMLSelectElement).value })"
          >
            <option v-for="currency in currencyOptions || defaultCurrencyOptions" :key="currency" :value="currency">{{ currency }}</option>
          </select>
          <p v-if="modelValue.deal_id" class="mt-1 text-xs text-slate-500">Currency is locked to selected deal currency.</p>
        </div>
        <div class="md:col-span-2 xl:col-span-3">
          <label for="quote-notes" class="mb-1 block text-xs font-semibold text-slate-600">Notes</label>
          <textarea id="quote-notes" class="rc-input" rows="3" :value="modelValue.notes" @input="patch({ notes: ($event.target as HTMLTextAreaElement).value })"></textarea>
        </div>
      </div>
    </div>

    <QuoteProductTable :rows="modelValue.products" :products="products" @update:rows="(rows) => patch({ products: rows })" />

    <div class="flex justify-end">
      <button class="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="loading" type="submit">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
        {{ loading ? 'Saving...' : 'Save Quote' }}
      </button>
    </div>
  </form>
</template>
