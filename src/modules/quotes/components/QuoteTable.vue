<script setup lang="ts">
import QuoteStatusBadge from '@/modules/quotes/components/QuoteStatusBadge.vue'
import type { QuoteModel } from '@/modules/quotes/types/quote.types'

defineProps<{
  items: QuoteModel[]
  deletingId: number | null
}>()

const emit = defineEmits<{
  (e: 'view', id: number): void
  (e: 'delete', id: number): void
}>()
</script>

<template>
  <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white">
    <div v-if="items.length === 0" class="p-6 text-center text-sm text-slate-500">No quotes found.</div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Quote</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Customer</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Deal</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Total</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Status</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Valid Until</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="quote in items" :key="quote.id" class="hover:bg-slate-50">
            <td class="px-3 py-2 font-medium text-slate-900">{{ quote.quote_number }}</td>
            <td class="px-3 py-2 text-slate-700">{{ quote.contact ? `${quote.contact.first_name} ${quote.contact.last_name}` : '-' }}</td>
            <td class="px-3 py-2 text-slate-700">{{ quote.deal?.name || '-' }}</td>
            <td class="px-3 py-2 text-slate-700">{{ quote.currency_code || '' }} {{ quote.total }}</td>
            <td class="px-3 py-2"><QuoteStatusBadge :status="quote.status" /></td>
            <td class="px-3 py-2 text-slate-700">{{ quote.valid_until || '-' }}</td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <button class="rounded border p-2 text-slate-700 hover:bg-slate-50" title="View" @click="emit('view', quote.id)">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>
                </button>
                <button class="rounded border p-2 text-rose-700 hover:bg-rose-50 disabled:opacity-60" :disabled="deletingId === quote.id" title="Delete" @click="emit('delete', quote.id)">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M8 6V4h8v2m-1 0v14H9V6"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
