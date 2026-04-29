<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import ProductFilters from '@/modules/products/components/ProductFilters.vue'
import ProductTable from '@/modules/products/components/ProductTable.vue'
import { useProductsStore } from '@/modules/products/store/product.store'
import { useToast } from '@/shared/utils/useToast'
import { useAuth } from '@/modules/auth/composables/useAuth'
import type { ProductItem } from '@/modules/products/types/product.types'

const router = useRouter()
const toast = useToast()
const productsStore = useProductsStore()
const { isGlobalAdmin, isPrivilegedUser } = useAuth()

const showViewModal = ref(false)

const canDelete = computed(() => isPrivilegedUser.value)
const viewItem = computed(() => productsStore.selected)

async function loadProducts(page = 1) {
  await productsStore.fetchProducts(page, productsStore.pagination.per_page)
}

function onFilterSearch(value: string) {
  productsStore.filters.search = value
}

function onFilterStatus(value: number | '') {
  productsStore.filters.status = value
}

function onFilterTenant(value: number | '') {
  productsStore.filters.tenant_id = value
}

async function applyFilters() {
  await loadProducts(1)
}

async function resetFilters() {
  productsStore.filters.search = ''
  productsStore.filters.status = ''
  productsStore.filters.tenant_id = ''
  await loadProducts(1)
}

async function onView(item: ProductItem) {
  try {
    await productsStore.fetchProductDetail(item.id)
    showViewModal.value = true
  } catch {
    toast.error(productsStore.message || 'Unable to load product details.')
  }
}

function onEdit(item: ProductItem) {
  void router.push(`/app/products/${item.id}/edit`)
}

async function onDelete(item: ProductItem) {
  if (!window.confirm('Delete this product?')) return
  try {
    await productsStore.deleteProduct(item.id)
    toast.success('Product deleted successfully.')
  } catch {
    toast.error(productsStore.message || 'Unable to delete product.')
  }
}

async function onStatusToggle(payload: { item: ProductItem; status: number }) {
  try {
    await productsStore.updateStatus(payload.item.id, payload.status)
    toast.success('Product status updated.')
  } catch {
    toast.error(productsStore.message || 'Unable to update status.')
  }
}

onMounted(() => {
  void loadProducts()
})
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Products</h2>
        <p class="text-sm text-slate-500">Manage reusable products for quotes and future modules.</p>
      </div>
      <button class="btn-secondary rounded-lg px-4 py-2 text-sm font-semibold" @click="$router.push('/app/products/create')">Create Product</button>
    </header>

    <ProductFilters
      :search="productsStore.filters.search"
      :status="productsStore.filters.status"
      :tenant-id="productsStore.filters.tenant_id"
      :show-tenant-filter="isGlobalAdmin"
      :loading="productsStore.loading"
      @update:search="onFilterSearch"
      @update:status="onFilterStatus"
      @update:tenant-id="onFilterTenant"
      @apply="applyFilters"
      @reset="resetFilters"
    />

    <div v-if="productsStore.loading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">
      Loading products...
    </div>

    <ProductTable
      v-else
      :items="productsStore.items"
      :can-delete="canDelete"
      :deleting-id="productsStore.deletingId"
      :status-updating-id="productsStore.statusUpdatingId"
      @view="onView"
      @edit="onEdit"
      @delete="onDelete"
      @status-toggle="onStatusToggle"
    />

    <PaginationControls
      :current-page="productsStore.pagination.current_page"
      :last-page="productsStore.pagination.last_page"
      @change="(page) => loadProducts(page)"
    />

    <div v-if="showViewModal && viewItem" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-2xl rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">Product Details</h3>
          <button class="rounded border px-2 py-1 text-xs" @click="showViewModal = false">Close</button>
        </div>
        <div class="grid gap-3 text-sm md:grid-cols-2">
          <p><span class="font-semibold text-slate-700">Name:</span> {{ viewItem.name }}</p>
          <p><span class="font-semibold text-slate-700">Status:</span> {{ viewItem.status }}</p>
          <p><span class="font-semibold text-slate-700">SKU:</span> {{ viewItem.sku || '-' }}</p>
          <p><span class="font-semibold text-slate-700">Unit Price:</span> {{ viewItem.unit_price }}</p>
          <p><span class="font-semibold text-slate-700">Tax Rate:</span> {{ viewItem.tax_rate ?? '-' }}</p>
          <p><span class="font-semibold text-slate-700">Tenant:</span> {{ viewItem.tenant_id }}</p>
          <p class="md:col-span-2"><span class="font-semibold text-slate-700">Description:</span> {{ viewItem.description || '-' }}</p>
          <p><span class="font-semibold text-slate-700">Created By:</span> {{ viewItem.created_by_user?.name || '-' }}</p>
          <p><span class="font-semibold text-slate-700">Updated By:</span> {{ viewItem.updated_by_user?.name || '-' }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
