<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { ProductItem } from '@/modules/products/types/product.types'

const props = defineProps<{
  search: string
  productId: number | ''
  type: string
  fileType: string
  tenantId: number | ''
  showTenantFilter: boolean
  products: ProductItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:productId', value: number | ''): void
  (e: 'update:type', value: string): void
  (e: 'update:fileType', value: string): void
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

function toOptionalNumber(value: string): number | '' {
  if (value === '') return ''
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : ''
}
</script>

<template>
  <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <input v-model.trim="localSearch" class="rc-input" placeholder="Search name..." />

      <select class="rc-input" :value="productId" @change="emit('update:productId', toOptionalNumber(($event.target as HTMLSelectElement).value))">
        <option value="">All products</option>
        <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
      </select>

      <select class="rc-input" :value="type" @change="emit('update:type', ($event.target as HTMLSelectElement).value)">
        <option value="">All types</option>
        <option value="brochure">brochure</option>
        <option value="proposal">proposal</option>
        <option value="datasheet">datasheet</option>
        <option value="presentation">presentation</option>
      </select>

      <input class="rc-input" :value="fileType" placeholder="e.g. application/pdf" @input="emit('update:fileType', ($event.target as HTMLInputElement).value)" />

      <input
        v-if="showTenantFilter"
        class="rc-input"
        type="number"
        :value="tenantId"
        placeholder="Tenant ID"
        @input="emit('update:tenantId', toOptionalNumber(($event.target as HTMLInputElement).value))"
      />
    </div>
    <div class="mt-3 flex gap-2">
      <button class="rounded border px-3 py-1.5 text-sm" :disabled="loading" @click="emit('apply')">Apply Filters</button>
      <button class="rounded border px-3 py-1.5 text-sm" :disabled="loading" @click="emit('reset')">Reset</button>
    </div>
  </div>
</template>
