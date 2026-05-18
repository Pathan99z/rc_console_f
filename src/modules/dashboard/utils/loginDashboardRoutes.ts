export type DashboardRouteContext = {
  organizationId?: number | null
}

/** Maps dashboard link keys to frontend app routes. */
const KEY_ROUTE_MAP: Record<string, string> = {
  contacts: '/app/contacts',
  companies: '/app/companies',
  deals: '/app/deals',
  quotes: '/app/quotes',
  tasks: '/app/tasks',
  payments: '/app/payments',
  invoices: '/app/invoices',
  products: '/app/products',
  collaterals: '/app/collaterals',
  users: '/app/users',
  teams: '/app/teams',
  tenants: '/app/tenants',
  organizations: '/app/organizations',
  partners: '/app/organizations',
  resellers: '/app/organizations',
  notifications: '/app/notifications',
  audit_logs: '/app/settings/audit-logs',
  audit: '/app/settings/audit-logs',
  demo_links: '/app/demo-links',
  email_settings: '/app/settings/email',
  payment_settings: '/app/settings/payment',
  prm: '/app/prm/dashboard',
  partner_dashboard: '/app/prm/dashboard',
  reseller_dashboard: '/app/prm/reseller-dashboard',
  reseller_portal_dashboard: '/app/prm/reseller-dashboard',
  reseller_portal: '/app/prm/reseller-dashboard',
  organization_dashboard: '/app/organizations',
}

/** Legacy/marketing paths that must not be prefixed with /app. */
const LEGACY_PATH_MAP: Record<string, string> = {
  '/partner/dashboard': '/app/prm/dashboard',
  '/partner/reseller-dashboard': '/app/prm/reseller-dashboard',
  '/partner/reseller/dashboard': '/app/prm/reseller-dashboard',
  '/partner/resources': '/app/prm/resources',
  '/partner/my-program': '/app/prm/my-program',
  '/partner/commissions': '/app/prm/commissions',
  '/partner/licenses': '/app/prm/licenses',
  '/partner/programs': '/app/prm/programs',
  '/partner/program-enrollments': '/app/prm/program-enrollments',
  '/audit-logs': '/app/settings/audit-logs',
  '/dashboard': '/app/dashboard',
}

/** Corrects /app paths that do not match registered Vue routes. */
const APP_PATH_ALIASES: Record<string, string> = {
  '/app/audit-logs': '/app/settings/audit-logs',
  '/app/settings/audit': '/app/settings/audit-logs',
  '/app/prm/reseller/dashboard': '/app/prm/reseller-dashboard',
  '/app/prm/partner/dashboard': '/app/prm/dashboard',
  '/app/partner/dashboard': '/app/prm/dashboard',
  '/app/partner/reseller-dashboard': '/app/prm/reseller-dashboard',
  '/app/partner/reseller/dashboard': '/app/prm/reseller-dashboard',
}

function normalizeKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

function lookupKeyRoute(key?: string): string | undefined {
  if (!key) return undefined
  const normalized = normalizeKey(key)
  if (KEY_ROUTE_MAP[normalized]) return KEY_ROUTE_MAP[normalized]
  if (normalized.includes('audit')) return KEY_ROUTE_MAP.audit_logs
  if (normalized.includes('reseller') && normalized.includes('portal')) return KEY_ROUTE_MAP.reseller_portal_dashboard
  if (normalized.includes('reseller') && normalized.includes('dashboard')) return KEY_ROUTE_MAP.reseller_dashboard
  if (normalized.includes('organization') && normalized.includes('dashboard')) return KEY_ROUTE_MAP.organization_dashboard
  if (normalized.includes('partner') && normalized.includes('dashboard')) return KEY_ROUTE_MAP.partner_dashboard
  return undefined
}

function applyPathAliases(path: string): string {
  const trimmed = path.replace(/\/+$/, '') || path
  if (APP_PATH_ALIASES[trimmed]) return APP_PATH_ALIASES[trimmed]

  const orgDashboard = trimmed.match(/^\/app\/organizations\/(\d+)\/dashboard\/?$/)
  if (orgDashboard) return `/app/organizations/${orgDashboard[1]}`

  return trimmed
}

function resolveOrganizationDashboard(path: string, key: string | undefined, ctx?: DashboardRouteContext): string {
  const orgId = ctx?.organizationId
  const orgMatch = path.match(/^\/app\/organizations\/(\d+)\/?$/)
  if (orgMatch) return `/app/organizations/${orgMatch[1]}`

  if (orgId && (path === '/app/organizations' || path === '/app/organization' || !path || path === '/app')) {
    const keyNorm = key ? normalizeKey(key) : ''
    if (keyNorm.includes('organization')) return `/app/organizations/${orgId}`
  }

  if (orgId && path.match(/^\/app\/organizations\/dashboard\/?$/)) {
    return `/app/organizations/${orgId}`
  }

  return path
}

/**
 * Converts backend/API paths (e.g. `/api/contacts`) into in-app Vue Router paths.
 */
export function resolveDashboardAppRoute(
  raw: string | undefined | null,
  key?: string,
  ctx?: DashboardRouteContext,
): string {
  const fallback = lookupKeyRoute(key)

  if (!raw || !String(raw).trim()) {
    if (fallback === '/app/organizations' && ctx?.organizationId) {
      return `/app/organizations/${ctx.organizationId}`
    }
    return fallback || ''
  }

  let path = String(raw).trim()

  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      path = new URL(path).pathname
    } catch {
      return fallback || ''
    }
  }

  const legacy = LEGACY_PATH_MAP[path] || LEGACY_PATH_MAP[path.replace(/\/+$/, '')]
  if (legacy) return legacy

  if (path.startsWith('/api/')) {
    path = `/app/${path.slice(5)}`
  } else if (path.startsWith('/api')) {
    path = `/app${path.slice(4)}`
  }

  if (path.startsWith('/app/')) {
    path = applyPathAliases(path.replace(/\/+$/, '') || '/app/dashboard')
    path = resolveOrganizationDashboard(path, key, ctx)
    return path
  }

  if (path.startsWith('/settings/')) {
    return applyPathAliases(`/app${path}`.replace(/\/+$/, ''))
  }

  if (path.startsWith('/partner/')) {
    const partnerLegacy = LEGACY_PATH_MAP[path] || LEGACY_PATH_MAP[path.replace(/\/+$/, '')]
    if (partnerLegacy) return partnerLegacy
  }

  if (path.startsWith('/') && !path.startsWith('/app')) {
    const auditLegacy = path === '/audit-logs' || path.startsWith('/audit-logs/')
    if (auditLegacy) return '/app/settings/audit-logs'

    const normalized = applyPathAliases(`/app${path}`.replace(/\/+$/, ''))
    if (normalized !== '/app') {
      return resolveOrganizationDashboard(normalized, key, ctx)
    }
  }

  if (!path.startsWith('/') && KEY_ROUTE_MAP[path]) {
    return KEY_ROUTE_MAP[path]
  }

  if (fallback) {
    if (fallback === '/app/organizations' && ctx?.organizationId) {
      return `/app/organizations/${ctx.organizationId}`
    }
    return fallback
  }

  const finalPath = path.startsWith('/') ? path : `/app/${path}`
  return applyPathAliases(resolveOrganizationDashboard(finalPath, key, ctx))
}

export function normalizeDashboardLinks(
  links: Record<string, string>,
  ctx?: DashboardRouteContext,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, path] of Object.entries(links)) {
    const resolved = resolveDashboardAppRoute(path, key, ctx)
    if (resolved && resolved.startsWith('/app')) {
      out[key] = resolved
    }
  }
  return out
}
