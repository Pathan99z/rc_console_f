import type { Pagination } from '@/modules/users/services/users.api'

export type OrganizationType = 'company' | 'partner' | 'reseller'
export type OrganizationChannelMode = 'direct' | 'partner_managed'
export type OrganizationStatus = 'active' | 'inactive'
export type OrganizationOnboardingStatus = 'draft' | 'pending_review' | 'approved' | 'active' | 'suspended' | 'rejected'

export type OrganizationItem = {
  id: number
  tenant_id: number
  parent_organization_id?: number | null
  type: OrganizationType
  channel_mode?: OrganizationChannelMode | null
  legal_name: string
  display_name: string
  registration_number?: string | null
  tax_number?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postal_code?: string | null
  onboarding_status: OrganizationOnboardingStatus
  status: OrganizationStatus
  credit_limit?: string | number | null
  metadata?: Record<string, unknown> | null
  parent?: { id: number; display_name: string; type: OrganizationType } | null
  children?: Array<{ id: number; display_name: string; type: OrganizationType }>
  assigned_users?: Array<{ id: number; name: string; email: string; role: string }>
  created_at?: string
  updated_at?: string
}

export type OrganizationPayload = {
  type: OrganizationType
  /** Required for `global_admin` when creating in a specific tenant (same as other tenant-scoped admin APIs). */
  tenant_id?: number
  parent_organization_id?: number | null
  legal_name: string
  display_name: string
  registration_number?: string
  tax_number?: string
  email?: string
  phone?: string
  website?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  onboarding_status?: OrganizationOnboardingStatus
  status?: OrganizationStatus
  credit_limit?: number
  metadata?: Record<string, unknown>
}

export type OrganizationListQuery = {
  page?: number
  per_page?: number
  type?: OrganizationType | ''
  status?: OrganizationStatus | ''
  onboarding_status?: OrganizationOnboardingStatus | ''
  search?: string
  tenant_id?: number | ''
}

export type OrganizationsListResponse = {
  success: boolean
  message: string
  data: { items: OrganizationItem[]; pagination: Pagination }
}

export type OrganizationResponse = {
  success: boolean
  message: string
  data: { organization: OrganizationItem }
}

/** GET /organizations/parent-options — valid parents for the child type being created/edited. */
export type OrganizationParentOptionsQuery = {
  child_type: OrganizationType
  tenant_id?: number
  include_inactive?: boolean
}

export type OrganizationParentOptionsResponse = {
  success: boolean
  message: string
  data: { items: OrganizationItem[] }
}
