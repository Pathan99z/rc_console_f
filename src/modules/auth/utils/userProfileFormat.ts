import type { User } from '@/modules/auth/types/auth.types'

const ROLE_LABELS: Record<string, string> = {
  global_admin: 'Global admin',
  company_admin: 'Company admin',
  user: 'User',
  partner_admin: 'Partner admin',
  partner_sales_manager: 'Partner sales manager',
  partner_sales_consultant: 'Partner sales consultant',
  reseller_admin: 'Reseller admin',
  reseller_sales_consultant: 'Reseller sales consultant',
}

export function userInitials(name?: string | null): string {
  const value = String(name || 'User').trim()
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatUserRole(role?: string | null): string {
  if (!role) return '—'
  return ROLE_LABELS[role] || role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatAccountStatus(status?: string | null): string {
  if (!status) return '—'
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatEmailVerification(user: Pick<User, 'email_verified_at'>): string {
  return user.email_verified_at ? 'Verified' : 'Not verified'
}

export function resolveTenantName(user: User | null): string {
  if (!user) return '—'
  if (user.tenant?.name) return user.tenant.name
  if (user.tenant_name) return user.tenant_name
  if (user.tenant_id) return `Tenant #${user.tenant_id}`
  return '—'
}

export function resolveOrganizationName(user: User | null): string {
  if (!user) return '—'
  if (user.organization_name) return user.organization_name
  const org = user.organization
  if (!org) return '—'
  return org.display_name || org.legal_name || org.name || (org.id ? `Organization #${org.id}` : '—')
}

export function formatLastLogin(user: User | null): string {
  const raw = user?.last_login_at || user?.last_login
  if (!raw) return '—'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
