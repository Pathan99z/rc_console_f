import { describe, expect, it } from 'vitest'
import {
  normalizeAuditListItem,
  normalizeEntityType,
  resolveEntityRecordLink,
} from '@/modules/audit-logs/utils/auditLogFormat'

describe('normalizeEntityType', () => {
  it('normalizes model class names', () => {
    expect(normalizeEntityType('App\\Models\\Contact')).toBe('contact')
    expect(normalizeEntityType('contacts')).toBe('contact')
  })
})

describe('resolveEntityRecordLink', () => {
  it('returns known module routes', () => {
    expect(resolveEntityRecordLink('deal', 5)).toEqual({ path: '/app/deals/5' })
    expect(resolveEntityRecordLink('task', 3)).toEqual({ path: '/app/tasks', query: { task: '3' } })
  })

  it('returns null for unknown types', () => {
    expect(resolveEntityRecordLink('invoice', 1)).toBeNull()
  })
})

describe('normalizeAuditListItem', () => {
  it('normalizes list rows from API shape', () => {
    const item = normalizeAuditListItem({
      public_id: 'audit-42',
      occurred_at: '2026-05-17T10:00:00Z',
      event_key: 'tasks.assigned',
      module: 'tasks',
      actor: { id: 1, name: 'Admin', email: 'admin@example.com' },
      entity_type: 'task',
      entity_id: 3,
      source: 'web',
      correlation_id: 'corr-1',
    })

    expect(item).toMatchObject({
      public_id: 'audit-42',
      event_key: 'tasks.assigned',
      module: 'tasks',
      source: 'web',
      correlation_id: 'corr-1',
    })
    expect(item?.actor?.name).toBe('Admin')
  })

  it('returns null without public id', () => {
    expect(normalizeAuditListItem({ event_key: 'auth.login_success' })).toBeNull()
  })
})
