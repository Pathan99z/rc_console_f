import type { Pagination } from '@/modules/users/services/users.api'

export type CollateralRef = {
  id: number
  name: string
}

export type CollateralUserRef = {
  id: number
  name: string
  email: string
}

export type CollateralItem = {
  id: number
  tenant_id: number
  product_id: number
  name: string
  type: string
  file_type: string
  file_size: number
  product?: CollateralRef | null
  created_by_user?: CollateralUserRef | null
  created_at: string
  updated_at: string
}

export type CollateralDetail = CollateralItem & {
  signed_url?: string
}

export type CollateralListQuery = {
  per_page?: number
  page?: number
  product_id?: number | ''
  type?: string
  file_type?: string
  search?: string
  tenant_id?: number | ''
}

export type UploadCollateralPayload = {
  product_id: number
  name: string
  type: string
  file: File
  tenant_id?: number
}

export type SendCollateralPayload = {
  contact_id?: number
  email?: string
  message?: string
}

export type UpdateCollateralPayload = {
  product_id: number
  name: string
  type: string
  file?: File
}

export type CollateralsListResponse = {
  success: boolean
  message: string
  data: { items: CollateralItem[]; pagination: Pagination }
}

export type CollateralResponse = {
  success: boolean
  message: string
  data: { collateral: CollateralDetail }
}
