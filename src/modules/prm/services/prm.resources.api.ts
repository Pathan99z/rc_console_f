import { apiClient } from '@/core/http/apiClient'
import type { ApiEnvelope } from '@/modules/prm/types/prm.types'
import type {
  AdminResourceDetailResponse,
  AdminResourceListResponse,
  CreatePrmResourcePayload,
  PartnerResourceDownloadResponse,
  PartnerResourceListResponse,
  PrmAnalyticsResponse,
  PrmResourceItem,
  UpdatePrmResourcePayload,
} from '@/modules/prm/types/prm.resources.types'

function toOptionalNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function appendBool(fd: FormData, key: string, value: boolean) {
  fd.append(key, value ? '1' : '0')
}

function buildResourceFormData(payload: CreatePrmResourcePayload | UpdatePrmResourcePayload, includeFile: boolean) {
  const fd = new FormData()
  fd.append('title', payload.title)
  if (payload.description != null && payload.description !== '') fd.append('description', payload.description)
  fd.append('category', payload.category)
  fd.append('resource_category', payload.category)
  fd.append('product_id', String(payload.product_id))
  appendBool(fd, 'partner_visible', payload.partner_visible)
  appendBool(fd, 'reseller_visible', payload.reseller_visible)
  fd.append('status', String(payload.status))
  if (payload.metadata && Object.keys(payload.metadata).length) {
    fd.append('metadata', JSON.stringify(payload.metadata))
  }
  if (includeFile && 'file' in payload && payload.file) {
    fd.append('file', payload.file)
  }
  return fd
}

function buildResourceJsonBody(payload: UpdatePrmResourcePayload) {
  return {
    title: payload.title,
    description: payload.description ?? '',
    category: payload.category,
    resource_category: payload.category,
    product_id: payload.product_id,
    partner_visible: payload.partner_visible,
    reseller_visible: payload.reseller_visible,
    status: payload.status,
    metadata: payload.metadata ?? null,
  }
}

export type AdminResourceListQuery = {
  page?: number
  per_page?: number
  search?: string
  category?: string
  product_id?: number | ''
  status?: string
  /** Required for `global_admin` when scoping tenant (matches other PRM admin APIs). */
  tenant_id?: number
}

export type PartnerResourceListQuery = {
  page?: number
  per_page?: number
  search?: string
  resource_category?: string
  product_id?: number | ''
}

export const prmResourcesApi = {
  adminList(params?: AdminResourceListQuery) {
    return apiClient.get<AdminResourceListResponse>('/prm/resources', {
      params: {
        page: params?.page,
        per_page: params?.per_page,
        search: params?.search || undefined,
        category: params?.category || undefined,
        resource_category: params?.category || undefined,
        product_id: toOptionalNumber(params?.product_id),
        status: params?.status || undefined,
        tenant_id: params?.tenant_id,
      },
    })
  },

  adminAnalytics(tenantId?: number) {
    return apiClient.get<PrmAnalyticsResponse>('/prm/resources/analytics', {
      params: tenantId ? { tenant_id: tenantId } : undefined,
    })
  },

  adminDetail(resourceId: number, tenantId?: number) {
    return apiClient.get<AdminResourceDetailResponse>(`/prm/resources/${resourceId}`, {
      params: tenantId ? { tenant_id: tenantId } : undefined,
    })
  },

  adminCreate(
    payload: CreatePrmResourcePayload,
    options?: { onProgress?: (percent: number) => void; tenantId?: number },
  ) {
    const fd = buildResourceFormData(payload, true)
    if (options?.tenantId != null) fd.append('tenant_id', String(options.tenantId))
    return apiClient.post<ApiEnvelope<{ resource?: PrmResourceItem }>>('/prm/resources', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (!evt.total || !options?.onProgress) return
        options.onProgress(Math.round((evt.loaded / evt.total) * 100))
      },
    })
  },

  adminUpdate(
    resourceId: number,
    payload: UpdatePrmResourcePayload,
    options?: { onProgress?: (percent: number) => void; tenantId?: number },
  ) {
    const params = options?.tenantId != null ? { tenant_id: options.tenantId } : undefined
    if (payload.file) {
      const fd = buildResourceFormData({ ...payload, file: payload.file } as CreatePrmResourcePayload, true)
      if (options?.tenantId != null) fd.append('tenant_id', String(options.tenantId))
      return apiClient.put<ApiEnvelope<{ resource?: PrmResourceItem }>>(`/prm/resources/${resourceId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params,
        onUploadProgress: (evt) => {
          if (!evt.total || !options?.onProgress) return
          options.onProgress(Math.round((evt.loaded / evt.total) * 100))
        },
      })
    }
    return apiClient.put<ApiEnvelope<{ resource?: PrmResourceItem }>>(
      `/prm/resources/${resourceId}`,
      buildResourceJsonBody(payload),
      { params },
    )
  },

  adminPatchStatus(resourceId: number, status: string, tenantId?: number) {
    return apiClient.patch<ApiEnvelope<unknown>>(`/prm/resources/${resourceId}/status`, { status }, {
      params: tenantId != null ? { tenant_id: tenantId } : undefined,
    })
  },

  adminDelete(resourceId: number, tenantId?: number) {
    return apiClient.delete<ApiEnvelope<unknown>>(`/prm/resources/${resourceId}`, {
      params: tenantId != null ? { tenant_id: tenantId } : undefined,
    })
  },

  partnerList(params?: PartnerResourceListQuery) {
    return apiClient.get<PartnerResourceListResponse>('/prm/partner/resources/collaterals', {
      params: {
        page: params?.page,
        per_page: params?.per_page,
        search: params?.search || undefined,
        resource_category: params?.resource_category || undefined,
        product_id: toOptionalNumber(params?.product_id),
      },
    })
  },

  partnerRecordDownload(collateralId: number) {
    return apiClient.post<PartnerResourceDownloadResponse>(`/prm/partner/resources/collaterals/${collateralId}/downloads`, {})
  },
}
