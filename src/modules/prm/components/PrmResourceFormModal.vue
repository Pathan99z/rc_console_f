<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { productsApi } from '@/modules/products/services/product.api'
import type { ProductItem } from '@/modules/products/types/product.types'
import { usePrmResourcesStore } from '@/modules/prm/store/prm.resources.store'
import type { PrmResourceItem } from '@/modules/prm/types/prm.resources.types'
import { useToast } from '@/shared/utils/useToast'

const RESOURCE_CATEGORIES = [
  { value: 'training', label: 'Training' },
  { value: 'brochure', label: 'Brochure' },
  { value: 'battle_card', label: 'Battle card' },
  { value: 'nda', label: 'NDA' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'sales', label: 'Sales' },
  { value: 'enablement', label: 'Enablement' },
  { value: 'other', label: 'Other' },
] as const

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  resource: PrmResourceItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const store = usePrmResourcesStore()
const toast = useToast()

const form = reactive({
  title: '',
  description: '',
  category: 'training',
  product_id: '' as string,
  partner_visible: true,
  reseller_visible: false,
  status: 'active' as 'active' | 'inactive',
  metadataJson: '',
})

const productSearch = ref('')
const productOptions = ref<ProductItem[]>([])
const productsLoading = ref(false)
const pinnedProduct = ref<ProductItem | null>(null)
let productDebounce: ReturnType<typeof setTimeout> | null = null

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const dragOver = ref(false)
const advancedOpen = ref(false)

const mergedProductOptions = computed(() => {
  const list = [...productOptions.value]
  const id = Number(form.product_id)
  if (pinnedProduct.value && Number.isFinite(id) && id === pinnedProduct.value.id && !list.some((p) => p.id === id)) {
    list.unshift(pinnedProduct.value)
  }
  return list
})

function productLabel(p: ProductItem) {
  const base = (p.name || '').trim() || `Product #${p.id}`
  return p.sku ? `${base} · ${p.sku}` : base
}

async function fetchProductOptions() {
  productsLoading.value = true
  try {
    const { data } = await productsApi.list({
      page: 1,
      per_page: 100,
      search: productSearch.value.trim() || undefined,
      status: 1,
    })
    productOptions.value = data.data.items
  } catch {
    productOptions.value = []
  } finally {
    productsLoading.value = false
  }
}

function scheduleProductFetch() {
  if (productDebounce) clearTimeout(productDebounce)
  productDebounce = setTimeout(() => {
    productDebounce = null
    void fetchProductOptions()
  }, 300)
}

watch(productSearch, scheduleProductFetch)

watch(productOptions, (opts) => {
  const id = Number(form.product_id)
  if (!form.product_id || !Number.isFinite(id) || id <= 0) return
  const found = opts.find((p) => p.id === id)
  if (found) pinnedProduct.value = found
})

watch(
  () => form.product_id,
  (v) => {
    if (!v) {
      pinnedProduct.value = null
      return
    }
    const id = Number(v)
    const found = productOptions.value.find((p) => p.id === id)
    if (found) pinnedProduct.value = found
  },
)

function resetForm() {
  form.title = ''
  form.description = ''
  form.category = 'training'
  form.product_id = ''
  form.partner_visible = true
  form.reseller_visible = false
  form.status = 'active'
  form.metadataJson = ''
  productSearch.value = ''
  selectedFile.value = null
  advancedOpen.value = false
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function hydrateFromResource(r: PrmResourceItem) {
  form.title = (r.title as string) || ''
  form.description = (r.description as string) || ''
  form.category = (r.category || r.resource_category || 'training') as string
  form.product_id = r.product_id != null ? String(r.product_id) : ''
  form.partner_visible = Boolean(r.partner_visible)
  form.reseller_visible = Boolean(r.reseller_visible)
  form.status = (r.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive'
  form.metadataJson = r.metadata && typeof r.metadata === 'object' ? JSON.stringify(r.metadata, null, 2) : ''
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
  if (r.product && typeof r.product.id === 'number') {
    pinnedProduct.value = {
      id: r.product.id!,
      tenant_id: 0,
      name: r.product.name || `Product #${r.product.id}`,
      sku: r.product.sku ?? null,
      unit_price: 0,
      status: 1,
      created_at: '',
      updated_at: '',
    } as ProductItem
  }
  const allowed = new Set<string>(RESOURCE_CATEGORIES.map((c) => c.value))
  if (!allowed.has(form.category)) {
    form.category = 'other'
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    void fetchProductOptions()
    if (props.mode === 'create') {
      resetForm()
    } else if (props.resource) {
      hydrateFromResource(props.resource)
    }
  },
)

watch(
  () => props.resource?.id,
  () => {
    if (!props.modelValue || props.mode !== 'edit' || !props.resource) return
    hydrateFromResource(props.resource)
  },
)

function close() {
  emit('update:modelValue', false)
}

function onFilePick(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  selectedFile.value = f ?? null
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) selectedFile.value = f
}

function parseMetadata(): Record<string, unknown> | null {
  const raw = form.metadataJson.trim()
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>
    toast.error('Metadata must be a JSON object.')
    return null
  } catch {
    toast.error('Metadata must be valid JSON.')
    return null
  }
}

