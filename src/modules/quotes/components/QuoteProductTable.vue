<script setup lang="ts">
import { watch } from 'vue'
import type { ProductItem } from '@/modules/products/types/product.types'

export type QuoteProductRow = {
  product_id: string
  quantity: string
  unit_price: string
  tax_rate: string
  discount: string
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

function readNormalizedNumberValue(input: HTMLInputElement) {
  const raw = input.value.trim()
  if (raw === '') return ''
  const normalized = raw.replaceAll(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? String(parsed) : normalized
}

function readNormalizedQuantityValue(input: HTMLInputElement) {
  const raw = readNormalizedNumberValue(input)
  if (raw === '') return ''
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return raw
  return String(Math.max(0, Math.trunc(parsed)))
}

function addRow() {
  emit('update:rows', [...props.rows, { product_id: '', quantity: '1', unit_price: '', tax_rate: '', discount: '' }])
}

function removeRow(index: number) {
  emit('update:rows', props.rows.filter((_, i) => i !== index))
}

function onProductChange(index: number, productId: string) {
  const selectedId = Number(productId)
  const product = props.products.find((x) => Number(x.id) === selectedId)
  const normalizedPrice =
    product?.unit_price === null || product?.unit_price === undefined
      ? ''
      : String(product.unit_price).replaceAll(',', '.')
  const normalizedTax =
    product?.tax_rate === null || product?.tax_rate === undefined
      ? ''
      : String(product.tax_rate).replaceAll(',', '.')
  patchRow(index, {
    product_id: productId,
    unit_price: normalizedPrice,
    tax_rate: normalizedTax,
    discount: props.rows[index]?.discount || '',
  })
}

function normalizeProductPrice(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).replaceAll(',', '.')
}

watch(
  () => [props.rows, props.products],
  () => {
    let changed = false
    const nextRows = props.rows.map((row) => {
      if (row.product_id === '') return row
      const needsUnitPrice = row.unit_price === ''
      const needsTaxRate = row.tax_rate === ''
      const needsDiscount = row.discount === ''
      if (!needsUnitPrice && !needsTaxRate && !needsDiscount) return row
      const product = props.products.find((x) => Number(x.id) === Number(row.product_id))
      if (!product) return row
      changed = true
      return {
        ...row,
        unit_price: needsUnitPrice ? normalizeProductPrice(product.unit_price) : row.unit_price,
        tax_rate: needsTaxRate ? normalizeProductPrice(product.tax_rate) : row.tax_rate,
        discount: needsDiscount ? '0' : row.discount,
      }
    })
    if (changed) emit('update:rows', nextRows)
  },
  { deep: true }
)
</script>

<template>
  <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
    <div class="mb-3 flex items-center justify-between">
      <h4 class="font-semibold text-slate-900">Products</h4>
      <button type="button" class="rounded border px-3 py-1.5 text-sm" @click="addRow">Add Product</button>
    </div>
    <div class="mb-2 hidden grid-cols-6 gap-2 px-1 text-xs font-semibold text-slate-500 md:grid">
      <span>Product</span>
      <span>Quantity</span>
      <span>Unit Price</span>
      <span>Tax Rate (%)</span>
      <span>Discount</span>
      <span>Action</span>
    </div>
    <div class="space-y-3">
      <div v-for="(row, index) in rows" :key="index" class="grid gap-2 md:grid-cols-6">
        <div>
          <label :for="`quote-product-${index}`" class="mb-1 block text-xs font-semibold text-slate-600 md:hidden">Product</label>
          <select :id="`quote-product-${index}`" class="rc-input" :value="row.product_id" @change="onProductChange(index, ($event.target as HTMLSelectElement).value)">
            <option value="">Select product</option>
            <option v-for="product in products" :key="product.id" :value="String(product.id)">{{ product.name }}</option>
          </select>
        </div>
        <div>
          <label :for="`quote-qty-${index}`" class="mb-1 block text-xs font-semibold text-slate-600 md:hidden">Quantity</label>
          <input
            :id="`quote-qty-${index}`"
            class="rc-input"
            type="number"
            min="1"
            :value="row.quantity"
            placeholder="Qty"
            @keydown.enter.prevent
            @input="patchRow(index, { quantity: readNormalizedQuantityValue($event.target as HTMLInputElement) })"
            @change="patchRow(index, { quantity: readNormalizedQuantityValue($event.target as HTMLInputElement) })"
          />
        </div>
        <div>
          <label :for="`quote-unit-price-${index}`" class="mb-1 block text-xs font-semibold text-slate-600 md:hidden">Unit Price</label>
          <input
            :id="`quote-unit-price-${index}`"
            class="rc-input"
            type="number"
            min="0"
            step="0.01"
            :value="row.unit_price"
            placeholder="Unit price"
            @keydown.enter.prevent
            @input="patchRow(index, { unit_price: readNormalizedNumberValue($event.target as HTMLInputElement) })"
            @change="patchRow(index, { unit_price: readNormalizedNumberValue($event.target as HTMLInputElement) })"
          />
        </div>
        <div>
          <label :for="`quote-tax-rate-${index}`" class="mb-1 block text-xs font-semibold text-slate-600 md:hidden">Tax Rate (%)</label>
          <input
            :id="`quote-tax-rate-${index}`"
            class="rc-input"
            type="number"
            min="0"
            step="0.01"
            :value="row.tax_rate"
            placeholder="Tax %"
            @keydown.enter.prevent
            @input="patchRow(index, { tax_rate: readNormalizedNumberValue($event.target as HTMLInputElement) })"
            @change="patchRow(index, { tax_rate: readNormalizedNumberValue($event.target as HTMLInputElement) })"
          />
        </div>
        <div>
          <label :for="`quote-discount-${index}`" class="mb-1 block text-xs font-semibold text-slate-600 md:hidden">Discount</label>
          <input
            :id="`quote-discount-${index}`"
            class="rc-input"
            type="number"
            min="0"
            step="0.01"
            :value="row.discount"
            placeholder="Discount"
            @keydown.enter.prevent
            @input="patchRow(index, { discount: readNormalizedNumberValue($event.target as HTMLInputElement) })"
            @change="patchRow(index, { discount: readNormalizedNumberValue($event.target as HTMLInputElement) })"
          />
        </div>
        <div>
          <label :for="`quote-remove-${index}`" class="mb-1 block text-xs font-semibold text-slate-600 md:hidden">Action</label>
          <button :id="`quote-remove-${index}`" type="button" class="w-full rounded border px-3 py-2 text-sm text-rose-700 hover:bg-rose-50" @click="removeRow(index)">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>
