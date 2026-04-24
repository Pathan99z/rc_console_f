import type { Pagination } from '@/modules/users/services/users.api'

export type ProductStatus = 'active' | 'inactive' | 0 | 1

export type ProductUserRef = {
  id: number
  name: string
  email: string
}

export type ProductItem = {
  id: number
  tenant_id: number
  name: string
  description?: string | null
  sku?: string | null
  unit_price: string | number
  tax_rate?: string | number | null
  status: ProductStatus
  created_by_user?: ProductUserRef | null
  updated_by_user?: ProductUserRef | null
  created_at: string
  updated_at: string
}

export type ProductListQuery = {
  per_page?: number
  page?: number
  search?: string
  status?: number | ''
  tenant_id?: number | ''
}

export type ProductPayload = {
  name: string
  description?: string
  sku?: string
  unit_price: number
  tax_rate?: number
  status?: number
  tenant_id?: number
}

export type ProductUpdatePayload = Partial<ProductPayload>

export type ProductsListResponse = {
  success: boolean
  message: string
  data: { items: ProductItem[]; pagination: Pagination }
}

export type ProductResponse = {
  success: boolean
  message: string
  data: { product: ProductItem }
}
