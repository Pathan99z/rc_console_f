<script setup lang="ts">
import { reactive, watch } from 'vue'

type ProductFormModel = {
  name: string
  description: string
  sku: string
  unit_price: string
  tax_rate: string
  status: number
  tenant_id: string
}

const props = defineProps<{
  modelValue: ProductFormModel
  loading?: boolean
  showTenantField?: boolean
  submitLabel: string
  errors?: Record<string, string[]>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProductFormModel): void
  (e: 'submit'): void
}>()

const localForm = reactive<ProductFormModel>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (value) => {
    Object.assign(localForm, value)
  },
  { deep: true }
)

watch(
  localForm,
  (value) => {
    emit('update:modelValue', { ...value })
  },
  { deep: true }
)
</script>

<template>
  <form class="space-y-4" @submit.prevent="emit('submit')">
    <div class="grid gap-3 md:grid-cols-2">
      <div>
        <label class="mb-1 block text-xs font-semibold text-slate-600">Name <span class="text-red-500">*</span></label>
        <input v-model.trim="localForm.name" class="rc-input" placeholder="e.g. CRM License" />
        <p v-if="errors?.name?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.name[0] }}</p>
      </div>
      <div>
        <label class="mb-1 block text-xs font-semibold text-slate-600">SKU</label>
        <input v-model.trim="localForm.sku" class="rc-input" placeholder="e.g. CRM-001" />
        <p v-if="errors?.sku?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.sku[0] }}</p>
      </div>
      <div>
        <label class="mb-1 block text-xs font-semibold text-slate-600">Unit Price <span class="text-red-500">*</span></label>
        <input v-model="localForm.unit_price" class="rc-input" type="number" min="0.01" step="0.01" placeholder="e.g. 1999.99" />
        <p v-if="errors?.unit_price?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.unit_price[0] }}</p>
      </div>
      <div>
        <label class="mb-1 block text-xs font-semibold text-slate-600">Tax Rate (%)</label>
        <input v-model="localForm.tax_rate" class="rc-input" type="number" min="0" step="0.01" placeholder="e.g. 18" />
        <p v-if="errors?.tax_rate?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.tax_rate[0] }}</p>
      </div>
      <div>
        <label class="mb-1 block text-xs font-semibold text-slate-600">Status</label>
        <select v-model="localForm.status" class="rc-input">
          <option :value="1">Active</option>
          <option :value="0">Inactive</option>
        </select>
      </div>
      <div v-if="showTenantField">
        <label class="mb-1 block text-xs font-semibold text-slate-600">Tenant ID</label>
        <input v-model="localForm.tenant_id" class="rc-input" type="number" min="1" placeholder="e.g. 3" />
        <p v-if="errors?.tenant_id?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.tenant_id[0] }}</p>
      </div>
      <div class="md:col-span-2">
        <label class="mb-1 block text-xs font-semibold text-slate-600">Description</label>
        <textarea v-model.trim="localForm.description" class="rc-input" rows="3" placeholder="e.g. Annual plan"></textarea>
      </div>
    </div>

    <div class="flex justify-end">
      <button class="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="loading" type="submit">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
        {{ loading ? 'Saving...' : submitLabel }}
      </button>
    </div>
  </form>
</template>
