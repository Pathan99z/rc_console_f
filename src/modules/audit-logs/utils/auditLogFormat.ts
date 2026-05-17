import type { AuditLogDetail, AuditLogListItem } from '@/modules/audit-logs/types/auditLog.types'

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function pickString(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const v = row[key]
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v)
  }
  return ''
}

function pickNestedName(value: unknown): string {
  const row = asRecord(value)
  if (!row) return ''
  return pickString(row, ['name', 'display_name', 'legal_name', 'email', 'label'])
}

export function formatAuditTimestamp(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function actorLabel(item: Pick<AuditLogListItem, 'actor'>): string {
  const actor = item.actor
  if (!actor) return '—'
  if (actor.name && actor.email) return `${actor.name} (${actor.email})`
  return actor.name || actor.email || (actor.id != null ? `User #${actor.id}` : '—')
}

export function organizationLabel(item: Pick<AuditLogListItem, 'organization'>): string {
  const org = item.organization
  if (!org) return '—'
  return org.display_name || org.legal_name || (org.id != null ? `Org #${org.id}` : '—')
}

export function entityLabel(item: Pick<AuditLogListItem, 'entity'>): string {
  const entity = item.entity
  if (!entity) return '—'
  if (entity.label) {
    const typeLabel = entity.type ? String(entity.type) : ''
    return typeLabel ? `${entity.label} (${typeLabel})` : entity.label
  }
  if (entity.summary) return entity.summary
  const type = entity.type || 'record'
  const id = entity.id
  return id != null ? `${type} #${id}` : type
}

export function normalizeEntityType(raw?: string | null): string {
  if (!raw) return ''
  let value = String(raw).trim().toLowerCase()
  if (!value) return ''
  if (value.includes('\\')) value = value.split('\\').pop() || value
  value = value.replace(/model$/i, '')
  const aliases: Record<string, string> = {
    contacts: 'contact',
    companies: 'company',
    deals: 'deal',
    quotes: 'quote',
    tasks: 'task',
    users: 'user',
  }
  return aliases[value] || value
}

export function eventBadgeClass(eventKey?: string | null, action?: string | null): string {
  const key = (eventKey || action || '').toLowerCase()
  if (!key) return 'bg-slate-50 text-slate-500 ring-slate-200'
  if (key.includes('failed') || key.includes('error') || key.includes('denied') || key.includes('rejected')) {
    return 'bg-rose-50 text-rose-700 ring-rose-200'
  }
  if (key.includes('won') || key.includes('success') || key.includes('accepted') || key.includes('approved')) {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  }
  if (key.includes('webhook') || key.includes('sent') || key.includes('updated') || key.includes('changed')) {
    return 'bg-amber-50 text-amber-800 ring-amber-200'
  }
  if (key.includes('created') || key.includes('assigned') || key.includes('login')) {
    return 'bg-indigo-50 text-indigo-700 ring-indigo-200'
  }
  if (key.includes('deleted') || key.includes('revoked') || key.includes('cancelled')) {
    return 'bg-slate-100 text-slate-700 ring-slate-200'
  }
  return 'bg-slate-50 text-slate-700 ring-slate-200'
}

export function resolveEntityRecordLink(
  entityType?: string | null,
  entityId?: number | string | null,
): { path: string; query?: Record<string, string> } | null {
  const type = normalizeEntityType(entityType)
  const id = entityId != null && String(entityId).trim() !== '' ? String(entityId) : ''
  if (!type || !id) return null

  switch (type) {
    case 'contact':
      return { path: `/app/contacts/${id}` }
    case 'deal':
      return { path: `/app/deals/${id}` }
    case 'quote':
      return { path: `/app/quotes/${id}` }
    case 'company':
      return { path: `/app/companies/${id}` }
    case 'task':
      return { path: '/app/tasks', query: { task: id } }
    default:
      return null
  }
}

export function normalizeAuditListItem(raw: unknown): AuditLogListItem | null {
  const row = asRecord(raw)
  if (!row) return null

  let publicId = pickString(row, ['public_id', 'publicId', 'uuid'])
  if (!publicId) {
    const numericId = row.id
    if (numericId !== undefined && numericId !== null && String(numericId).trim() !== '') {
      publicId = String(numericId)
    }
  }
  if (!publicId) return null

  const actorRaw = row.actor ?? row.actor_user
  const actorRec = asRecord(actorRaw)
  const orgRaw = row.organization ?? row.org
  const orgRec = asRecord(orgRaw)
  const entityRaw = row.entity
  const entityRec = asRecord(entityRaw)
  const afterRec = asRecord(row.after)
  const scopeOrgRec = afterRec ? asRecord(afterRec.scope_organization) : null

  let eventKey = pickString(row, ['event_key', 'event'])
  const action = pickString(row, ['action']) || undefined
  if (!eventKey && action) eventKey = action

  let organization = orgRec
    ? {
        id: Number(orgRec.id) || undefined,
        display_name: pickString(orgRec, ['display_name', 'name']),
        legal_name: pickString(orgRec, ['legal_name']),
      }
    : null

  if (!organization && scopeOrgRec) {
    organization = {
      id: Number(scopeOrgRec.id) || undefined,
      display_name: pickString(scopeOrgRec, ['display_name', 'name']),
      legal_name: pickString(scopeOrgRec, ['legal_name']),
    }
  }

  const orgId = row.organization_id
  if (!organization && orgId != null && String(orgId).trim() !== '') {
    organization = { id: Number(orgId) || undefined, display_name: '', legal_name: '' }
  }

  let entity =
    entityRec
      ? {
          type: pickString(entityRec, ['type', 'entity_type']) || undefined,
          id: entityRec.id as number | string | undefined,
          label: pickString(entityRec, ['label', 'summary', 'title', 'name']),
          summary: pickString(entityRec, ['summary']),
        }
      : row.entity_type || row.entity_id
        ? {
            type: pickString(row, ['entity_type']),
            id: row.entity_id as number | string | undefined,
            label: '',
            summary: '',
          }
        : null

  if (entity && afterRec && !entity.label) {
    const inferred = pickString(afterRec, [
      'title',
      'name',
      'display_name',
      'legal_name',
      'quote_number',
      'email',
    ])
    if (inferred) entity = { ...entity, label: inferred }
  }

  return {
    public_id: publicId,
    stream: pickString(row, ['stream']) || undefined,
    occurred_at: pickString(row, ['occurred_at', 'timestamp', 'created_at']),
    event_key: eventKey,
    module: pickString(row, ['module']),
    action,
    actor: actorRec
      ? {
          id: Number(actorRec.id) || undefined,
          name: pickString(actorRec, ['name']),
          email: pickString(actorRec, ['email']),
        }
      : null,
    organization,
    entity,
    source: pickString(row, ['source']) || undefined,
    correlation_id: pickString(row, ['correlation_id']) || null,
    is_archived: Boolean(row.is_archived),
  }
}

export function normalizeAuditDetail(raw: unknown): AuditLogDetail | null {
  const base = normalizeAuditListItem(raw)
  if (!base) return null
  const row = asRecord(raw)
  if (!row) return base

  const tenantRec = asRecord(row.tenant)

  return {
    ...base,
    tenant: tenantRec
      ? { id: Number(tenantRec.id) || undefined, name: pickNestedName(tenantRec) || pickString(tenantRec, ['name']) }
      : null,
    ip_address: pickString(row, ['ip_address', 'ip']) || null,
    user_agent: pickString(row, ['user_agent']) || null,
    immutable_at: pickString(row, ['immutable_at']) || null,
    archived_at: pickString(row, ['archived_at']) || null,
    payload_before: row.payload_before ?? row.before ?? row.changes_before,
    payload_after: row.payload_after ?? row.after ?? row.changes_after,
    metadata: row.metadata ?? row.meta,
  }
}

export function stringifyJson(value: unknown): string {
  if (value === undefined || value === null) return ''
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export async function copyJsonToClipboard(value: unknown): Promise<boolean> {
  const text = stringifyJson(value)
  if (!text) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
