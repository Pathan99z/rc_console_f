<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  search: string
  status: number | ''
  tenantId?: number | ''
  showTenantFilter?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:status', value: number | ''): void
  (e: 'update:tenantId', value: number | ''): void
  (e: 'apply'): void
  (e: 'reset'): void
}>()

const localSearch = ref(props.search)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.search,
  (value) => {
    localSearch.value = value
  }
)

watch(localSearch, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update:search', value)
    emit('apply')
  }, 350)
})

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

function onStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (value === '') {
    emit('update:status', '')
    return
  }
  emit('update:status', Number(value))
}

function onTenantInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (value === '') {
    emit('update:tenantId', '')
    return
  }
  emit('update:tenantId', Number(value))
}
</script>

<template>
  <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <input v-model.trim="localSearch" class="rc-input" placeholder="Search by name or SKU..." />

      <select class="rc-input" :value="status" @change="onStatusChange">
        <option value="">All statuses</option>
        <option :value="1">Active</option>
        <option :value="0">Inactive</option>
      </select>

      <input
        v-if="showTenantFilter"
        class="rc-input"
        type="number"
        :value="tenantId"
        placeholder="Tenant ID"
        @input="onTenantInput"
      />
    </div>
    <div class="mt-3 flex flex-wrap gap-2">
      <button class="rounded border px-3 py-1.5 text-sm" :disabled="loading" @click="emit('apply')">Apply Filters</button>
      <button class="rounded border px-3 py-1.5 text-sm" :disabled="loading" @click="emit('reset')">Reset</button>
    </div>
  </div>
</template>
