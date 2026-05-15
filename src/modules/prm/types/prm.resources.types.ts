import type { ApiEnvelope } from '@/modules/prm/types/prm.types'
import type { Pagination } from '@/modules/users/services/users.api'

export type PrmResourceStatus = 'active' | 'inactive' | string

export type PrmResourceFileMeta = {
  name?: string | null
  original_name?: string | null
  size?: number | null
  mime_type?: string | null
  type?: string | null
  [key: string]: unknown
}

/** Admin-managed PRM resource row (list/detail). */
export type PrmResourceItem = {
  id: number
  title?: string
  description?: string | null
  category?: string | null
  resource_category?: string | null
  product_id?: number | null
  product?: { id?: number; name?: string | null; sku?: string | null } | null
  partner_visible?: boolean
  reseller_visible?: boolean
  status?: PrmResourceStatus
  downloads_count?: number
  download_count?: number
  downloads?: number
  collateral_id?: number | null
  file_name?: string | null
  mime_type?: string | null
  file_size?: number | null
  /** Signed GET URL for preview/download (show + list when API includes it). */
  signed_url?: string | null
  file?: PrmResourceFileMeta | null
  updated_at?: string | null
  created_at?: string | null
  metadata?: Record<string, unknown> | null
  [key: string]: unknown
}

export type AdminResourceListResponse = ApiEnvelope<{ items: PrmResourceItem[]; pagination: Pagination }>

export type AdminResourceDetailResponse = ApiEnvelope<{ resource: PrmResourceItem }>

export type PrmAnalyticsTopResource = {
  id?: number
  title?: string
  download_count?: number
  downloads?: number
  [key: string]: unknown
}

export type PrmAnalyticsTopDownloader = {
  organization_id?: number
  organization_name?: string
  partner_organization_name?: string
  download_count?: number
  downloads?: number
  [key: string]: unknown
}

export type PrmAnalyticsData = {
  total_resources?: number
  active_resources?: number
  inactive_resources?: number
  total_downloads?: number
  totals?: {
    total_resources?: number
    active_resources?: number
    inactive_resources?: number
    total_downloads?: number
  }
  top_downloaded_resources?: PrmAnalyticsTopResource[]
  top_partner_downloaders?: PrmAnalyticsTopDownloader[]
  [key: string]: unknown
}

export type PrmAnalyticsResponse = ApiEnvelope<PrmAnalyticsData>

export type CreatePrmResourcePayload = {
  title: string
  description?: string
  category: string
  product_id: number
  partner_visible: boolean
  reseller_visible: boolean
  status: PrmResourceStatus
  metadata?: Record<string, unknown> | null
  file: File
}

export type UpdatePrmResourcePayload = {
  title: string
  description?: string
  category: string
  product_id: number
  partner_visible: boolean
  reseller_visible: boolean
  status: PrmResourceStatus
  metadata?: Record<string, unknown> | null
  file?: File | null
}

/** Partner-facing resource (governed collateral view). */
export type PartnerResourceItem = {
  id: number
  title?: string
  name?: string
  description?: string | null
  category?: string | null
  resource_category?: string | null
  product_id?: number | null
  product?: { id?: number; name?: string | null; sku?: string | null } | null
  partner_visible?: boolean
  reseller_visible?: boolean
  created_at?: string | null
  updated_at?: string | null
  download_url?: string | null
  preview_url?: string | null
  signed_url?: string | null
  [key: string]: unknown
}

export type PartnerResourceListResponse = ApiEnvelope<{ items: PartnerResourceItem[]; pagination: Pagination }>

export type PartnerResourceDownloadData = {
  url?: string
  signed_url?: string
  download_url?: string
}

export type PartnerResourceDownloadResponse = ApiEnvelope<PartnerResourceDownloadData>
