import { computed } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { hasAnyRole } from '@/modules/auth/composables/useCapabilities'

const partnerChannelRoles = [
  'partner_admin',
  'partner_sales_manager',
  'partner_sales_consultant',
] as const

const resellerChannelRoles = [
  'reseller_admin',
  'reseller_sales_manager',
  'reseller_sales_consultant',
] as const

const prmChannelRoles = [...partnerChannelRoles, ...resellerChannelRoles] as const

export function useAuth() {
  const auth = useAuthStore()

  const isGlobalAdmin = computed(() => hasAnyRole(auth.user, ['global_admin']))
  const isCompanyAdmin = computed(() => hasAnyRole(auth.user, ['company_admin']))
  const isPrivilegedUser = computed(() => isGlobalAdmin.value || isCompanyAdmin.value)
  const isPartnerAdmin = computed(() => hasAnyRole(auth.user, ['partner_admin']))
  const isPartnerChannelUser = computed(() => hasAnyRole(auth.user, [...prmChannelRoles]))
  const isResellerUser = computed(() => hasAnyRole(auth.user, [...resellerChannelRoles]))
  const isResellerAdmin = computed(() => hasAnyRole(auth.user, ['reseller_admin']))
  const canManageResellerTeam = computed(
    () =>
      isGlobalAdmin.value ||
      isCompanyAdmin.value ||
      isPartnerAdmin.value ||
      isResellerAdmin.value,
  )

  return {
    auth,
    isGlobalAdmin,
    isCompanyAdmin,
    isPrivilegedUser,
    isPartnerAdmin,
    isPartnerChannelUser,
    isResellerUser,
    isResellerAdmin,
    canManageResellerTeam,
  }
}
