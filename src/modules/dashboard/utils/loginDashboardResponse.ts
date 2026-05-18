import type {
  DashboardActivityRow,
  DashboardAuditRow,
  DashboardKpiMetric,
  DashboardLinkMap,
  DashboardSeriesPoint,
  LoginDashboardCharts,
  LoginDashboardPayload,
  LoginDashboardProfile,
  LoginDashboardWidgets,
} from '@/modules/dashboard/types/loginDashboard.types'
import { normalizeDashboardLinks, resolveDashboardAppRoute } from '@/modules/dashboard/utils/loginDashboardRoutes'

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function pickString(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const v = row[key]
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v)
  }
  return ''
}

function pickNumber(row: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const v = row[key]
    if (v === undefined || v === null || v === '') continue
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function normalizeFormat(raw?: string): DashboardKpiMetric['format'] {
  const f = String(raw || '').toLowerCase()
  if (f === 'currency' || f === 'money') return 'currency'
  if (f === 'percent' || f === 'percentage') return 'percent'
  return 'number'
}

function normalizeTone(raw?: string): DashboardKpiMetric['tone'] {
  const t = String(raw || '').toLowerCase()
  if (t === 'indigo' || t === 'emerald' || t === 'amber' || t === 'rose') return t
  return 'default'
}

function metricFromEntry(key: string, raw: unknown, links: DashboardLinkMap): DashboardKpiMetric | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'number' || typeof raw === 'string') {
    return { key, label: titleCaseKey(key), value: raw, format: typeof raw === 'number' ? 'number' : 'string' }
  }
  const row = asRecord(raw)
  if (!row) return null
  const label = pickString(row, ['label', 'title', 'name']) || titleCaseKey(key)
  const value = row.value ?? row.amount ?? row.count ?? row.total
  if (value === undefined || value === null) return null
  return {
    key,
    label,
    value: value as number | string,
    format: normalizeFormat(pickString(row, ['format', 'type'])),
    change_percent: pickNumber(row, ['change_percent', 'change', 'delta_percent']),
    tone: normalizeTone(pickString(row, ['tone', 'variant'])),
    link: resolveDashboardAppRoute(pickString(row, ['link', 'href', 'url']) || links[key], key, undefined),
  }
}

function titleCaseKey(key: string): string {
  return key
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

function normalizeKpis(data: Record<string, unknown>, links: DashboardLinkMap): DashboardKpiMetric[] {
  const out: DashboardKpiMetric[] = []
  const rawKpis = data.kpis

  if (Array.isArray(rawKpis)) {
    for (const item of rawKpis) {
      const row = asRecord(item)
      if (!row) continue
      const key = pickString(row, ['key', 'id']) || `kpi_${out.length}`
      const m = metricFromEntry(key, item, links)
      if (m) out.push(m)
    }
    return out
  }

  if (asRecord(rawKpis)) {
    const obj = asRecord(rawKpis)!
    for (const [key, val] of Object.entries(obj)) {
      const m = metricFromEntry(key, val, links)
      if (m) out.push(m)
    }
    return out
  }

  const skip = new Set([
    'dashboard_profile',
    'generated_at',
    'title',
    'subtitle',
    'widgets',
    'links',
    'charts',
    'kpis',
    'organization',
    'tenant',
    'meta',
  ])

  for (const [key, val] of Object.entries(data)) {
    if (skip.has(key)) continue
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) continue
    const m = metricFromEntry(key, val, links)
    if (m) out.push(m)
  }

  return out
}

function normalizeLinks(raw: unknown): DashboardLinkMap {
  const row = asRecord(raw)
  if (!row) return {}
  const out: DashboardLinkMap = {}
  for (const [key, val] of Object.entries(row)) {
    if (typeof val === 'string' && val.trim()) {
      const resolved = resolveDashboardAppRoute(val, key)
      if (resolved) out[key] = resolved
    } else if (val && typeof val === 'object' && 'path' in (val as object)) {
      const path = pickString(asRecord(val)!, ['path', 'route', 'url', 'href'])
      const resolved = resolveDashboardAppRoute(path, key)
      if (resolved) out[key] = resolved
    }
  }
  return normalizeDashboardLinks(out)
}

