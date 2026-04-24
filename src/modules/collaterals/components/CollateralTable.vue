<script setup lang="ts">
import type { CollateralItem } from '@/modules/collaterals/types/collateral.types'

defineProps<{
  items: CollateralItem[]
  deletingId: number | null
  canDelete: boolean
}>()

const emit = defineEmits<{
  (e: 'view', item: CollateralItem): void
  (e: 'edit', item: CollateralItem): void
  (e: 'send', item: CollateralItem): void
  (e: 'delete', item: CollateralItem): void
}>()

function humanFileSize(size: number): string {
  if (!size || size < 1024) return `${size || 0} B`
  const units = ['KB', 'MB', 'GB']
  let value = size / 1024
  let idx = 0
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024
    idx += 1
  }
  return `${value.toFixed(1)} ${units[idx]}`
}
</script>

<template>
  <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white">
    <div v-if="items.length === 0" class="p-6 text-center text-sm text-slate-500">No collaterals found.</div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Name</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Product</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Type</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">File Type</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Size</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Created At</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in items" :key="item.id" class="hover:bg-slate-50">
            <td class="px-3 py-2 font-medium text-slate-900">{{ item.name }}</td>
            <td class="px-3 py-2 text-slate-600">{{ item.product?.name || '-' }}</td>
            <td class="px-3 py-2 text-slate-600">{{ item.type }}</td>
            <td class="px-3 py-2 text-slate-600">{{ item.file_type }}</td>
            <td class="px-3 py-2 text-slate-600">{{ humanFileSize(item.file_size) }}</td>
            <td class="px-3 py-2 text-slate-600">{{ new Date(item.created_at).toLocaleDateString() }}</td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <button class="rounded border p-2 text-slate-700 hover:bg-slate-50" title="View" @click="emit('view', item)">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>
                </button>
                <button class="rounded border p-2 text-slate-700 hover:bg-slate-50" title="Edit" @click="emit('edit', item)">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 3.5a2.12 2.12 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                </button>
                <button class="rounded border p-2 text-slate-700 hover:bg-slate-50" title="Send" @click="emit('send', item)">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 2L11 13"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 2L15 22l-4-9-9-4z"/></svg>
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
