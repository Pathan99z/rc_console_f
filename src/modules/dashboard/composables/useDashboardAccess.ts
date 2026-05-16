import { computed, unref, type MaybeRef } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { hasAnyRole, hasPermission } from '@/modules/auth/composables/useCapabilities'
import type { OrganizationType } from '@/modules/organizations/types/organization.types'

export function useDashboardAccess(orgType?: MaybeRef<OrganizationType | null>) {
  const authStore = useAuthStore()

  const canViewOrganizationDashboard = computed(() => {
    const type = unref(orgType)
    if (type !== 'partner' && type !== 'reseller') return false
    const user = authStore.user
    if (!user) return false
    if (hasPermission(user, 'organizations.dashboard.view')) return true
    return hasAnyRole(user, ['global_admin', 'company_admin', 'partner_admin'])
  })

  const canViewPartnerSelfDashboard = computed(() => {
    const user = authStore.user
    if (!user) return false
    return hasAnyRole(user, ['partner_admin', 'partner_sales_manager', 'partner_sales_consultant'])
  })

  const canViewResellerSelfDashboard = computed(() => {
    const user = authStore.user
    if (!user) return false
    return hasAnyRole(user, ['reseller_admin', 'reseller_sales_manager', 'reseller_sales_consultant'])
  })

  return {
    canViewOrganizationDashboard,
    canViewPartnerSelfDashboard,
    canViewResellerSelfDashboard,
  }
}
