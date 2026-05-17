import { computed } from 'vue'
import { hasAnyPermission } from '@/modules/auth/composables/useCapabilities'
import { useAuthStore } from '@/modules/auth/store/auth.store'

export function useAuditLogAccess() {
  const authStore = useAuthStore()
  const user = computed(() => authStore.user)

  const canViewAuditLogs = computed(() => hasAnyPermission(user.value, ['audit.view']))
  const canExportAuditLogs = computed(() => hasAnyPermission(user.value, ['audit.export']))

  return {
    canViewAuditLogs,
    canExportAuditLogs,
  }
}
