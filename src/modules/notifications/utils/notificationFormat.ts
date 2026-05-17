import type { NotificationCategoryFilter, NotificationItem } from '@/modules/notifications/types/notification.types'

export type NotificationIconKind =
  | 'checklist'
  | 'document'
  | 'briefcase'
  | 'user'
  | 'wallet'
  | 'shield'
  | 'building'
  | 'users'
  | 'settings'
  | 'bell'

export function isNotificationRead(item: NotificationItem): boolean {
  if (item.is_read === true) return true
  if (item.is_read === false) return false
  return Boolean(item.read_at)
}

export function formatRelativeTime(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'Just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function resolveNotificationType(item: { type?: string; notification_type?: string }): string {
  return String(item.notification_type ?? item.type ?? '').trim()
}

export function notificationIconKind(type?: string | null, category?: string | null): NotificationIconKind {
  const t = String(type ?? '').toLowerCase()
  const c = String(category ?? '').toLowerCase()

  if (t.startsWith('task') || c === 'tasks') return 'checklist'
  if (t.startsWith('quote') || c === 'quotes') return 'document'
  if (t.startsWith('payment') || c === 'payments') return 'wallet'
  if (t.startsWith('deal') || c === 'deals') return 'briefcase'
  if (t.startsWith('contact') || c === 'contacts') return 'user'
  if (t.startsWith('license') || c === 'licenses') return 'shield'
  if (t.startsWith('partner') || t.startsWith('reseller') || c === 'organizations') return 'building'
  if (t.startsWith('user') || c === 'users') return 'settings'
  return 'bell'
}

/** Map API notification rows to a stable frontend shape. */
export function normalizeNotificationItem(raw: unknown): NotificationItem | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = Number(o.id)
  if (!Number.isFinite(id)) return null

  const notificationType = String(o.notification_type ?? o.type ?? '').trim()
  const title = String(o.title ?? '').trim()
  const message = String(o.message ?? '').trim()
  const createdAt = String(o.created_at ?? o.updated_at ?? '')

  return {
    id,
    type: notificationType,
    notification_type: notificationType || undefined,
    title: title || 'Notification',
    message: message || '',
    read_at: (o.read_at as string | null) ?? null,
    is_read: o.is_read as boolean | undefined,
    priority: (o.priority as string | null) ?? null,
    action_url: (o.action_url as string | null) ?? null,
    category: (o.category as string | null) ?? null,
    created_at: createdAt || new Date().toISOString(),
    updated_at: o.updated_at as string | undefined,
  }
}

export function priorityClasses(priority?: string | null): string {
  const p = String(priority ?? 'normal').toLowerCase()
  if (p === 'urgent' || p === 'high') return 'border-l-4 border-l-rose-500 bg-rose-50/40'
  if (p === 'low') return 'border-l-4 border-l-slate-200'
  return 'border-l-4 border-l-indigo-400/70'
}

export function formatUnreadBadge(count: number): string {
  if (count <= 0) return ''
  if (count > 99) return '99+'
  return String(count)
}

export function categoryToQueryParams(category: NotificationCategoryFilter): Record<string, string | boolean> {
  switch (category) {
    case 'unread':
      return { unread: true }
    case 'tasks':
      return { category: 'tasks' }
    case 'quotes':
      return { category: 'quotes' }
    case 'deals':
      return { category: 'deals' }
    case 'payments':
      return { category: 'payments' }
    case 'organizations':
      return { category: 'organizations' }
    case 'users':
      return { category: 'users' }
    default:
      return {}
  }
}

function normalizeNotificationList(raw: unknown[]): NotificationItem[] {
  return raw.map(normalizeNotificationItem).filter((n): n is NotificationItem => n !== null)
}

export function unwrapNotificationList(payload: unknown): { items: NotificationItem[]; pagination?: unknown } {
  if (!payload || typeof payload !== 'object') return { items: [] }
  const data = payload as Record<string, unknown>

  if (Array.isArray(data.items)) {
    return { items: normalizeNotificationList(data.items), pagination: data.pagination }
  }
  if (Array.isArray(data.notifications)) {
    return { items: normalizeNotificationList(data.notifications), pagination: data.pagination }
  }
  if (Array.isArray(data)) {
    return { items: normalizeNotificationList(data) }
  }
  return { items: [] }
}

/** Strip JSON escapes and whitespace from API action URLs. */
export function normalizeActionUrl(raw?: string | null): string {
  if (!raw) return ''
  return String(raw).trim().replace(/\\/g, '')
}

/**
 * Map backend action_url to a registered Vue route.
 * Task detail lives in a drawer on the list page (no /app/tasks/:id route).
 */
export function resolveNotificationNavigation(actionUrl: string): {
  path: string
  query?: Record<string, string>
} | null {
  const normalized = normalizeActionUrl(actionUrl)
  if (!normalized) return null

  let path = normalized
  let query: Record<string, string> | undefined

  const qIndex = path.indexOf('?')
  if (qIndex >= 0) {
    const search = path.slice(qIndex + 1)
    path = path.slice(0, qIndex)
    query = Object.fromEntries(new URLSearchParams(search))
  }

  if (!path.startsWith('/')) path = `/${path}`

  const taskMatch = path.match(/^\/app\/tasks\/(\d+)$/i)
  if (taskMatch) {
    return { path: '/app/tasks', query: { task: taskMatch[1], ...query } }
  }

  return { path, query }
}

export function unwrapUnreadCount(payload: unknown): number {
  if (!payload || typeof payload !== 'object') return 0
  const data = payload as Record<string, unknown>
  const count = data.unread_count ?? data.count ?? data.unread
  const n = Number(count)
  return Number.isFinite(n) && n >= 0 ? n : 0
}
