import { computed } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { hasAnyRole } from '@/modules/auth/composables/useCapabilities'

const prmChannelRoles = [
  'partner_admin',
  'partner_sales_manager',
  'partner_sales_consultant',
  'reseller_admin',
  'reseller_sales_consultant',
] as const

export function useAuth() {
  const auth = useAuthStore()

  const isGlobalAdmin = computed(() => hasAnyRole(auth.user, ['global_admin']))
  const isCompanyAdmin = computed(() => hasAnyRole(auth.user, ['company_admin']))
  const isPrivilegedUser = computed(() => isGlobalAdmin.value || isCompanyAdmin.value)
  const isPartnerChannelUser = computed(() => hasAnyRole(auth.user, [...prmChannelRoles]))

  return {
    auth,
    isGlobalAdmin,
    isCompanyAdmin,
    isPrivilegedUser,
    isPartnerChannelUser,
  }
}