async function submit() {
  const title = form.title.trim()
  const productId = Number(form.product_id)
  if (!title) {
    toast.error('Title is required.')
    return
  }
  if (!Number.isFinite(productId) || productId <= 0) {
    toast.error('Select a product.')
    return
  }
  const metadata = parseMetadata()
  if (form.metadataJson.trim() && metadata === null) return

  if (props.mode === 'create' && !selectedFile.value) {
    toast.error('Choose a file to upload.')
    return
  }

  try {
    if (props.mode === 'create' && selectedFile.value) {
      await store.createResource({
        title,
        description: form.description.trim() || undefined,
        category: form.category,
        product_id: productId,
        partner_visible: form.partner_visible,
        reseller_visible: form.reseller_visible,
        status: form.status,
        metadata,
        file: selectedFile.value,
      })
    } else if (props.mode === 'edit' && props.resource) {
      await store.updateResource(props.resource.id, {
        title,
        description: form.description.trim() || undefined,
        category: form.category,
        product_id: productId,
        partner_visible: form.partner_visible,
        reseller_visible: form.reseller_visible,
        status: form.status,
        metadata,
        file: selectedFile.value,
      })
    }
    toast.success(store.message || 'Saved.')
    emit('saved')
    close()
  } catch {
    toast.error(store.message || 'Save failed.')
  }
}

const existingFileHint = computed(() => {
  if (props.mode !== 'edit' || !props.resource) return ''
  const name = (props.resource.file_name as string) || (props.resource.title as string) || 'Current file'
  return name
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      @click.self="close"
    >
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--rc-border-soft)] bg-white shadow-2xl" @click.stop>
      <header class="border-b border-slate-100 px-6 py-4">
        <h3 class="text-base font-semibold text-slate-900">{{ props.mode === 'create' ? 'Upload resource' : 'Edit resource' }}</h3>
        <p class="mt-0.5 text-xs text-slate-500">PRM-governed partner materials linked to catalog products.</p>
      </header>

      <div class="space-y-4 px-6 py-4">
        <div class="space-y-1">
          <label for="prm-res-title" class="text-xs font-medium uppercase tracking-wide text-slate-600">Title</label>
          <input id="prm-res-title" v-model.trim="form.title" type="text" class="rc-input w-full" placeholder="Resource title" />
        </div>
        <div class="space-y-1">
          <label for="prm-res-desc" class="text-xs font-medium uppercase tracking-wide text-slate-600">Description</label>
          <textarea id="prm-res-desc" v-model.trim="form.description" rows="3" class="rc-input w-full resize-y" placeholder="Short summary" />
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="space-y-1">
            <label for="prm-res-cat" class="text-xs font-medium uppercase tracking-wide text-slate-600">Category</label>
            <select id="prm-res-cat" v-model="form.category" class="rc-input w-full">
              <option v-for="c in RESOURCE_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
          </div>
          <div class="space-y-1 sm:col-span-2">
            <label for="prm-res-prod-search" class="text-xs font-medium uppercase tracking-wide text-slate-600">Product</label>
            <input
              id="prm-res-prod-search"
              v-model.trim="productSearch"
              type="search"
              class="rc-input w-full"
              placeholder="Search active products…"
              autocomplete="off"
            />
            <select id="prm-res-prod" v-model="form.product_id" class="rc-input mt-1 w-full" aria-label="Selected product">
              <option value="" disabled>Select product…</option>
              <option v-for="p in mergedProductOptions" :key="p.id" :value="String(p.id)">{{ productLabel(p) }}</option>
            </select>
            <p v-if="productsLoading" class="text-xs text-slate-400">Updating products…</p>
          </div>
        </div>

        <fieldset class="rounded-lg border border-slate-200 p-3">
          <legend class="px-1 text-xs font-semibold uppercase text-slate-600">Visibility</legend>
          <div class="mt-2 flex flex-wrap gap-4">
            <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
              <input v-model="form.partner_visible" type="checkbox" class="rounded border-slate-300" />
              Partner visible
            </label>
            <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
              <input v-model="form.reseller_visible" type="checkbox" class="rounded border-slate-300" />
              Reseller visible
            </label>
          </div>
        </fieldset>

        <div class="space-y-1">
          <label for="prm-res-status" class="text-xs font-medium uppercase tracking-wide text-slate-600">Status</label>
          <select id="prm-res-status" v-model="form.status" class="rc-input w-full">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          type="button"
          class="flex w-full items-center justify-between rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-100"
          @click="advancedOpen = !advancedOpen"
        >
          Advanced: metadata JSON
          <span>{{ advancedOpen ? '−' : '+' }}</span>
        </button>
        <div v-show="advancedOpen" class="space-y-1">
          <label for="prm-res-meta" class="text-xs text-slate-500">Optional JSON object stored with the resource.</label>
          <textarea id="prm-res-meta" v-model="form.metadataJson" rows="4" class="rc-input w-full font-mono text-xs" placeholder="{}" />
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-600">File</p>
          <p v-if="props.mode === 'edit' && existingFileHint" class="text-xs text-slate-500">Current: {{ existingFileHint }}. Upload a new file to replace.</p>
          <div
            class="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors"
            :class="dragOver ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 bg-slate-50/80'"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="onDrop"
            @click="fileInputRef?.click()"
          >
            <p class="text-sm font-medium text-slate-700">Drag & drop or click to browse</p>
            <p v-if="selectedFile" class="mt-2 text-xs text-blue-700">{{ selectedFile.name }}</p>
            <p v-else-if="props.mode === 'create'" class="mt-1 text-xs text-slate-500">Required for new resources</p>
          </div>
          <input ref="fileInputRef" type="file" class="hidden" @change="onFilePick" />
        </div>

        <div v-if="store.savingResource && store.uploadProgress > 0" class="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
          Uploading… {{ store.uploadProgress }}%
        </div>
      </div>

      <footer class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
        <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="close">
          Cancel
        </button>
        <button
          type="button"
          class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          :disabled="store.savingResource"
          @click="submit"
        >
          {{ store.savingResource ? 'Saving…' : 'Save' }}
        </button>
      </footer>
      </div>
    </div>
  </Teleport>
</template>
