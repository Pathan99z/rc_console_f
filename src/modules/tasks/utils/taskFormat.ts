import type { AssignableUser, TaskPriority, TaskStatus } from '@/modules/tasks/types/task.types'

export function taskStatusClass(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800',
    in_progress: 'bg-sky-50 text-sky-800',
    completed: 'bg-emerald-50 text-emerald-800',
    cancelled: 'bg-slate-100 text-slate-600',
  }
  return map[status] || 'bg-slate-50 text-slate-700'
}

export function taskPriorityClass(priority: string): string {
  const map: Record<string, string> = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-indigo-50 text-indigo-800',
    high: 'bg-orange-50 text-orange-800',
    critical: 'bg-rose-50 text-rose-800',
  }
  return map[priority] || 'bg-slate-50 text-slate-700'
}

export function formatTaskStatus(status: string): string {
  return status.replace(/_/g, ' ')
}

export function formatTaskPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

export function formatAssignableUserLabel(user: AssignableUser): string {
  const name = (user.name || '').trim() || `User #${user.id}`
  const org =
  (
    user.organization_display_name ||
    user.organization_name ||
    user.organization?.display_name ||
    user.organization?.legal_name ||
    ''
  ).trim()
  const role = (user.role_name || user.role || '').trim()
  if (org && role) return `${name} — ${org} (${role})`
  if (org) return `${name} — ${org}`
  if (role) return `${name} (${role})`
  if (user.email) return `${name} (${user.email})`
  return name
}

export function formatTaskDate(value?: string | null): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return value
  }
}

export const TASK_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'completed', 'cancelled']
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical']
export const TASK_RELATED_TYPES = [
  'contact',
  'company',
  'deal',
  'quote',
  'payment_record',
  'payout',
  'license_entitlement',
  'other',
] as const
