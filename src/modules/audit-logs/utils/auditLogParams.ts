import type { AuditLogFiltersState, AuditLogListParams } from '@/modules/audit-logs/types/auditLog.types'
import { isValidAuditEventKey, isValidAuditSource } from '@/modules/audit-logs/utils/auditLogCatalog'

function toInt(value: string): number | undefined {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return undefined
  const n = Number(trimmed)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function nonEmptyString(value: string | undefined | null): string | undefined {
  const trimmed = String(value ?? '').trim()
  return trimmed || undefined
}

/** Strip empty/invalid values before sending to the API. */
export function sanitizeAuditLogParams(params: AuditLogListParams): Record<string, string | number> {
  const out: Record<string, string | number> = {}

  if (params.page != null && params.page > 0) out.page = params.page
  if (params.per_page != null && params.per_page > 0) out.per_page = params.per_page

  const dateFrom = nonEmptyString(params.date_from)
  const dateTo = nonEmptyString(params.date_to)
  const module = nonEmptyString(params.module)
  const entityType = nonEmptyString(params.entity_type)
  const entityId = nonEmptyString(String(params.entity_id ?? ''))

  if (dateFrom) out.date_from = dateFrom
  if (dateTo) out.date_to = dateTo
  if (module) out.module = module

  if (params.event_key && isValidAuditEventKey(params.event_key)) {
    out.event_key = params.event_key
  }

  if (params.source && isValidAuditSource(params.source)) {
    out.source = params.source
  }

  const actorId = toInt(String(params.actor_user_id ?? ''))
  if (actorId) out.actor_user_id = actorId

  const orgId = toInt(String(params.organization_id ?? ''))
  if (orgId) out.organization_id = orgId

  const tenantId = toInt(String(params.tenant_id ?? ''))
  if (tenantId) out.tenant_id = tenantId

  if (entityType) out.entity_type = entityType
  if (entityId) out.entity_id = entityId

  if (params.include_archived === 1 || params.include_archived === true) {
    out.include_archived = 1
  }
  if (params.include_deal_histories === 1 || params.include_deal_histories === true) {
    out.include_deal_histories = 1
  }

  return out
}

export function buildAuditLogListParams(
  filters: AuditLogFiltersState,
  page: number,
  perPage: number,
): Record<string, string | number> {
  return sanitizeAuditLogParams({
    page,
    per_page: perPage,
    date_from: filters.date_from,
    date_to: filters.date_to,
    module: filters.module || undefined,
    event_key: filters.event_key || undefined,
    source: filters.source || undefined,
    actor_user_id: filters.actor_user_id || undefined,
    organization_id: filters.organization_id || undefined,
    tenant_id: filters.tenant_id || undefined,
    entity_type: filters.entity_type || undefined,
    entity_id: filters.entity_id || undefined,
    include_archived: filters.include_archived ? 1 : undefined,
    include_deal_histories: filters.include_deal_histories ? 1 : undefined,
  })
}

export function defaultAuditFilters(): AuditLogFiltersState {
  return {
    date_from: '',
    date_to: '',
    module: '',
    event_key: '',
    actor_user_id: '',
    organization_id: '',
    entity_type: '',
    entity_id: '',
    source: '',
    tenant_id: '',
    include_archived: false,
    include_deal_histories: false,
  }
}
