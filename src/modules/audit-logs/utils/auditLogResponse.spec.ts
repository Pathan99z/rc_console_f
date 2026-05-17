import { describe, expect, it } from 'vitest'
import { unwrapAuditLogDetailBody, unwrapAuditLogListBody } from '@/modules/audit-logs/utils/auditLogResponse'

describe('unwrapAuditLogListBody', () => {
  it('parses standard success envelope', () => {
    const result = unwrapAuditLogListBody(
      {
        success: true,
        message: 'ok',
        data: {
          items: [
            {
              public_id: 'audit-42',
              occurred_at: '2026-05-17T10:00:00Z',
              event_key: 'contacts.created',
              module: 'contacts',
            },
          ],
          pagination: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
        },
      },
      1,
      20,
    )

    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.public_id).toBe('audit-42')
    expect(result.pagination.total).toBe(1)
  })

  it('falls back to action when event_key is null', () => {
    const result = unwrapAuditLogListBody(
      {
        success: true,
        data: {
          items: [
            {
              public_id: 'audit-39',
              occurred_at: '2026-05-17T12:00:21+00:00',
              event_key: null,
              action: 'tasks.create',
              module: 'tasks',
              entity_type: 'task',
              entity_id: 5,
              after: { title: 'Test task' },
            },
          ],
          pagination: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
        },
      },
      1,
      20,
    )

    expect(result.items[0]?.event_key).toBe('tasks.create')
    expect(result.items[0]?.entity?.label).toBe('Test task')
  })
})

describe('unwrapAuditLogDetailBody', () => {
  it('unwraps data.entry from detail response', () => {
    const entry = unwrapAuditLogDetailBody({
      success: true,
      data: {
        entry: {
          public_id: 'audit-39',
          occurred_at: '2026-05-17T12:00:21+00:00',
          module: 'tasks',
          action: 'tasks.create',
          entity_type: 'task',
          entity_id: 5,
        },
      },
    })

    expect(entry).toMatchObject({ public_id: 'audit-39', action: 'tasks.create' })
  })
})
