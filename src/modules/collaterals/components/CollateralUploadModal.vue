<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { ProductItem } from '@/modules/products/types/product.types'

const props = defineProps<{
  open: boolean
  uploading: boolean
  progress: number
  products: ProductItem[]
  showTenantField: boolean
  errors: Record<string, string[]>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', value: { product_id: string; name: string; type: string; tenant_id: string; file: File | null }): void
}>()

const dragging = ref(false)

const form = reactive({
  product_id: '',
  name: '',
  type: 'brochure',
  tenant_id: '',
  file: null as File | null,
})

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) form.file = file
  input.value = ''
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  dragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) form.file = file
}

function submit() {
  emit('submit', { ...form })
}

function close() {
  emit('close')
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
    <div class="w-full max-w-2xl rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold">Upload Collateral</h3>
        <button class="rounded border px-2 py-1 text-xs" @click="close">Close</button>
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
          <input v-model.trim="form.name" class="rc-input" placeholder="e.g. Sales Brochure" />
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
        <div v-if="showTenantField">
          <label class="mb-1 block text-xs font-semibold text-slate-600">Tenant ID</label>
          <input v-model="form.tenant_id" class="rc-input" type="number" min="1" placeholder="e.g. 3" />
          <p v-if="errors.tenant_id?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.tenant_id[0] }}</p>
        </div>
      </div>

      <label
        class="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-5 text-center"
        :class="dragging ? 'border-indigo-500 bg-indigo-50/40' : 'border-slate-300 bg-slate-50/40'"
        @dragover.prevent="dragging = true"
        @dragleave="dragging = false"
        @drop="onDrop"
      >
        <input type="file" class="hidden" accept=".pdf,.ppt,.pptx,image/*" :disabled="uploading" @change="onFileSelected" />
        <p class="text-sm font-medium text-slate-700">Drag & drop file or click to upload</p>
        <p class="mt-1 text-xs text-slate-500">Allowed: PDF, images, PPT/PPTX</p>
        <p v-if="form.file" class="mt-2 text-xs font-semibold text-slate-700">{{ form.file.name }}</p>
      </label>
      <p v-if="errors.file?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.file[0] }}</p>

      <div v-if="uploading" class="mt-3">
        <div class="h-2 overflow-hidden rounded bg-slate-200">
          <div class="h-full bg-indigo-600 transition-all" :style="{ width: `${progress}%` }"></div>
        </div>
        <p class="mt-1 text-xs text-slate-500">Uploading... {{ progress }}%</p>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <button class="rounded border px-3 py-2 text-sm" :disabled="uploading" @click="close">Cancel</button>
        <button class="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="uploading" @click="submit">
          <span v-if="uploading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          {{ uploading ? 'Uploading...' : 'Upload Collateral' }}
        </button>
      </div>
    </div>
  </div>
</template>
