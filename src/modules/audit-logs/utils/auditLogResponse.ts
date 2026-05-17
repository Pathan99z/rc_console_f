import type { Pagination } from '@/modules/users/services/users.api'
import type { AuditLogListItem } from '@/modules/audit-logs/types/auditLog.types'
import { normalizeAuditListItem } from '@/modules/audit-logs/utils/auditLogFormat'

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

const defaultPagination = (page: number, perPage: number): Pagination => ({
  current_page: page,
  per_page: perPage,
  total: 0,
  last_page: 1,
})

/** Unwrap list payload from standard RC API envelope or common variants. */
export function unwrapAuditLogListBody(
  body: unknown,
  page: number,
  perPage: number,
): { items: AuditLogListItem[]; pagination: Pagination } {
  const root = asRecord(body)
  if (!root) {
    return { items: [], pagination: defaultPagination(page, perPage) }
  }

  const envelope = asRecord(root.data) ?? root
  let rawItems: unknown[] = []

  if (Array.isArray(envelope.items)) {
    rawItems = envelope.items
  } else if (Array.isArray(envelope.audit_logs)) {
    rawItems = envelope.audit_logs
  } else if (Array.isArray(envelope.data)) {
    rawItems = envelope.data
  } else if (Array.isArray(root.data)) {
    rawItems = root.data
  } else if (Array.isArray(root.items)) {
    rawItems = root.items
  }

  const pgRaw = asRecord(envelope.pagination) ?? asRecord(root.pagination) ?? asRecord(envelope.meta)
  const pagination: Pagination = pgRaw
    ? {
        current_page: Number(pgRaw.current_page) || page,
        per_page: Number(pgRaw.per_page) || perPage,
        total: Number(pgRaw.total) || 0,
        last_page: Number(pgRaw.last_page) || 1,
      }
    : {
        ...defaultPagination(page, perPage),
        total: rawItems.length,
        last_page: 1,
      }

  const items = rawItems
    .map((row) => normalizeAuditListItem(row))
    .filter((row): row is AuditLogListItem => Boolean(row))

  return { items, pagination }
}

export function unwrapAuditLogDetailBody(body: unknown): unknown {
  const root = asRecord(body)
  if (!root) return null
  const data = root.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const inner = asRecord(data)
    if (inner?.entry) return inner.entry
    if (inner?.item) return inner.item
    if (inner?.audit_log) return inner.audit_log
    return data
  }
  if (root.entry) return root.entry
  return root
}
