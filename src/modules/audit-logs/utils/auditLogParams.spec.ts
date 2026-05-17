import { describe, expect, it } from 'vitest'
import { buildAuditLogListParams, defaultAuditFilters, sanitizeAuditLogParams } from '@/modules/audit-logs/utils/auditLogParams'

describe('sanitizeAuditLogParams', () => {
  it('omits empty and invalid filter values', () => {
    expect(
      sanitizeAuditLogParams({
        page: 1,
        per_page: 20,
        event_key: 'auth.logout',
        source: 'web',
        actor_user_id: '',
        organization_id: '  ',
        entity_id: '',
        include_archived: false,
      }),
    ).toEqual({
      page: 1,
      per_page: 20,
    })
  })

  it('keeps only backend-valid event_key and source', () => {
    expect(
      sanitizeAuditLogParams({
        page: 1,
        per_page: 20,
        event_key: 'deals.won',
        source: 'application',
        include_archived: true,
        include_deal_histories: true,
      }),
    ).toEqual({
      page: 1,
      per_page: 20,
      event_key: 'deals.won',
      source: 'application',
      include_archived: 1,
      include_deal_histories: 1,
    })
  })
})

describe('buildAuditLogListParams', () => {
  it('maps filters to API query params', () => {
    const filters = {
      ...defaultAuditFilters(),
      date_from: '2026-05-01',
      date_to: '2026-05-15',
      module: 'deals' as const,
      event_key: 'deals.won',
      actor_user_id: '12',
      organization_id: '3',
      entity_type: 'deal',
      entity_id: '99',
      source: 'http',
      include_archived: true,
      include_deal_histories: true,
    }

    expect(buildAuditLogListParams(filters, 2, 25)).toEqual({
      page: 2,
      per_page: 25,
      date_from: '2026-05-01',
      date_to: '2026-05-15',
      module: 'deals',
      event_key: 'deals.won',
      actor_user_id: 12,
      organization_id: 3,
      entity_type: 'deal',
      entity_id: '99',
      source: 'http',
      include_archived: 1,
      include_deal_histories: 1,
    })
  })
})