function normalizeActivityList(raw: unknown): DashboardActivityRow[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item, index) => {
    const row = asRecord(item)
    if (!row) return { id: index, title: String(item) }
    return {
      id: row.id ?? index,
      type: pickString(row, ['type', 'event_type']),
      title: pickString(row, ['title', 'subject', 'name']),
      description: pickString(row, ['description', 'message', 'body']),
      message: pickString(row, ['message']),
      status: pickString(row, ['status']),
      occurred_at: pickString(row, ['occurred_at', 'created_at', 'timestamp']),
      created_at: pickString(row, ['created_at']),
      entity_type: pickString(row, ['entity_type', 'module']),
      entity_label: pickString(row, ['entity_label', 'entity_name']),
    }
  })
}

function normalizeAuditList(raw: unknown): DashboardAuditRow[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item, index) => {
    const row = asRecord(item)
    if (!row) return { id: index }
    return {
      id: row.id ?? row.public_id ?? index,
      public_id: pickString(row, ['public_id']),
      event_key: pickString(row, ['event_key', 'action', 'event']),
      action: pickString(row, ['action']),
      module: pickString(row, ['module']),
      title: pickString(row, ['title', 'message']),
      occurred_at: pickString(row, ['occurred_at', 'created_at']),
      actor_name: pickString(row, ['actor_name', 'actor', 'user_name']),
      link: pickString(row, ['link', 'href']),
    }
  })
}

function normalizeWidgets(raw: unknown, data: Record<string, unknown>): LoginDashboardWidgets {
  const widgetsRoot = asRecord(raw) ?? asRecord(data.widgets) ?? {}
  const w = widgetsRoot || {}

  const paymentsRaw = asRecord(w.payments) ?? asRecord(data.payments)
  const payments = paymentsRaw
    ? {
        success: pickNumber(paymentsRaw, ['success', 'successful', 'success_count']),
        failed: pickNumber(paymentsRaw, ['failed', 'failure', 'failed_count']),
        pending: pickNumber(paymentsRaw, ['pending', 'pending_count']),
        total: pickNumber(paymentsRaw, ['total']),
      }
    : undefined

  return {
    onboarding: asRecord(w.onboarding) ?? undefined,
    payments,
    pending_invoices: w.pending_invoices
      ? {
          count: pickNumber(asRecord(w.pending_invoices)!, ['count', 'total']),
          items: normalizeActivityList(asRecord(w.pending_invoices)?.items ?? w.pending_invoices),
        }
      : undefined,
    overdue_tasks: w.overdue_tasks
      ? {
          count: pickNumber(asRecord(w.overdue_tasks)!, ['count', 'total']),
          items: normalizeActivityList(asRecord(w.overdue_tasks)?.items ?? w.overdue_tasks),
        }
      : undefined,
    tasks: asRecord(w.tasks) as LoginDashboardWidgets['tasks'],
    invitations: asRecord(w.invitations) as LoginDashboardWidgets['invitations'],
    licenses: asRecord(w.licenses) as LoginDashboardWidgets['licenses'],
    notifications: w.notifications
      ? {
          unread: pickNumber(asRecord(w.notifications)!, ['unread', 'unread_count', 'count']),
          items: normalizeActivityList(asRecord(w.notifications)?.items ?? w.notifications),
        }
      : undefined,
    recent_activity: normalizeActivityList(w.recent_activity ?? w.recent_crm_activity ?? data.recent_activity),
    recent_crm_activity: normalizeActivityList(w.recent_crm_activity),
    recent_audit_events: normalizeAuditList(
      w.recent_audit_events ?? w.audit_events ?? data.recent_audit_events ?? data.audit_events,
    ),
    audit_events: normalizeAuditList(w.audit_events ?? data.audit_events),
    license_alerts: Array.isArray(w.license_alerts)
      ? (w.license_alerts as LoginDashboardWidgets['license_alerts'])
      : undefined,
    assigned_contacts: pickNumber(w, ['assigned_contacts', 'contacts_assigned']),
    revenue_this_month: pickNumber(w, ['revenue_this_month', 'revenue_month']),
  }
}

