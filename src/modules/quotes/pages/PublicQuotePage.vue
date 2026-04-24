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

const quote = computed(() => quotesStore.publicQuote)

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

onMounted(() => {
  void load()
})
</script>

<template>
  <main class="mx-auto max-w-3xl p-6">
    <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5">
      <div v-if="quotesStore.loading" class="text-sm text-slate-500">Loading quote...</div>
      <div v-else-if="!quote" class="text-sm text-rose-600">Invalid or expired quote.</div>
      <div v-else class="space-y-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold text-slate-900">{{ quote.quote_number }}</h1>
          <QuoteStatusBadge :status="quote.status" />
        </div>
        <p class="text-sm text-slate-600">
          Customer: {{ quote.contact ? `${quote.contact.first_name} ${quote.contact.last_name}` : '-' }}
        </p>

        <div class="rounded border p-3">
          <h2 class="mb-2 text-sm font-semibold text-slate-900">Products</h2>
          <div v-if="!quote.items || quote.items.length === 0" class="text-sm text-slate-500">No quote items.</div>
          <div v-else class="space-y-1 text-sm">
            <p v-for="item in quote.items" :key="item.id" class="flex justify-between">
              <span>{{ item.product_name }} × {{ item.quantity }}</span>
              <span>{{ item.line_total }}</span>
            </p>
          </div>
        </div>

        <div class="text-sm">
          <p>Valid Until: {{ quote.valid_until || '-' }}</p>
          <p class="mt-1 font-semibold">Total: {{ quote.currency_code || '' }} {{ quote.total }}</p>
        </div>

        <div class="flex gap-2">
          <button class="rounded border px-4 py-2 text-sm text-emerald-700" :disabled="acted || quotesStore.saving" @click="accept">Accept Quote</button>
          <button class="rounded border px-4 py-2 text-sm text-rose-700" :disabled="acted || quotesStore.saving" @click="reject">Reject Quote</button>
        </div>
      </div>
    </div>
  </main>
</template>
