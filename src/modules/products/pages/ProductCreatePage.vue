<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import ProductForm from '@/modules/products/components/ProductForm.vue'
import { useProductsStore } from '@/modules/products/store/product.store'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { useToast } from '@/shared/utils/useToast'

const router = useRouter()
const toast = useToast()
const productsStore = useProductsStore()
const { auth, isGlobalAdmin } = useAuth()
const submitting = ref(false)

const form = reactive({
  name: '',
  description: '',
  sku: '',
  unit_price: '',
  tax_rate: '',
  status: 1,
  tenant_id: '',
})

async function submit() {
  if (submitting.value) return
  submitting.value = true
  try {
    await productsStore.createProduct({
      name: form.name.trim(),
      description: form.description || undefined,
      sku: form.sku || undefined,
      unit_price: Number(form.unit_price),
      tax_rate: Number(form.tax_rate || 0) || undefined,
      status: form.status,
      tenant_id:
        isGlobalAdmin.value
          ? Number(form.tenant_id || 0) || undefined
          : auth.user?.tenant_id,
    })
    toast.success('Product created successfully.')
    void router.push('/app/products')
  } catch {
    toast.error(productsStore.message || 'Product create failed.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="space-y-5">
    <header class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Create Product</h2>
        <p class="text-sm text-slate-500">Add a reusable product for quotes and future modules.</p>
      </div>
      <button class="rounded border px-3 py-1.5 text-sm" @click="$router.push('/app/products')">Back</button>
    </header>

    <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <ProductForm
        v-model="form"
        :loading="submitting"
        :errors="productsStore.errors"
        :show-tenant-field="isGlobalAdmin"
        submit-label="Create Product"
        @submit="submit"
      />
    </div>
  </section>
</template>