function normalizeCharts(raw: unknown, data: Record<string, unknown>): LoginDashboardCharts {
  const chartsRoot = asRecord(raw) ?? asRecord(data.charts) ?? {}
  const c = chartsRoot || {}

  const toSeries = (arr: unknown): DashboardSeriesPoint[] => {
    if (!Array.isArray(arr)) return []
    return arr.map((item) => {
      const row = asRecord(item)
      if (!row) return {}
      return {
        label: pickString(row, ['label', 'month', 'period', 'name']),
        period: pickString(row, ['period']),
        value: pickNumber(row, ['value', 'count', 'amount']),
        amount: pickNumber(row, ['amount', 'revenue', 'value']),
        revenue: pickNumber(row, ['revenue', 'amount', 'value']),
      }
    })
  }

  let tier_distribution: LoginDashboardCharts['tier_distribution']
  const tierRaw = c.tier_distribution ?? data.tier_distribution
  if (Array.isArray(tierRaw)) {
    tier_distribution = tierRaw.map((item) => {
      const row = asRecord(item)
      return {
        label: pickString(row || {}, ['label', 'name']),
        value: pickNumber(row || {}, ['value', 'count', 'percent']) ?? 0,
        percent: pickNumber(row || {}, ['percent', 'percentage']),
      }
    })
  }

  return {
    monthly_revenue: toSeries(c.monthly_revenue ?? c.revenue_trend ?? data.monthly_revenue),
    revenue_trend: toSeries(c.revenue_trend ?? c.monthly_revenue),
    tier_distribution,
    pipeline: toSeries(c.pipeline ?? c.deals_pipeline),
  }
}

function normalizeProfile(raw: string, fallback: LoginDashboardProfile): LoginDashboardProfile {
  const value = raw.toLowerCase()
  if (value === 'global_admin' || value === 'global') return 'global_admin'
  if (value === 'company_admin' || value === 'company' || value === 'tenant') return 'company_admin'
  if (value === 'reseller_admin' || value === 'reseller') return 'reseller_admin'
  if (value === 'partner_admin' || value === 'partner') return 'partner_admin'
  return fallback
}

export function resolveLoginDashboardProfile(
  apiProfile: string,
  userRole?: string | null,
  navigationProfile?: string | null,
): LoginDashboardProfile {
  if (apiProfile) return normalizeProfile(apiProfile, 'company_admin')
  const nav = (navigationProfile || '').toLowerCase()
  if (nav.includes('global')) return 'global_admin'
  if (nav.includes('company') || nav.includes('tenant')) return 'company_admin'
  if (nav.includes('reseller')) return 'reseller_admin'
  if (nav.includes('partner')) return 'partner_admin'

  const role = (userRole || '').toLowerCase()
  if (role === 'global_admin') return 'global_admin'
  if (role === 'company_admin') return 'company_admin'
  if (role.startsWith('reseller_')) return 'reseller_admin'
  if (role.startsWith('partner_')) return 'partner_admin'
  return 'company_admin'
}

export function unwrapLoginDashboardBody(body: unknown): LoginDashboardPayload | null {
  if (!body || typeof body !== 'object') return null
  const root = body as Record<string, unknown>
  const data = (root.data ?? root) as Record<string, unknown>
  const row = asRecord(data)
  if (!row) return null

  const links = normalizeLinks(row.links)
  const widgets = normalizeWidgets(row.widgets, row)
  const charts = normalizeCharts(row.charts, row)
  const kpis = normalizeKpis(row, links)

  const profileRaw = pickString(row, ['dashboard_profile', 'profile', 'navigation_profile'])
  const profile = resolveLoginDashboardProfile(profileRaw, null, null)

  return {
    dashboard_profile: profile,
    generated_at: pickString(row, ['generated_at', 'generatedAt', 'updated_at']),
    title: pickString(row, ['title', 'heading']),
    subtitle: pickString(row, ['subtitle', 'description']),
    kpis,
    widgets,
    links,
    charts,
  }
}
