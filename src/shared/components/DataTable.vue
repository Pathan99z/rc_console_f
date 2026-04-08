<script setup lang="ts" generic="T extends Record<string, unknown>">
defineProps<{
  columns: Array<{ key: string; label: string }>
  rows: T[]
  loading?: boolean
  emptyMessage?: string
}>()
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-[var(--rc-border-soft)] bg-white">
    <table class="min-w-full text-sm">
      <thead class="bg-slate-50">
        <tr>
          <th v-for="col in columns" :key="col.key" class="px-4 py-3 text-left font-semibold text-slate-600">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="px-4 py-6 text-center text-slate-500">Loading...</td>
        </tr>
        <tr v-else-if="!rows.length">
          <td :colspan="columns.length" class="px-4 py-6 text-center text-slate-500">{{ emptyMessage || 'No records found.' }}</td>
        </tr>
        <slot v-else name="rows" />
      </tbody>
    </table>
  </div>
</template>
