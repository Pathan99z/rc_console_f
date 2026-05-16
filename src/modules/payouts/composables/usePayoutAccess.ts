import { computed } from 'vue'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { hasAnyPermission, hasAnyRole } from '@/modules/auth/composables/useCapabilities'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const financeRoles = ['global_admin', 'company_admin', 'finance_admin']
const financeManagePermissions = ['prm.payouts.manage', 'prm.payouts.view']
const financeViewPermissions = ['prm.payouts.view']

export function usePayoutAccess() {
  const authStore = useAuthStore()
  const { isGlobalAdmin, isCompanyAdmin, isPartnerChannelUser, isResellerUser } = useAuth()

  const user = computed(() => authStore.user)

  const isFinanceAdmin = computed(() =>
    hasAnyRole(user.value, financeRoles) || hasAnyPermission(user.value, financeManagePermissions),
  )

  const canViewFinancePayouts = computed(() => isFinanceAdmin.value)

  const canManagePayouts = computed(
    () =>
      hasAnyRole(user.value, ['global_admin', 'company_admin', 'finance_admin']) ||
      hasAnyPermission(user.value, ['prm.payouts.manage']),
  )

  const canViewPartnerPayouts = computed(
    () =>
      hasAnyRole(user.value, ['partner_admin']) ||
      hasAnyPermission(user.value, financeViewPermissions) ||
      isPartnerChannelUser.value,
  )

  const canViewResellerPayouts = computed(
    () => hasAnyRole(user.value, ['reseller_admin']) || isResellerUser.value,
  )

  return {
    isFinanceAdmin,
    canViewFinancePayouts,
    canManagePayouts,
    canViewPartnerPayouts,
    canViewResellerPayouts,
    isGlobalAdmin,
    isCompanyAdmin,
  }
}
