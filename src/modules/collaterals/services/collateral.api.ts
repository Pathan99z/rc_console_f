import { apiClient } from '@/core/http/apiClient'
import type {
  CollateralListQuery,
  CollateralResponse,
  CollateralsListResponse,
  SendCollateralPayload,
  UpdateCollateralPayload,
  UploadCollateralPayload,
} from '@/modules/collaterals/types/collateral.types'

function toOptionalNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const collateralsApi = {
  list(params: CollateralListQuery) {
    return apiClient.get<CollateralsListResponse>('/collaterals', {
      params: {
        page: params.page,
        per_page: params.per_page,
        product_id: toOptionalNumber(params.product_id),
        type: params.type || undefined,
        file_type: params.file_type || undefined,
        search: params.search || undefined,
        tenant_id: toOptionalNumber(params.tenant_id),
      },
    })
  },
  upload(payload: UploadCollateralPayload, onProgress?: (percent: number) => void) {
    const form = new FormData()
    form.append('product_id', String(payload.product_id))
    form.append('name', payload.name)
    form.append('type', payload.type)
    form.append('file', payload.file)
    if (payload.tenant_id) form.append('tenant_id', String(payload.tenant_id))

    return apiClient.post<CollateralResponse>('/collaterals', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (!evt.total || !onProgress) return
        const percent = Math.round((evt.loaded / evt.total) * 100)
        onProgress(percent)
      },
    })
  },
  detail(collateralId: number) {
    return apiClient.get<CollateralResponse>(`/collaterals/${collateralId}`)
  },
  update(collateralId: number, payload: UpdateCollateralPayload) {
    if (payload.file) {
      const form = new FormData()
      form.append('product_id', String(payload.product_id))
      form.append('name', payload.name)
      form.append('type', payload.type)
      form.append('file', payload.file)
      return apiClient.put<CollateralResponse>(`/collaterals/${collateralId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    return apiClient.put<CollateralResponse>(`/collaterals/${collateralId}`, {
      product_id: payload.product_id,
      name: payload.name,
      type: payload.type,
    })
  },
  remove(collateralId: number) {
    return apiClient.delete<{ success: boolean; message: string }>(`/collaterals/${collateralId}`)
  },
  send(collateralId: number, payload: SendCollateralPayload) {
    return apiClient.post<{ success: boolean; message: string; data: Record<string, never> }>(`/collaterals/${collateralId}/send`, payload)
  },
}
