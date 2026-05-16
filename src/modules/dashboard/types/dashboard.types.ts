import type { Pagination } from '@/modules/users/services/users.api'

export type DashboardDatePreset =
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'this_year'
  | 'all_time'
  | 'custom'

export type DashboardDateRange = {
  preset?: DashboardDatePreset
  from?: string
  to?: string
}

/** Sent on the wire — only from / to (YYYY-MM-DD). */
export type DashboardApiQueryParams = {
  from?: string
  to?: string
}

/** UI state (preset mapped to from/to before API calls). */
export type DashboardQueryParams = DashboardDateRange

export type DashboardOrganizationContext = {
  id: number
  display_name?: string
  legal_name?: string
  type?: string
  channel_mode?: string | null
  status?: string
  onboarding_status?: string
  parent?: { id: number; display_name?: string; type?: string } | null
}

export type DashboardKpis = {
  label?: string
  value?: number | string
  change_percent?: number | null
  format?: 'number' | 'currency' | 'percent'
}

export type OrganizationDashboardOverview = {
  context?: DashboardOrganizationContext
  generated_at?: string
  crm?: {
    contacts?: number
    companies?: number
    deals?: number
    quotes?: number
  }
  deals?: {
    open?: number
    won?: number
    lost?: number
    pending?: number
    conversion_percent?: number
    average_value?: number
    pipeline_value?: number
  }
  revenue?: {
    total?: number
    successful_payments?: number
    failed_payments?: number
    pending_payments?: number
    quote_conversion_percent?: number
  }
  commissions?: {
    pending?: number
    approved?: number
    paid?: number
    accrued?: number
  }
  licenses?: {
    allocated?: number
    consumed?: number
    available?: number
    transfers?: number
    activations?: number
  }
  users?: {
    active?: number
    inactive?: number
    suspended?: number
    consultants?: number
    managers?: number
  }
  resources?: {
    downloads?: number
    top_collateral?: { id?: number; title?: string; downloads?: number } | null
  }
}

export type DashboardPipelineStage = {
  stage?: string
  label?: string
  count?: number
  value?: number
}

export type OrganizationDashboardPipeline = {
  stages?: DashboardPipelineStage[]
  open?: number
  won?: number
  lost?: number
  pending?: number
  conversion_percent?: number
  pipeline_value?: number
}

export type DashboardRevenueSeriesPoint = {
  period?: string
  label?: string
  revenue?: number
  amount?: number
}

export type OrganizationDashboardRevenue = {
  total?: number
  successful_payments?: number
  failed_payments?: number
  pending_payments?: number
  quote_conversion_percent?: number
  series?: DashboardRevenueSeriesPoint[]
  by_product?: Array<{ product_id?: number; name?: string; revenue?: number }>
  by_child_reseller?: Array<{ organization_id?: number; name?: string; revenue?: number }>
}

export type DashboardCommissionItem = {
  id?: number
  status?: string
  amount?: number
  program_name?: string
  created_at?: string
}

export type OrganizationDashboardCommissions = {
  pending?: number
  approved?: number
  paid?: number
  accrued?: number
  items?: DashboardCommissionItem[]
  monthly_trend?: DashboardRevenueSeriesPoint[]
  by_status?: Array<{ status?: string; count?: number; amount?: number }>
}

export type DashboardLicenseTransfer = {
  id?: number
  units?: number
  product_name?: string
  to_organization?: string
  created_at?: string
}

export type OrganizationDashboardLicenses = {
  allocated?: number
  consumed?: number
  available?: number
  transfers?: number
  activations?: number
  transfer_items?: DashboardLicenseTransfer[]
  by_product?: Array<{ product_id?: number; name?: string; allocated?: number; consumed?: number }>
  monthly_activations?: DashboardRevenueSeriesPoint[]
}

export type DashboardActivityItem = {
  id?: number | string
  type?: string
  title?: string
  description?: string
  entity_type?: string
  entity_label?: string
  occurred_at?: string
  created_at?: string
}

export type OrganizationDashboardActivity = {
  items?: DashboardActivityItem[]
}

export type DashboardTeamMember = {
  id?: number
  name?: string
  email?: string
  role?: string
  status?: string
}

export type DashboardTeamPerformance = {
  user_id?: number
  name?: string
  deals_won?: number
  revenue?: number
  win_ratio?: number
}

export type OrganizationDashboardTeam = {
  members?: DashboardTeamMember[]
  performance?: DashboardTeamPerformance[]
  active?: number
  inactive?: number
  suspended?: number
}

export type DashboardResourceDownload = {
  id?: number
  title?: string
  downloads?: number
  category?: string
}

export type OrganizationDashboardResources = {
  downloads?: number
  top_collateral?: DashboardResourceDownload[]
  trend?: DashboardRevenueSeriesPoint[]
}

export type OrganizationDashboardPayoutSummary = {
  id: number
  payout_number?: string
  status?: string
  net_amount?: number
  paid_at?: string | null
}

export type OrganizationDashboardPayouts = {
  pending_approval_count?: number
  processing_amount?: number
  paid_mtd?: number
  failed_count?: number
  commission_liability_approved?: number
  last_payout_amount?: number
  last_payout_at?: string | null
  next_payout_estimate?: number
  recent?: OrganizationDashboardPayoutSummary[]
}

export type PartnerDashboardAnalytics = {
  overview?: OrganizationDashboardOverview
  pipeline?: OrganizationDashboardPipeline
  revenue?: OrganizationDashboardRevenue
  commissions?: OrganizationDashboardCommissions
  licenses?: OrganizationDashboardLicenses
  activity?: OrganizationDashboardActivity
  team?: OrganizationDashboardTeam
  resources?: OrganizationDashboardResources
  includes_children?: boolean
}

export type ResellerDashboardAnalytics = PartnerDashboardAnalytics

export type ResellerNavigationItem = {
  key: string
  label: string
  route?: string
  permission?: string | null
}

export type DashboardApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

/** Common wrapper from org dashboard GET endpoints. */
export type OrganizationDashboardApiData = {
  organization?: DashboardOrganizationContext
  scope_organization_ids?: number[]
  includes_children?: boolean
  period?: { from?: string | null; to?: string | null }
  generated_at?: string
  kpis?: Record<string, unknown>
  pipeline?: OrganizationDashboardPipeline
  revenue?: OrganizationDashboardRevenue
  commissions?: OrganizationDashboardCommissions
  licenses?: OrganizationDashboardLicenses
  activity?: OrganizationDashboardActivity | DashboardActivityItem[]
  team?: OrganizationDashboardTeam
  resources?: OrganizationDashboardResources
}

export type DashboardSectionKey =
  | 'overview'
  | 'pipeline'
  | 'revenue'
  | 'commissions'
  | 'payouts'
  | 'licenses'
  | 'activity'
  | 'team'
  | 'resources'
