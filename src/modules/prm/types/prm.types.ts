import type { Pagination } from '@/modules/users/services/users.api'

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

/** --- Public invite --- */
export type InvitationPreviewData = {
  organization_display_name: string
  email_masked: string
  expires_at: string
  role_code: string
}

export type InvitationAcceptPayload = {
  token: string
  name: string
  password: string
  password_confirmation: string
  terms_accepted: boolean
}

export type InvitationAcceptUser = {
  id: number
  tenant_id: number
  organization_id?: number | null
  team_id?: number | null
  data_scope?: string
  role: string
  status: string
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
}

export type InvitationAcceptData = {
  token: string | null
  user?: InvitationAcceptUser
  requires_email_verification?: boolean
}

/** --- Org invitations --- */
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked' | string

export type OrganizationInvitationItem = {
  id: number
  email: string
  role_code: string
  status: InvitationStatus
  expires_at?: string | null
  created_at?: string
  updated_at?: string
}

export type InvitationsListResponse = ApiEnvelope<{ items: OrganizationInvitationItem[]; pagination: Pagination }>

export type CreateInvitationPayload = {
  email: string
  role_code: 'partner_admin' | 'reseller_admin'
  expires_in_days?: number
}

/** --- Partner portal --- */
export type PartnerNavItem = {
  key: string
  label: string
  route: string
}

export type PartnerNavigationData = {
  items: PartnerNavItem[]
}

export type PartnerDashboardSummary = {
  partner_organization_id: number
  counts: { leads: number; deals: number; quotes: number }
  commission_pending_total: number
  license_units_available: number
  pipeline_value: number
}

export type PartnerDashboardData = {
  summary: PartnerDashboardSummary
}

export type PartnerLeadItem = {
  id: number
  title: string
  contact_email?: string | null
  company_name?: string | null
  status?: string
  approval_status?: string
  metadata?: Record<string, unknown> | null
  created_at?: string
  updated_at?: string
}

export type PartnerLeadPayload = {
  title: string
  contact_email?: string
  company_name?: string
  status?: string
  approval_status?: string
  metadata?: Record<string, unknown>
}

export type PartnerLeadsListResponse = ApiEnvelope<{ items: PartnerLeadItem[]; pagination: Pagination }>

export type PartnerOpportunityPayload = {
  opportunity_key?: string
  contact_email?: string
  company_id?: number
  name: string
  contact_id?: number
  owner_user_id?: number
  pipeline_id?: number
  pipeline_stage_id?: number
  estimated_value?: number
  currency_code?: string
  [key: string]: unknown
}

export type PartnerCollateralItem = {
  id: number
  name?: string
  title?: string
  resource_category?: string | null
  partner_visible?: boolean
  [key: string]: unknown
}

export type PartnerCollateralsListResponse = ApiEnvelope<{ items: PartnerCollateralItem[]; pagination: Pagination }>

/** --- Programs --- */
export type PartnerProgramItem = {
  id: number
  name?: string
  code?: string
  description?: string | null
  tier_level?: string | number | null
  tier_code?: string | null
  default_commission_percent?: number | string | null
  status?: string | null
  metadata?: Record<string, unknown> | null
  [key: string]: unknown
}

export type ProgramsListResponse = ApiEnvelope<{ items: PartnerProgramItem[] }>

export type PartnerProgramUpsertPayload = {
  name: string
  code: string
  description?: string | null
  tier_level?: string | null
  default_commission_percent?: number | null
  metadata?: Record<string, unknown> | null
  status?: string | null
}

export type PartnerProgramDetailResponse = ApiEnvelope<{ program: PartnerProgramItem }>

/** POST /prm/programs/enroll — tier is server-derived from partner_program_id. */
export type ProgramEnrollPayload = {
  organization_id: number
  partner_program_id: number
  /** When omitted, server uses the program default commission. */
  commission_percent?: number
}

export type ProgramEnrollmentItem = {
  id: number
  organization_id?: number
  partner_program_id?: number
  tier_code?: string
  program_code?: string
  commission_percent?: number | string | null
  /** When API returns denormalized labels */
  program_name?: string
  program_description?: string | null
  description?: string | null
  status?: string
  created_at?: string
  effective_at?: string
  starts_at?: string
  enrolled_at?: string
  organization?: {
    id?: number
    display_name?: string | null
    legal_name?: string | null
    type?: string | null
  }
  [key: string]: unknown
}

export type ProgramEnrollmentsResponse = ApiEnvelope<{ items: ProgramEnrollmentItem[] }>

/** --- Commissions --- */
export type CommissionAccrualStatus = 'pending' | 'approved' | 'paid' | 'void' | string

export type CommissionAccrualItem = {
  id: number
  status: CommissionAccrualStatus
  amount?: number | string
  quote_id?: number | null
  payment_record_id?: number | null
  created_at?: string
  [key: string]: unknown
}

export type CommissionAccrualsListResponse = ApiEnvelope<{ items: CommissionAccrualItem[]; pagination: Pagination }>

/** --- Licenses --- */
export type LicenseEntitlementItem = {
  id: number
  holder_organization_id?: number
  product_id?: number
  units_total?: number
  units_remaining?: number
  units_available?: number
  notes?: string | null
  parent_entitlement_id?: number | null
  holder_organization?: {
    id?: number
    display_name?: string | null
    legal_name?: string | null
    type?: string | null
  }
  product?: {
    id?: number
    name?: string | null
    sku?: string | null
  }
  holder_display_name?: string
  product_name?: string
  [key: string]: unknown
}

export type LicenseEntitlementsListResponse = ApiEnvelope<{ items: LicenseEntitlementItem[]; pagination: Pagination }>

export type LicenseAllocatePayload = {
  holder_organization_id: number
  product_id: number
  units_total: number
  parent_entitlement_id?: number | null
  notes?: string
}

export type LicenseConsumePayload = {
  units: number
}
