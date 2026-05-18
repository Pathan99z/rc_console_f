import { describe, expect, it } from 'vitest'
import {
  resolveLoginDashboardProfile,
  unwrapLoginDashboardBody,
} from '@/modules/dashboard/utils/loginDashboardResponse'

describe('loginDashboardResponse', () => {
  it('unwraps envelope with dashboard_profile and kpis array', () => {
    const body = {
      success: true,
      message: 'OK',
      data: {
        dashboard_profile: 'global_admin',
        generated_at: '2026-05-15T10:00:00Z',
        kpis: [
          { key: 'total_tenants', label: 'Total Tenants', value: 12, format: 'number' },
          { key: 'revenue_summary', label: 'Revenue', value: 2400000, format: 'currency' },
        ],
        widgets: {
          payments: { success: 10, failed: 2, pending: 1 },
          recent_audit_events: [{ id: 1, title: 'User login', occurred_at: '2026-05-15' }],
        },
        links: { tenants: '/app/tenants', audit_logs: '/app/settings/audit-logs' },
        charts: {
          monthly_revenue: [
            { label: 'Jan', revenue: 1000 },
            { label: 'Feb', revenue: 2000 },
          ],
        },
      },
    }

    const parsed = unwrapLoginDashboardBody(body)
    expect(parsed?.dashboard_profile).toBe('global_admin')
    expect(parsed?.kpis).toHaveLength(2)
    expect(parsed?.kpis[0].label).toBe('Total Tenants')
    expect(parsed?.widgets.payments?.success).toBe(10)
    expect(parsed?.links.tenants).toBe('/app/tenants')
  })

  it('normalizes API paths in links to app routes', () => {
    const parsed = unwrapLoginDashboardBody({
      data: {
        dashboard_profile: 'company_admin',
        links: {
          contacts: '/api/contacts',
          deals: '/api/deals',
          audit_logs: '/api/settings/audit-logs',
        },
      },
    })
    expect(parsed?.links.contacts).toBe('/app/contacts')
    expect(parsed?.links.deals).toBe('/app/deals')
    expect(parsed?.links.audit_logs).toBe('/app/settings/audit-logs')
  })

  it('unwraps kpis object map for company admin', () => {
    const parsed = unwrapLoginDashboardBody({
      data: {
        dashboard_profile: 'company_admin',
        kpis: {
          contacts: { label: 'Contacts', value: 42 },
          open_deals: { label: 'Open Deals', value: 7 },
        },
        widgets: {
          overdue_tasks: { count: 3, items: [{ id: 1, title: 'Follow up' }] },
        },
      },
    })

    expect(parsed?.dashboard_profile).toBe('company_admin')
    expect(parsed?.kpis.map((k) => k.key)).toEqual(expect.arrayContaining(['contacts', 'open_deals']))
    expect(parsed?.widgets.overdue_tasks?.count).toBe(3)
  })

  it('resolves profile from user role when API omits profile', () => {
    expect(resolveLoginDashboardProfile('', 'reseller_admin', null)).toBe('reseller_admin')
    expect(resolveLoginDashboardProfile('', 'partner_admin', 'partner')).toBe('partner_admin')
    expect(resolveLoginDashboardProfile('', 'company_admin', null)).toBe('company_admin')
    expect(resolveLoginDashboardProfile('global', null, null)).toBe('global_admin')
  })

  it('returns null for invalid body', () => {
    expect(unwrapLoginDashboardBody(null)).toBeNull()
    expect(unwrapLoginDashboardBody('bad')).toBeNull()
  })
})
