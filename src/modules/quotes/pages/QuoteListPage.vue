<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import QuoteFilters from '@/modules/quotes/components/QuoteFilters.vue'
import QuoteTable from '@/modules/quotes/components/QuoteTable.vue'
import { useQuotesStore } from '@/modules/quotes/store/quote.store'

const router = useRouter()
const toast = useToast()
const quotesStore = useQuotesStore()

async function bootstrap() {
  await Promise.all([quotesStore.fetchQuotes(), quotesStore.fetchContactOptions(), quotesStore.fetchDealOptions()])
}

async function applyFilters() {
  await quotesStore.fetchQuotes(1, quotesStore.pagination.per_page)
}

async function resetFilters() {
  quotesStore.filters.status = ''
  quotesStore.filters.contact_id = ''
  quotesStore.filters.deal_id = ''
  quotesStore.filters.from_date = ''
  quotesStore.filters.to_date = ''
  await quotesStore.fetchQuotes(1, quotesStore.pagination.per_page)
}

function openQuote(quoteId: number) {
  void router.push(`/app/quotes/${quoteId}`)
}

async function removeQuote(quoteId: number) {
  if (!window.confirm('Delete this quote?')) return
  try {
    await quotesStore.deleteQuote(quoteId)
    toast.success('Quote deleted successfully.')
  } catch {
    toast.error(quotesStore.message || 'Unable to delete quote.')
  }
}

onMounted(() => {
  void bootstrap()
})
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Quotes</h2>
        <p class="text-sm text-slate-500">Manage customer quotes with status, totals, and lifecycle actions.</p>
      </div>
      <button class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" @click="$router.push('/app/quotes/create')">Create Quote</button>
    </header>

    <QuoteFilters
      :status="quotesStore.filters.status"
      :contact-id="quotesStore.filters.contact_id"
      :deal-id="quotesStore.filters.deal_id"
      :from-date="quotesStore.filters.from_date"
      :to-date="quotesStore.filters.to_date"
      :contacts="quotesStore.contacts"
      :deals="quotesStore.deals"
      :loading="quotesStore.loading"
      @update:status="(value) => (quotesStore.filters.status = value)"
      @update:contact-id="(value) => (quotesStore.filters.contact_id = value)"
      @update:deal-id="(value) => (quotesStore.filters.deal_id = value)"
      @update:from-date="(value) => (quotesStore.filters.from_date = value)"
      @update:to-date="(value) => (quotesStore.filters.to_date = value)"
      @apply="applyFilters"
      @reset="resetFilters"
    />

    <div v-if="quotesStore.loading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">
      Loading quotes...
    </div>
    <QuoteTable
      v-else
      :items="quotesStore.items"
      :deleting-id="quotesStore.deletingId"
      @view="openQuote"
      @delete="removeQuote"
    />

    <PaginationControls
      :current-page="quotesStore.pagination.current_page"
      :last-page="quotesStore.pagination.last_page"
      @change="(page) => quotesStore.fetchQuotes(page, quotesStore.pagination.per_page)"
    />
  </section>
</template>
