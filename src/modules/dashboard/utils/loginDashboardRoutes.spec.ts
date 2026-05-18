import { describe, expect, it } from 'vitest'
import {
  normalizeDashboardLinks,
  resolveDashboardAppRoute,
} from '@/modules/dashboard/utils/loginDashboardRoutes'

describe('loginDashboardRoutes', () => {
  it('maps /api/contacts to /app/contacts', () => {
    expect(resolveDashboardAppRoute('/api/contacts', 'contacts')).toBe('/app/contacts')
  })

  it('maps bare /contacts to /app/contacts', () => {
    expect(resolveDashboardAppRoute('/contacts')).toBe('/app/contacts')
  })

  it('uses key fallback when path is empty', () => {
    expect(resolveDashboardAppRoute('', 'deals')).toBe('/app/deals')
    expect(resolveDashboardAppRoute('', 'audit_logs')).toBe('/app/settings/audit-logs')
  })

  it('normalizes all links in a map', () => {
    const result = normalizeDashboardLinks({
      contacts: '/api/contacts',
      deals: '/api/deals',
      audit_logs: '/api/settings/audit-logs',
    })
    expect(result).toEqual({
      contacts: '/app/contacts',
      deals: '/app/deals',
      audit_logs: '/app/settings/audit-logs',
    })
  })

  it('preserves already-correct app routes', () => {
    expect(resolveDashboardAppRoute('/app/quotes', 'quotes')).toBe('/app/quotes')
  })

  it('maps /api/audit-logs to settings audit route', () => {
    expect(resolveDashboardAppRoute('/api/audit-logs', 'audit_logs')).toBe('/app/settings/audit-logs')
    expect(resolveDashboardAppRoute('/audit-logs', 'audit_logs')).toBe('/app/settings/audit-logs')
    expect(resolveDashboardAppRoute('/app/audit-logs', 'audit_logs')).toBe('/app/settings/audit-logs')
  })

  it('maps partner/reseller portal paths without /app/partner prefix', () => {
    expect(resolveDashboardAppRoute('/partner/reseller-dashboard', 'reseller_portal_dashboard')).toBe(
      '/app/prm/reseller-dashboard',
    )
    expect(resolveDashboardAppRoute('/api/prm/reseller/dashboard', 'reseller_portal_dashboard')).toBe(
      '/app/prm/reseller-dashboard',
    )
    expect(resolveDashboardAppRoute('/app/partner/reseller-dashboard', 'reseller_portal_dashboard')).toBe(
      '/app/prm/reseller-dashboard',
    )
  })

  it('maps organization dashboard to org detail when org id is known', () => {
    expect(resolveDashboardAppRoute('/api/organizations/42/dashboard', 'organization_dashboard')).toBe(
      '/app/organizations/42',
    )
    expect(resolveDashboardAppRoute('', 'organization_dashboard', { organizationId: 9 })).toBe(
      '/app/organizations/9',
    )
    expect(
      normalizeDashboardLinks({ organization_dashboard: '/api/organizations' }, { organizationId: 9 }),
    ).toEqual({
      organization_dashboard: '/app/organizations/9',
    })
  })
})
