<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { ProductItem } from '@/modules/products/types/product.types'
import type { CollateralItem } from '@/modules/collaterals/types/collateral.types'

const props = defineProps<{
  open: boolean
  collateral: CollateralItem | null
  products: ProductItem[]
  updating: boolean
  errors: Record<string, string[]>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', value: { product_id: string; name: string; type: string; file: File | null }): void
}>()

const form = reactive({
  product_id: '',
  name: '',
  type: 'brochure',
  file: null as File | null,
})

watch(
  () => props.collateral,
  (item) => {
    form.product_id = item?.product_id ? String(item.product_id) : ''
    form.name = item?.name || ''
    form.type = item?.type || 'brochure'
    form.file = null
  },
  { immediate: true }
)

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) form.file = file
  input.value = ''
}

function submit() {
  emit('submit', { ...form })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
    <div class="w-full max-w-2xl rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold">Edit Collateral</h3>
        <button class="rounded border px-2 py-1 text-xs" @click="emit('close')">Close</button>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-600">Product <span class="text-red-500">*</span></label>
          <select v-model="form.product_id" class="rc-input">
            <option value="">Select product</option>
            <option v-for="product in products" :key="product.id" :value="String(product.id)">{{ product.name }}</option>
          </select>
          <p v-if="errors.product_id?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.product_id[0] }}</p>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-600">Name <span class="text-red-500">*</span></label>
          <input v-model.trim="form.name" class="rc-input" placeholder="e.g. Updated brochure" />
          <p v-if="errors.name?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.name[0] }}</p>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-600">Type <span class="text-red-500">*</span></label>
          <select v-model="form.type" class="rc-input">
            <option value="brochure">brochure</option>
            <option value="proposal">proposal</option>
            <option value="datasheet">datasheet</option>
            <option value="presentation">presentation</option>
          </select>
          <p v-if="errors.type?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.type[0] }}</p>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-600">Replace File (optional)</label>
          <input type="file" class="rc-input" accept=".pdf,.ppt,.pptx,image/*" :disabled="updating" @change="onFileSelected" />
          <p class="mt-1 text-xs text-slate-500">{{ form.file ? form.file.name : 'Leave empty to keep current file.' }}</p>
          <p v-if="errors.file?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.file[0] }}</p>
        </div>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button class="rounded border px-3 py-2 text-sm" :disabled="updating" @click="emit('close')">Cancel</button>
        <button class="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="updating" @click="submit">
          <span v-if="updating" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          {{ updating ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>
