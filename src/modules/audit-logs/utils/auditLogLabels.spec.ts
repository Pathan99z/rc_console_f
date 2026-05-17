import { describe, expect, it } from 'vitest'
import {
  formatEventLabel,
  formatModuleLabel,
  humanizeAuditToken,
} from '@/modules/audit-logs/utils/auditLogLabels'

describe('auditLogLabels', () => {
  it('formats catalog event keys', () => {
    expect(formatEventLabel('auth.login_success', null)).toBe('Login successful')
    expect(formatEventLabel('smtp.tested', null)).toBe('SMTP test sent')
  })

  it('uses action when event_key is null', () => {
    expect(formatEventLabel(null, 'tasks.create')).toBe('Task created')
  })

  it('humanizes unknown module tokens', () => {
    expect(formatModuleLabel('organization_email_settings')).toBe('Organization Email Settings')
    expect(formatModuleLabel('prm.payout')).toBe('PRM Payout')
    expect(humanizeAuditToken('demo_links.update')).toBe('Demo Links Update')
  })
})
