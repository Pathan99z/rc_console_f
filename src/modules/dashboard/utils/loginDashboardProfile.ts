import type { User } from '@/modules/auth/types/auth.types'
import type { LoginDashboardProfile } from '@/modules/dashboard/types/loginDashboard.types'
import { resolveLoginDashboardProfile } from '@/modules/dashboard/utils/loginDashboardResponse'

export function profileFromUser(user: User | null): LoginDashboardProfile {
  if (!user) return 'company_admin'
  return resolveLoginDashboardProfile('', user.role, user.navigation_profile ?? '')
}

export function profileTitle(profile: LoginDashboardProfile): string {
  switch (profile) {
    case 'global_admin':
      return 'Platform overview'
    case 'company_admin':
      return 'Tenant overview'
    case 'partner_admin':
      return 'Partner overview'
    case 'reseller_admin':
      return 'Reseller overview'
    default:
      return 'Dashboard'
  }
}

export function profileSubtitle(profile: LoginDashboardProfile): string {
  switch (profile) {
    case 'global_admin':
      return 'Cross-tenant health, onboarding, and platform activity.'
    case 'company_admin':
      return 'CRM, revenue, and operational metrics for your organization.'
    case 'partner_admin':
      return 'Partner channel performance and team activity.'
    case 'reseller_admin':
      return 'Reseller performance, licenses, and pipeline activity.'
    default:
      return ''
  }
}
