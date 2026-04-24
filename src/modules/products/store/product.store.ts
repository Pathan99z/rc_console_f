import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { productsApi } from '@/modules/products/services/product.api'
import type { ProductItem, ProductPayload, ProductUpdatePayload } from '@/modules/products/types/product.types'
import type { Pagination } from '@/modules/users/services/users.api'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

function normalizeStatus(status: ProductItem['status']): 'active' | 'inactive' {
  return status === 1 || status === 'active' ? 'active' : 'inactive'
}

export const useProductsStore = defineStore('products', () => {
  const items = ref<ProductItem[]>([])
  const selected = ref<ProductItem | null>(null)
  const pagination = ref<Pagination>(defaultPagination)
  const loading = ref(false)
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})
  const deletingId = ref<number | null>(null)
  const statusUpdatingId = ref<number | null>(null)
  const filters = ref({
    search: '',
    status: '' as number | '',
    tenant_id: '' as number | '',
  })

  const hasItems = computed(() => items.value.length > 0)

  async function fetchProducts(page = 1, perPage = 15) {
    loading.value = true
    try {
      const { data } = await productsApi.list({
        page,
        per_page: perPage,
        search: filters.value.search || undefined,
        status: filters.value.status,
        tenant_id: filters.value.tenant_id,
      })
      items.value = data.data.items
      pagination.value = data.data.pagination
      message.value = data.message
      return items.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function fetchProductDetail(productId: number) {
    loading.value = true
    try {
      const { data } = await productsApi.detail(productId)
      selected.value = data.data.product
      return selected.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function createProduct(payload: ProductPayload) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await productsApi.create(payload)
      message.value = data.message
      return data.data.product
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function updateProduct(productId: number, payload: ProductUpdatePayload) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await productsApi.update(productId, payload)
      message.value = data.message
      const index = items.value.findIndex((item) => item.id === productId)
      if (index >= 0) items.value[index] = data.data.product
      if (selected.value?.id === productId) selected.value = data.data.product
      return data.data.product
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(productId: number) {
    deletingId.value = productId
    try {
      const { data } = await productsApi.remove(productId)
      message.value = data.message
      items.value = items.value.filter((item) => item.id !== productId)
      if (selected.value?.id === productId) selected.value = null
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      deletingId.value = null
    }
  }

  async function updateStatus(productId: number, nextStatus: number) {
    const index = items.value.findIndex((item) => item.id === productId)
    const previous = index >= 0 ? items.value[index].status : undefined
    if (index >= 0) items.value[index].status = nextStatus as 0 | 1
    statusUpdatingId.value = productId
    try {
      const { data } = await productsApi.updateStatus(productId, nextStatus)
      message.value = data.message
      if (index >= 0) items.value[index] = data.data.product
      if (selected.value?.id === productId) selected.value = data.data.product
      return data.data.product
    } catch (error) {
      if (index >= 0 && previous !== undefined) items.value[index].status = previous
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      statusUpdatingId.value = null
    }
  }

  function toStatusNumber(status: ProductItem['status']) {
    return normalizeStatus(status) === 'active' ? 1 : 0
  }

  return {
    items,
    selected,
    pagination,
    loading,
    message,
    errors,
    deletingId,
    statusUpdatingId,
    filters,
    hasItems,
    fetchProducts,
    fetchProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStatus,
    toStatusNumber,
  }
})
