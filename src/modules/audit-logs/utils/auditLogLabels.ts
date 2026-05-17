import { AUDIT_EVENT_KEYS } from '@/modules/audit-logs/utils/auditLogCatalog'

const ACRONYMS = new Set(['smtp', 'prm', 'api', 'http', 'id', 'uuid'])

/** Human-readable labels for catalog event keys. */
const EVENT_LABELS: Record<string, string> = {
  'auth.login_success': 'Login successful',
  'auth.login_failure': 'Login failed',
  'auth.password_reset_requested': 'Password reset requested',
  'auth.password_reset_completed': 'Password reset completed',
  'auth.email_verified': 'Email verified',
  'users.invited': 'User invited',
  'users.role_changed': 'Role changed',
  'users.access_revoked': 'Access revoked',
  'contacts.created': 'Contact created',
  'contacts.updated': 'Contact updated',
  'contacts.assigned': 'Contact assigned',
  'contacts.reassigned': 'Contact reassigned',
  'contacts.deleted': 'Contact deleted',
  'contacts.converted': 'Contact converted',
  'companies.created': 'Company created',
  'companies.updated': 'Company updated',
  'companies.deleted': 'Company deleted',
  'deals.created': 'Deal created',
  'deals.owner_changed': 'Deal owner changed',
  'deals.stage_changed': 'Deal stage changed',
  'deals.won': 'Deal won',
  'deals.lost': 'Deal lost',
  'quotes.created': 'Quote created',
  'quotes.updated': 'Quote updated',
  'quotes.sent': 'Quote sent',
  'quotes.accepted': 'Quote accepted',
  'quotes.rejected': 'Quote rejected',
  'payments.initiated': 'Payment initiated',
  'payments.webhook_success': 'Payment webhook success',
  'payments.webhook_failed': 'Payment webhook failed',
  'licenses.allocated': 'License allocated',
  'licenses.transferred': 'License transferred',
  'licenses.activated': 'License activated',
  'partners.created': 'Partner created',
  'partners.approved': 'Partner approved',
  'partners.rejected': 'Partner rejected',
  'partners.suspended': 'Partner suspended',
  'resellers.created': 'Reseller created',
  'resellers.approved': 'Reseller approved',
  'resellers.rejected': 'Reseller rejected',
  'resellers.suspended': 'Reseller suspended',
  'smtp.updated': 'SMTP settings updated',
  'smtp.tested': 'SMTP test sent',
  'tasks.create': 'Task created',
  'tasks.update': 'Task updated',
  'tasks.delete': 'Task deleted',
}

const MODULE_LABELS: Record<string, string> = {
  auth: 'Auth',
  users: 'Users',
  contacts: 'Contacts',
  companies: 'Companies',
  deals: 'Deals',
  quotes: 'Quotes',
  payments: 'Payments',
  licenses: 'Licenses',
  partners: 'Partners',
  resellers: 'Resellers',
  smtp: 'SMTP',
  tasks: 'Tasks',
  task: 'Tasks',
  demo_links: 'Demo Links',
  demo_link: 'Demo Links',
  organization_email_settings: 'Organization Email Settings',
  prm: 'PRM',
  'prm.payout': 'PRM Payout',
  payout: 'Payouts',
  notifications: 'Notifications',
}

const SOURCE_LABELS: Record<string, string> = {
  application: 'Application',
  http: 'HTTP',
  deal_histories: 'Deal histories',
  deal_history: 'Deal history',
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  contact: 'Contact',
  company: 'Company',
  deal: 'Deal',
  quote: 'Quote',
  task: 'Task',
  user: 'User',
  organization: 'Organization',
  payment: 'Payment',
  invoice: 'Invoice',
}

/** Register catalog keys with generated labels if missing. */
for (const key of AUDIT_EVENT_KEYS) {
  if (!EVENT_LABELS[key]) {
    EVENT_LABELS[key] = humanizeAuditToken(key)
  }
}

export function humanizeAuditToken(raw: string): string {
  const normalized = raw.trim().toLowerCase()
  if (!normalized) return '—'

  const direct = EVENT_LABELS[normalized] || MODULE_LABELS[normalized]
  if (direct) return direct

  const parts = normalized.split(/[._]/).filter(Boolean)
  return parts
    .map((part) => {
      if (ACRONYMS.has(part)) return part.toUpperCase()
      if (part === 'email') return 'Email'
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' ')
}

export function resolveEventCode(eventKey?: string | null, action?: string | null): string {
  const key = String(eventKey ?? '').trim()
  if (key) return key
  return String(action ?? '').trim()
}

export function formatEventLabel(eventKey?: string | null, action?: string | null): string {
  const code = resolveEventCode(eventKey, action)
  if (!code) return '—'
  if (EVENT_LABELS[code]) return EVENT_LABELS[code]
  return humanizeAuditToken(code)
}

export function formatModuleLabel(module?: string | null): string {
  const raw = String(module ?? '').trim()
  if (!raw) return '—'
  const key = raw.toLowerCase()
  if (MODULE_LABELS[key]) return MODULE_LABELS[key]
  return humanizeAuditToken(key)
}

export function formatSourceLabel(source?: string | null): string {
  const raw = String(source ?? '').trim()
  if (!raw) return '—'
  const key = raw.toLowerCase()
  if (SOURCE_LABELS[key]) return SOURCE_LABELS[key]
  return humanizeAuditToken(key)
}

export function formatEntityTypeLabel(entityType?: string | null): string {
  const raw = String(entityType ?? '').trim().toLowerCase()
  if (!raw) return '—'
  if (ENTITY_TYPE_LABELS[raw]) return ENTITY_TYPE_LABELS[raw]
  return humanizeAuditToken(raw)
}

export function eventOptionLabel(eventKey: string): string {
  return formatEventLabel(eventKey, null)
}
