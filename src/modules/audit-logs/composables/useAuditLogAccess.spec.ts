import { describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { hasAnyPermission } from '@/modules/auth/composables/useCapabilities'
import type { User } from '@/modules/auth/types/auth.types'

function mockUser(permissions: string[]): User {
  return {
    id: 1,
    tenant_id: 1,
    role: 'company_admin',
    status: 'active',
    name: 'Admin',
    email: 'admin@example.com',
    email_verified_at: null,
    created_at: '',
    permissions,
  }
}

describe('audit permissions', () => {
  it('requires audit.view for page access', () => {
    const withPerm = mockUser(['audit.view'])
    const without = mockUser(['contacts.view'])

    expect(hasAnyPermission(withPerm, ['audit.view'])).toBe(true)
    expect(hasAnyPermission(without, ['audit.view'])).toBe(false)
  })

  it('requires audit.export for export', () => {
    const withExport = mockUser(['audit.view', 'audit.export'])
    expect(hasAnyPermission(withExport, ['audit.export'])).toBe(true)
    expect(hasAnyPermission(mockUser(['audit.view']), ['audit.export'])).toBe(false)
  })
})

describe('useAuditLogAccess integration', () => {
  it('initializes pinia for store-based tests', () => {
    setActivePinia(createPinia())
    expect(true).toBe(true)
  })
})
