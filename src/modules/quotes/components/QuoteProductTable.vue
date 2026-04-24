<script setup lang="ts">
import type { ProductItem } from '@/modules/products/types/product.types'

export type QuoteProductRow = {
  product_id: string
  quantity: string
  unit_price: string
  tax_rate: string
}

const props = defineProps<{
  rows: QuoteProductRow[]
  products: ProductItem[]
}>()

const emit = defineEmits<{
  (e: 'update:rows', value: QuoteProductRow[]): void
}>()

function patchRow(index: number, patch: Partial<QuoteProductRow>) {
  const next = props.rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
  emit('update:rows', next)
}

function normalizeInputValue(value: string) {
  return value.replace(',', '.')
}

function addRow() {
  emit('update:rows', [...props.rows, { product_id: '', quantity: '1', unit_price: '', tax_rate: '' }])
}

function removeRow(index: number) {
  emit('update:rows', props.rows.filter((_, i) => i !== index))
}

function onProductChange(index: number, productId: string) {
  const product = props.products.find((x) => x.id === Number(productId))
  const normalizedPrice =
    product?.unit_price === null || product?.unit_price === undefined
      ? ''
      : String(product.unit_price).replace(',', '.')
  const normalizedTax =
    product?.tax_rate === null || product?.tax_rate === undefined
      ? ''
      : String(product.tax_rate).replace(',', '.')
  patchRow(index, {
    product_id: productId,
    unit_price: normalizedPrice,
    tax_rate: normalizedTax,
  })
}
</script>

<template>
  <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
    <div class="mb-3 flex items-center justify-between">
      <h4 class="font-semibold text-slate-900">Products</h4>
      <button class="rounded border px-3 py-1.5 text-sm" @click="addRow">Add Product</button>
    </div>
    <div class="mb-2 hidden grid-cols-5 gap-2 px-1 text-xs font-semibold text-slate-500 md:grid">
      <span>Product</span>
      <span>Quantity</span>
      <span>Unit Price</span>
      <span>Tax Rate (%)</span>
      <span>Action</span>
    </div>
    <div class="space-y-3">
      <div v-for="(row, index) in rows" :key="index" class="grid gap-2 md:grid-cols-5">
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-600 md:hidden">Product</label>
          <select class="rc-input" :value="row.product_id" @change="onProductChange(index, ($event.target as HTMLSelectElement).value)">
            <option value="">Select product</option>
            <option v-for="product in products" :key="product.id" :value="String(product.id)">{{ product.name }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-600 md:hidden">Quantity</label>
          <input class="rc-input" type="number" min="1" :value="row.quantity" placeholder="Qty" @input="patchRow(index, { quantity: normalizeInputValue(($event.target as HTMLInputElement).value) })" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-600 md:hidden">Unit Price</label>
          <input class="rc-input" type="number" min="0" step="0.01" :value="row.unit_price" placeholder="Unit price" @input="patchRow(index, { unit_price: normalizeInputValue(($event.target as HTMLInputElement).value) })" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-600 md:hidden">Tax Rate (%)</label>
          <input class="rc-input" type="number" min="0" step="0.01" :value="row.tax_rate" placeholder="Tax %" @input="patchRow(index, { tax_rate: normalizeInputValue(($event.target as HTMLInputElement).value) })" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-600 md:hidden">Action</label>
          <button class="w-full rounded border px-3 py-2 text-sm text-rose-700 hover:bg-rose-50" @click="removeRow(index)">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>
