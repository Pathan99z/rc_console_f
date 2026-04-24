import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { collateralsApi } from '@/modules/collaterals/services/collateral.api'
import type {
  CollateralDetail,
  CollateralItem,
  SendCollateralPayload,
  UpdateCollateralPayload,
  UploadCollateralPayload,
} from '@/modules/collaterals/types/collateral.types'
import { productsApi } from '@/modules/products/services/product.api'
import type { ProductItem } from '@/modules/products/types/product.types'
import { contactsApi, type ContactItem } from '@/modules/contacts/services/contacts.api'
import type { Pagination } from '@/modules/users/services/users.api'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const useCollateralsStore = defineStore('collaterals', () => {
  const items = ref<CollateralItem[]>([])
  const selected = ref<CollateralDetail | null>(null)
  const products = ref<ProductItem[]>([])
  const contacts = ref<ContactItem[]>([])
  const pagination = ref<Pagination>(defaultPagination)
  const loading = ref(false)
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const updatingId = ref<number | null>(null)
  const deletingId = ref<number | null>(null)
  const sendingId = ref<number | null>(null)
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})
  const filters = ref({
    search: '',
    product_id: '' as number | '',
    type: '',
    file_type: '',
    tenant_id: '' as number | '',
  })

  async function fetchCollaterals(page = 1, perPage = 15) {
    loading.value = true
    try {
      const { data } = await collateralsApi.list({
        page,
        per_page: perPage,
        search: filters.value.search || undefined,
        product_id: filters.value.product_id,
        type: filters.value.type || undefined,
        file_type: filters.value.file_type || undefined,
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

  async function uploadCollateral(payload: UploadCollateralPayload) {
    uploading.value = true
    uploadProgress.value = 0
    errors.value = {}
    try {
      const { data } = await collateralsApi.upload(payload, (percent) => {
        uploadProgress.value = percent
      })
      message.value = data.message
      return data.data.collateral
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      uploading.value = false
      uploadProgress.value = 0
    }
  }

  async function getCollateralDetail(collateralId: number) {
    loading.value = true
    try {
      const { data } = await collateralsApi.detail(collateralId)
      selected.value = data.data.collateral
      return selected.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function updateCollateral(collateralId: number, payload: UpdateCollateralPayload) {
    updatingId.value = collateralId
    errors.value = {}
    try {
      const { data } = await collateralsApi.update(collateralId, payload)
      message.value = data.message
      const index = items.value.findIndex((item) => item.id === collateralId)
      if (index >= 0) items.value[index] = data.data.collateral
      if (selected.value?.id === collateralId) selected.value = data.data.collateral
      return data.data.collateral
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      updatingId.value = null
    }
  }

  async function deleteCollateral(collateralId: number) {
    deletingId.value = collateralId
    try {
      const { data } = await collateralsApi.remove(collateralId)
      message.value = data.message
      items.value = items.value.filter((item) => item.id !== collateralId)
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      deletingId.value = null
    }
  }

  async function sendCollateral(collateralId: number, payload: SendCollateralPayload) {
    sendingId.value = collateralId
    errors.value = {}
    try {
      const { data } = await collateralsApi.send(collateralId, payload)
      message.value = data.message
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      sendingId.value = null
    }
  }

  async function fetchProductOptions() {
    try {
      const { data } = await productsApi.list({ per_page: 100, page: 1, status: 1 })
      products.value = data.data.items
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    }
  }

  async function fetchContactOptions() {
    try {
      const { data } = await contactsApi.list({ per_page: 100, page: 1 })
      contacts.value = data.data.items
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    }
  }

  return {
    items,
    selected,
    products,
    contacts,
    pagination,
    loading,
    uploading,
    uploadProgress,
    updatingId,
    deletingId,
    sendingId,
    message,
    errors,
    filters,
    fetchCollaterals,
    uploadCollateral,
    getCollateralDetail,
    updateCollateral,
    deleteCollateral,
    sendCollateral,
    fetchProductOptions,
    fetchContactOptions,
  }
})
