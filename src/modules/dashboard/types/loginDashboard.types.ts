export type LoginDashboardProfile =
  | 'global_admin'
  | 'company_admin'
  | 'partner_admin'
  | 'reseller_admin'

export type DashboardMetricFormat = 'number' | 'currency' | 'percent' | 'string'

export type DashboardKpiMetric = {
  key: string
  label: string
  value: number | string
  format?: DashboardMetricFormat
  change_percent?: number | null
  tone?: 'default' | 'indigo' | 'emerald' | 'amber' | 'rose'
  link?: string
}

export type DashboardLinkMap = Record<string, string>

export type DashboardSeriesPoint = {
  label?: string
  period?: string
  value?: number
  amount?: number
  revenue?: number
}

export type DashboardActivityRow = {
  id?: number | string
  type?: string
  title?: string
  description?: string
  message?: string
  status?: string
  occurred_at?: string
  created_at?: string
  entity_type?: string
  entity_label?: string
}

export type DashboardAuditRow = {
  id?: number | string
  public_id?: string
  event_key?: string
  action?: string
  module?: string
  title?: string
  occurred_at?: string
  actor_name?: string
  link?: string
}

export type DashboardAlertRow = {
  id?: number | string
  type?: string
  title?: string
  message?: string
  severity?: 'info' | 'warning' | 'error' | string
  link?: string
}

export type LoginDashboardWidgets = {
  onboarding?: Record<string, number | string>
  payments?: {
    success?: number
    failed?: number
    pending?: number
    total?: number
    success_count?: number
    failed_count?: number
    pending_count?: number
  }
  pending_invoices?: { count?: number; items?: DashboardActivityRow[] }
  overdue_tasks?: { count?: number; items?: DashboardActivityRow[] }
  tasks?: { open?: number; overdue?: number; completed?: number }
  invitations?: { pending?: number; accepted?: number; total?: number }
  licenses?: {
    allocated?: number
    consumed?: number
    available?: number
    units?: number
    alerts?: DashboardAlertRow[]
  }
  notifications?: { unread?: number; items?: DashboardActivityRow[] }
  recent_activity?: DashboardActivityRow[]
  recent_crm_activity?: DashboardActivityRow[]
  recent_audit_events?: DashboardAuditRow[]
  audit_events?: DashboardAuditRow[]
  license_alerts?: DashboardAlertRow[]
  assigned_contacts?: number
  revenue_this_month?: number
}

export type LoginDashboardCharts = {
  monthly_revenue?: DashboardSeriesPoint[]
  revenue_trend?: DashboardSeriesPoint[]
  tier_distribution?: Array<{ label: string; value: number; percent?: number }>
  pipeline?: DashboardSeriesPoint[]
}

export type LoginDashboardPayload = {
  dashboard_profile: LoginDashboardProfile
  generated_at?: string
  title?: string
  subtitle?: string
  kpis: DashboardKpiMetric[]
  widgets: LoginDashboardWidgets
  links: DashboardLinkMap
  charts: LoginDashboardCharts
}

export type LoginDashboardApiEnvelope = {
  success: boolean
  message: string
  data: unknown
}
