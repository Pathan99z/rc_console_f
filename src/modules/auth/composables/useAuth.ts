import { computed } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { hasAnyRole } from '@/modules/auth/composables/useCapabilities'

export function useAuth() {
  const auth = useAuthStore()

  const isGlobalAdmin = computed(() => hasAnyRole(auth.user, ['global_admin']))
  const isCompanyAdmin = computed(() => hasAnyRole(auth.user, ['company_admin']))
  const isPrivilegedUser = computed(() => isGlobalAdmin.value || isCompanyAdmin.value)

  return {
    auth,
    isGlobalAdmin,
    isCompanyAdmin,
    isPrivilegedUser,
  }
}
