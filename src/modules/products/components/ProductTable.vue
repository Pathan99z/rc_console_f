<script setup lang="ts">
import ProductStatusToggle from '@/modules/products/components/ProductStatusToggle.vue'
import type { ProductItem } from '@/modules/products/types/product.types'

defineProps<{
  items: ProductItem[]
  canDelete: boolean
  deletingId: number | null
  statusUpdatingId: number | null
}>()

const emit = defineEmits<{
  (e: 'view', item: ProductItem): void
  (e: 'edit', item: ProductItem): void
  (e: 'delete', item: ProductItem): void
  (e: 'status-toggle', payload: { item: ProductItem; status: number }): void
}>()

function normalizedStatus(status: ProductItem['status']): number {
  return status === 'active' || status === 1 ? 1 : 0
}
</script>

<template>
  <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white">
    <div v-if="items.length === 0" class="p-6 text-center text-sm text-slate-500">No products found.</div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Name</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">SKU</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Unit Price</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Tax Rate</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Status</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Created At</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in items" :key="item.id" class="hover:bg-slate-50">
            <td class="px-3 py-2 font-medium text-slate-900">{{ item.name }}</td>
            <td class="px-3 py-2 text-slate-600">{{ item.sku || '-' }}</td>
            <td class="px-3 py-2 text-slate-600">{{ item.unit_price }}</td>
            <td class="px-3 py-2 text-slate-600">{{ item.tax_rate ?? '-' }}</td>
            <td class="px-3 py-2">
              <ProductStatusToggle
                :model-value="normalizedStatus(item.status)"
                :disabled="statusUpdatingId === item.id"
                @update:model-value="(status) => emit('status-toggle', { item, status })"
              />
            </td>
            <td class="px-3 py-2 text-slate-600">{{ new Date(item.created_at).toLocaleDateString() }}</td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <button class="rounded border p-2 text-slate-700 hover:bg-slate-50" title="View" @click="emit('view', item)">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>
                </button>
                <button class="rounded border p-2 text-slate-700 hover:bg-slate-50" title="Edit" @click="emit('edit', item)">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 3.5a2.12 2.12 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                </button>
                <button
                  v-if="canDelete"
                  class="rounded border p-2 text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                  :disabled="deletingId === item.id"
                  title="Delete"
                  @click="emit('delete', item)"
                >
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
