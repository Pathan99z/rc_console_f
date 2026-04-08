import { computed } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'

export function useAuth() {
  const auth = useAuthStore()

  const isGlobalAdmin = computed(() => auth.user?.role === 'global_admin')
  const isCompanyAdmin = computed(() => auth.user?.role === 'company_admin')
  const isPrivilegedUser = computed(() => isGlobalAdmin.value || isCompanyAdmin.value)

  return {
    auth,
    isGlobalAdmin,
    isCompanyAdmin,
    isPrivilegedUser,
  }
}
