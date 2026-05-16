import type { Pagination } from '@/modules/users/services/users.api'

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

export type DemoLinkLiveStatus = 'up' | 'down' | 'unknown' | string

export type DemoLinkPermissions = {
  can_view?: boolean
  can_edit?: boolean
  can_delete?: boolean
  can_check_status?: boolean
  can_reveal_credentials?: boolean
  can_open?: boolean
}

export type DemoLinkOrgRef = {
  id: number
  type?: string
  display_name?: string | null
  legal_name?: string | null
}

export type DemoLinkProductRef = {
  id: number
  name?: string
}

export type DemoLinkVisibilityEntry = {
  organization_id: number
  include_child_organizations?: boolean
  organization?: DemoLinkOrgRef | null
}

export type DemoLinkItem = {
  id: number
  title: string
  description?: string | null
  demo_url: string
  demo_username?: string | null
  demo_password?: string | null
  demo_password_set?: boolean
  has_password?: boolean
  owner_organization_id?: number
  owner_organization?: DemoLinkOrgRef | null
  products?: DemoLinkProductRef[]
  product_ids?: number[]
  screenshot_url?: string | null
  screenshot_path?: string | null
  is_active?: boolean
  check_live_status?: boolean
  last_status?: DemoLinkLiveStatus | null
  last_checked_at?: string | null
  visibility?: DemoLinkVisibilityEntry[]
  permissions?: DemoLinkPermissions
  created_at?: string
  updated_at?: string
}

export type DemoLinkListParams = {
  page?: number
  per_page?: number
  search?: string
  is_active?: boolean | 0 | 1 | ''
  owner_organization_id?: number
  product_id?: number
}

export type DemoLinkListResponse = ApiEnvelope<{ items: DemoLinkItem[]; pagination: Pagination }>
export type DemoLinkDetailResponse = ApiEnvelope<{ demo_link: DemoLinkItem }>
export type DemoLinkStatusResponse = ApiEnvelope<{ demo_link: DemoLinkItem }>

export type ShareableOrganization = DemoLinkOrgRef & {
  can_include_children?: boolean
}

export type ShareableOrganizationsResponse = ApiEnvelope<{ organizations: ShareableOrganization[] }>

export type DemoLinkVisibilityPayload = {
  organization_id: number
  include_child_organizations?: boolean
}

export type DemoLinkPayload = {
  owner_organization_id: number
  title: string
  demo_url: string
  demo_username?: string
  demo_password?: string
  description?: string
  product_ids?: number[]
  is_active?: boolean
  check_live_status?: boolean
  visibility?: DemoLinkVisibilityPayload[]
  screenshot?: File | null
}

export type DemoLinkUpdatePayload = Partial<Omit<DemoLinkPayload, 'owner_organization_id'>> & {
  owner_organization_id?: number
  remove_screenshot?: boolean
}
