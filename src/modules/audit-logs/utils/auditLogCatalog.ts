import type { AuditLogModule } from '@/modules/audit-logs/types/auditLog.types'

export const AUDIT_MODULES: { value: AuditLogModule; label: string }[] = [
  { value: 'auth', label: 'Auth' },
  { value: 'users', label: 'Users' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'companies', label: 'Companies' },
  { value: 'deals', label: 'Deals' },
  { value: 'quotes', label: 'Quotes' },
  { value: 'payments', label: 'Payments' },
  { value: 'licenses', label: 'Licenses' },
  { value: 'partners', label: 'Partners' },
  { value: 'resellers', label: 'Resellers' },
  { value: 'smtp', label: 'SMTP' },
]

/** Exact backend-supported event_key catalog. */
export const AUDIT_EVENT_KEYS: readonly string[] = [
  'auth.login_success',
  'auth.login_failure',
  'auth.password_reset_requested',
  'auth.password_reset_completed',
  'auth.email_verified',
  'users.invited',
  'users.role_changed',
  'users.access_revoked',
  'contacts.created',
  'contacts.updated',
  'contacts.assigned',
  'contacts.reassigned',
  'contacts.deleted',
  'contacts.converted',
  'companies.created',
  'companies.updated',
  'companies.deleted',
  'deals.created',
  'deals.owner_changed',
  'deals.stage_changed',
  'deals.won',
  'deals.lost',
  'quotes.created',
  'quotes.updated',
  'quotes.sent',
  'quotes.accepted',
  'quotes.rejected',
  'payments.initiated',
  'payments.webhook_success',
  'payments.webhook_failed',
  'licenses.allocated',
  'licenses.transferred',
  'licenses.activated',
  'partners.created',
  'partners.approved',
  'partners.rejected',
  'partners.suspended',
  'resellers.created',
  'resellers.approved',
  'resellers.rejected',
  'resellers.suspended',
  'smtp.updated',
  'smtp.tested',
] as const

export const AUDIT_EVENT_KEY_SET = new Set<string>(AUDIT_EVENT_KEYS)

export const AUDIT_SOURCES: { value: string; label: string }[] = [
  { value: 'application', label: 'Application' },
  { value: 'http', label: 'HTTP' },
  { value: 'deal_histories', label: 'Deal Histories' },
  { value: 'deal_history', label: 'Deal History' },
]

export const AUDIT_SOURCE_SET = new Set(AUDIT_SOURCES.map((s) => s.value))

export const AUDIT_ENTITY_TYPES: { value: string; label: string; hasLookup: boolean }[] = [
  { value: 'contact', label: 'Contact', hasLookup: true },
  { value: 'company', label: 'Company', hasLookup: true },
  { value: 'deal', label: 'Deal', hasLookup: true },
  { value: 'quote', label: 'Quote', hasLookup: true },
  { value: 'user', label: 'User', hasLookup: true },
  { value: 'organization', label: 'Organization', hasLookup: true },
]

export function eventsForModule(module: AuditLogModule | ''): string[] {
  if (!module) return [...AUDIT_EVENT_KEYS]
  const prefix = `${module}.`
  return AUDIT_EVENT_KEYS.filter((key) => key.startsWith(prefix))
}

export function isValidAuditEventKey(value: string): boolean {
  return AUDIT_EVENT_KEY_SET.has(value)
}

export function isValidAuditSource(value: string): boolean {
  return AUDIT_SOURCE_SET.has(value)
}
