import { describe, expect, it } from 'vitest'
import {
  formatUserRole,
  resolveOrganizationName,
  resolveTenantName,
  userInitials,
} from '@/modules/auth/utils/userProfileFormat'
import type { User } from '@/modules/auth/types/auth.types'

const baseUser: User = {
  id: 1,
  tenant_id: 1,
  role: 'company_admin',
  name: 'Naceer Khan',
  email: 'test@example.com',
  email_verified_at: '2026-01-01T00:00:00Z',
  created_at: '',
}

describe('userProfileFormat', () => {
  it('builds avatar initials', () => {
    expect(userInitials('Naceer Khan')).toBe('NK')
  })

  it('formats role labels', () => {
    expect(formatUserRole('company_admin')).toBe('Company admin')
  })

  it('resolves tenant and organization names', () => {
    expect(resolveTenantName({ ...baseUser, tenant: { id: 1, name: 'Acme Corp' } })).toBe('Acme Corp')
    expect(
      resolveOrganizationName({
        ...baseUser,
        organization: { id: 3, type: 'reseller', display_name: 'Pathan Reseller' },
      }),
    ).toBe('Pathan Reseller')
  })
})
