import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuditLogStore } from '@/modules/audit-logs/store/auditLog.store'

vi.mock('@/modules/audit-logs/services/auditLog.api', () => ({
  auditLogApi: {
    list: vi.fn(),
    detail: vi.fn(),
    export: vi.fn(),
  },
}))

import { auditLogApi } from '@/modules/audit-logs/services/auditLog.api'

describe('auditLog store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(auditLogApi.list).mockReset()
    vi.mocked(auditLogApi.detail).mockReset()
    vi.mocked(auditLogApi.export).mockReset()
  })

  it('loads list items on success', async () => {
    vi.mocked(auditLogApi.list).mockResolvedValue({
      data: {
        success: true,
        message: 'ok',
        data: {
          items: [
            {
              public_id: 'audit-1',
              occurred_at: '2026-05-17T10:00:00Z',
              event_key: 'contacts.created',
              module: 'contacts',
            },
          ],
          pagination: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
        },
      },
    } as never)

    const store = useAuditLogStore()
    await store.fetchAuditLogs(1, 20)

    expect(store.items).toHaveLength(1)
    expect(store.items[0]?.public_id).toBe('audit-1')
    expect(store.listLoading).toBe(false)
  })

  it('sets accessDenied on forbidden list', async () => {
    vi.mocked(auditLogApi.list).mockRejectedValue({
      response: { status: 403, data: { message: 'Forbidden.' } },
      isAxiosError: true,
      config: { url: '/audit-logs' },
    })

    const store = useAuditLogStore()
    await expect(store.fetchAuditLogs()).rejects.toBeTruthy()
    expect(store.accessDenied).toBe(true)
    expect(store.items).toHaveLength(0)
  })

  it('loads detail on view', async () => {
    vi.mocked(auditLogApi.detail).mockResolvedValue({
      data: {
        success: true,
        message: 'ok',
        data: {
          entry: {
            public_id: 'audit-42',
            occurred_at: '2026-05-17T10:00:00Z',
            event_key: 'deals.won',
            module: 'deals',
            before: { stage: 'open' },
            after: { stage: 'won' },
          },
        },
      },
    } as never)

    const store = useAuditLogStore()
    const detail = await store.fetchAuditLogDetail('audit-42')

    expect(detail?.public_id).toBe('audit-42')
    expect(store.currentDetail?.event_key).toBe('deals.won')
  })

  it('exports with sanitized filters', async () => {
    vi.mocked(auditLogApi.export).mockResolvedValue({
      data: new Blob(['id,event'], { type: 'text/csv' }),
      headers: { 'content-disposition': 'attachment; filename="audit.csv"' },
    } as never)

    const store = useAuditLogStore()
    store.filters.module = 'payments'
    store.filters.event_key = 'invalid.event'
    store.filters.source = 'web'
    await store.exportAuditLogs(1, 20)

    expect(auditLogApi.export).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        per_page: 20,
        module: 'payments',
      }),
    )
    expect(auditLogApi.export).not.toHaveBeenCalledWith(
      expect.objectContaining({ event_key: 'invalid.event', source: 'web' }),
    )
    expect(store.exporting).toBe(false)
  })
})
