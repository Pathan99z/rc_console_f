<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductForm from '@/modules/products/components/ProductForm.vue'
import { useProductsStore } from '@/modules/products/store/product.store'
import { useToast } from '@/shared/utils/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const productsStore = useProductsStore()
const loading = ref(false)
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

const productId = Number(route.params.id || 0)

async function loadProduct() {
  if (!productId) {
    void router.push('/app/products')
    return
  }
  loading.value = true
  try {
    const product = await productsStore.fetchProductDetail(productId)
    form.name = product?.name || ''
    form.description = product?.description || ''
    form.sku = product?.sku || ''
    form.unit_price = String(product?.unit_price || '')
    form.tax_rate = product?.tax_rate === null || product?.tax_rate === undefined ? '' : String(product.tax_rate)
    form.status = productsStore.toStatusNumber(product?.status ?? 1)
    form.tenant_id = String(product?.tenant_id || '')
  } catch {
    toast.error(productsStore.message || 'Unable to load product.')
    void router.push('/app/products')
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!productId || submitting.value) return
  submitting.value = true
  try {
    await productsStore.updateProduct(productId, {
      name: form.name.trim() || undefined,
      description: form.description || undefined,
      sku: form.sku || undefined,
      unit_price: Number(form.unit_price || 0) || undefined,
      tax_rate: Number(form.tax_rate || 0) || undefined,
      status: form.status,
    })
    toast.success('Product updated successfully.')
    void router.push('/app/products')
  } catch {
    toast.error(productsStore.message || 'Product update failed.')
  } finally {
    submitting.value = false
  }
}

onMounted(loadProduct)
</script>

<template>
  <section class="space-y-5">
    <header class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Edit Product</h2>
        <p class="text-sm text-slate-500">Update product information with tenant-safe controls.</p>
      </div>
      <button class="rounded border px-3 py-1.5 text-sm" @click="$router.push('/app/products')">Back</button>
    </header>

    <div v-if="loading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">Loading product...</div>

    <div v-else class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <ProductForm
        v-model="form"
        :loading="submitting"
        :errors="productsStore.errors"
        :show-tenant-field="false"
        submit-label="Save Product"
        @submit="submit"
      />
    </div>
  </section>
</template>
