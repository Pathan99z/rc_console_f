import { apiClient } from '@/core/http/apiClient'
import type {
  ProductListQuery,
  ProductPayload,
  ProductResponse,
  ProductsListResponse,
  ProductUpdatePayload,
} from '@/modules/products/types/product.types'

function toOptionalNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const productsApi = {
  list(params: ProductListQuery) {
    return apiClient.get<ProductsListResponse>('/products', {
      params: {
        page: params.page,
        per_page: params.per_page,
        search: params.search || undefined,
        status: params.status === '' ? undefined : params.status,
        tenant_id: toOptionalNumber(params.tenant_id),
      },
    })
  },
  create(payload: ProductPayload) {
    return apiClient.post<ProductResponse>('/products', payload)
  },
  detail(productId: number) {
    return apiClient.get<ProductResponse>(`/products/${productId}`)
  },
  update(productId: number, payload: ProductUpdatePayload) {
    return apiClient.put<ProductResponse>(`/products/${productId}`, payload)
  },
  remove(productId: number) {
    return apiClient.delete<{ success: boolean; message: string }>(`/products/${productId}`)
  },
  updateStatus(productId: number, status: number) {
    return apiClient.patch<ProductResponse>(`/products/${productId}/status`, { status })
  },
}
