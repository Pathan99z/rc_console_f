import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { prmResourcesApi } from '@/modules/prm/services/prm.resources.api'
import type {
  PartnerResourceItem,
  PrmAnalyticsData,
  PrmResourceItem,
  CreatePrmResourcePayload,
  UpdatePrmResourcePayload,
} from '@/modules/prm/types/prm.resources.types'
import type { Pagination } from '@/modules/users/services/users.api'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

function pickDownloadUrlFromEnvelope(d: { url?: string; signed_url?: string; download_url?: string }): string | null {
  return d.download_url || d.signed_url || d.url || null
}

function normalizeAnalytics(raw: PrmAnalyticsData) {
  const totals = raw.totals || {}
  const totalResources = raw.total_resources ?? totals.total_resources ?? 0
  const activeResources = raw.active_resources ?? totals.active_resources ?? 0
  const inactiveResources = raw.inactive_resources ?? totals.inactive_resources ?? 0
  const totalDownloads = raw.total_downloads ?? totals.total_downloads ?? 0
  return {
    totalResources,
    activeResources,
    inactiveResources,
    totalDownloads,
    topDownloaded: raw.top_downloaded_resources ?? [],
    topDownloaders: raw.top_partner_downloaders ?? [],
  }
}

export type ResourceAdminFilters = {
  search: string
  category: string
  product_id: string
  status: string
}

export type ResourcePartnerFilters = {
  search: string
  resource_category: string
  product_id: string
}

export const usePrmResourcesStore = defineStore('prmResources', () => {
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})

  const adminResources = ref<PrmResourceItem[]>([])
  const adminResourcesLoading = ref(false)
  const adminResourcesPagination = ref<Pagination>({ ...defaultPagination })
  const adminFilters = reactive<ResourceAdminFilters>({
    search: '',
    category: '',
    product_id: '',
    status: '',
  })

  const selectedResource = ref<PrmResourceItem | null>(null)
  const selectedResourceLoading = ref(false)
  const savingResource = ref(false)
  const uploadProgress = ref(0)

  const analyticsLoading = ref(false)
  const analytics = ref<ReturnType<typeof normalizeAnalytics> | null>(null)

  const partnerResources = ref<PartnerResourceItem[]>([])
  const partnerResourcesLoading = ref(false)
  const partnerResourcesPagination = ref<Pagination>({ ...defaultPagination })
  const partnerFilters = reactive<ResourcePartnerFilters>({
    search: '',
    resource_category: '',
    product_id: '',
  })

  const downloadingId = ref<number | null>(null)
  const deletingId = ref<number | null>(null)

  function globalAdminScopedTenantId(): number | undefined {
    const u = useAuthStore().user
    if (u?.role === 'global_admin' && typeof u.tenant_id === 'number' && u.tenant_id > 0) return u.tenant_id
    return undefined
  }

  function optionalProductId(raw: string): number | undefined {
    const t = raw.trim()
    if (!t) return undefined
    const n = Number(t)
    return Number.isFinite(n) && n > 0 ? n : undefined
  }

  async function fetchAdminResources(page?: number, perPage?: number) {
    adminResourcesLoading.value = true
    try {
      const p = page ?? adminResourcesPagination.value.current_page
      const pp = perPage ?? adminResourcesPagination.value.per_page
      const { data } = await prmResourcesApi.adminList({
        page: p,
        per_page: pp,
        search: adminFilters.search.trim() || undefined,
        category: adminFilters.category || undefined,
        product_id: optionalProductId(adminFilters.product_id),
        status: adminFilters.status || undefined,
        tenant_id: globalAdminScopedTenantId(),
      })
      adminResources.value = data.data.items
      adminResourcesPagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    } finally {
      adminResourcesLoading.value = false
    }
  }

  async function fetchResource(resourceId: number) {
    selectedResourceLoading.value = true
    selectedResource.value = null
    try {
      const { data } = await prmResourcesApi.adminDetail(resourceId, globalAdminScopedTenantId())
      const d = data.data as { resource?: PrmResourceItem } & Partial<PrmResourceItem>
      selectedResource.value = d.resource ?? (typeof d.id === 'number' ? (d as PrmResourceItem) : null)
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      selectedResource.value = null
      throw n
    } finally {
      selectedResourceLoading.value = false
    }
  }

  async function createResource(payload: CreatePrmResourcePayload) {
    savingResource.value = true
    uploadProgress.value = 0
    try {
      const { data } = await prmResourcesApi.adminCreate(payload, {
        onProgress: (pct) => {
          uploadProgress.value = pct
        },
        tenantId: globalAdminScopedTenantId(),
      })
      message.value = data.message
      await fetchAdminResources(adminResourcesPagination.value.current_page, adminResourcesPagination.value.per_page)
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      errors.value = n.fieldErrors
      throw n
    } finally {
      savingResource.value = false
      uploadProgress.value = 0
    }
  }

  async function updateResource(resourceId: number, payload: UpdatePrmResourcePayload) {
    savingResource.value = true
    uploadProgress.value = 0
    try {
      const { data } = await prmResourcesApi.adminUpdate(resourceId, payload, {
        onProgress: payload.file ? (pct) => (uploadProgress.value = pct) : undefined,
        tenantId: globalAdminScopedTenantId(),
      })
      message.value = data.message
      await fetchAdminResources(adminResourcesPagination.value.current_page, adminResourcesPagination.value.per_page)
      if (selectedResource.value?.id === resourceId) {
        const r = data.data.resource ?? (data.data as unknown as PrmResourceItem)
        if (r && typeof (r as PrmResourceItem).id === 'number') selectedResource.value = r as PrmResourceItem
      }
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      errors.value = n.fieldErrors
      throw n
    } finally {
      savingResource.value = false
      uploadProgress.value = 0
    }
  }

  async function toggleStatus(resourceId: number, status: string) {
    try {
      const { data } = await prmResourcesApi.adminPatchStatus(resourceId, status, globalAdminScopedTenantId())
      message.value = data.message
      await fetchAdminResources(adminResourcesPagination.value.current_page, adminResourcesPagination.value.per_page)
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    }
  }

  async function deleteResource(resourceId: number) {
    deletingId.value = resourceId
    try {
      const { data } = await prmResourcesApi.adminDelete(resourceId, globalAdminScopedTenantId())
      message.value = data.message
      await fetchAdminResources(adminResourcesPagination.value.current_page, adminResourcesPagination.value.per_page)
      if (selectedResource.value?.id === resourceId) selectedResource.value = null
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    } finally {
      deletingId.value = null
    }
  }

  async function fetchAnalytics() {
    analyticsLoading.value = true
    try {
      const { data } = await prmResourcesApi.adminAnalytics(globalAdminScopedTenantId())
      analytics.value = normalizeAnalytics(data.data)
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      analytics.value = null
      throw n
    } finally {
      analyticsLoading.value = false
    }
  }

  async function fetchPartnerResources(page?: number, perPage?: number) {
    partnerResourcesLoading.value = true
    try {
      const p = page ?? partnerResourcesPagination.value.current_page
      const pp = perPage ?? partnerResourcesPagination.value.per_page
      const { data } = await prmResourcesApi.partnerList({
        page: p,
        per_page: pp,
        search: partnerFilters.search.trim() || undefined,
        resource_category: partnerFilters.resource_category || undefined,
        product_id: optionalProductId(partnerFilters.product_id),
      })
      partnerResources.value = data.data.items
      partnerResourcesPagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    } finally {
      partnerResourcesLoading.value = false
    }
  }

  async function downloadPartnerResource(collateralId: number): Promise<string | null> {
    downloadingId.value = collateralId
    try {
      const { data } = await prmResourcesApi.partnerRecordDownload(collateralId)
      message.value = data.message
      const url = pickDownloadUrlFromEnvelope(data.data as { url?: string; signed_url?: string; download_url?: string })
      return url
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    } finally {
      downloadingId.value = null
    }
  }

  function clearSelection() {
    selectedResource.value = null
  }

  return {
    message,
    errors,
    adminResources,
    adminResourcesLoading,
    adminResourcesPagination,
    adminFilters,
    selectedResource,
    selectedResourceLoading,
    savingResource,
    uploadProgress,
    analytics,
    analyticsLoading,
    partnerResources,
    partnerResourcesLoading,
    partnerResourcesPagination,
    partnerFilters,
    downloadingId,
    deletingId,
    fetchAdminResources,
    fetchResource,
    createResource,
    updateResource,
    toggleStatus,
    deleteResource,
    fetchAnalytics,
    fetchPartnerResources,
    downloadPartnerResource,
    clearSelection,
  }
})
