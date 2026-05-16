import { computed } from 'vue'
import { hasAnyPermission } from '@/modules/auth/composables/useCapabilities'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { useAuthStore } from '@/modules/auth/store/auth.store'

export function useEmailSettingsAccess() {
  const authStore = useAuthStore()
  const { isGlobalAdmin, isCompanyAdmin } = useAuth()
  const user = computed(() => authStore.user)

  const canViewEmailSettings = computed(() => hasAnyPermission(user.value, ['email_settings.view']))
  const canManageEmailSettings = computed(() => hasAnyPermission(user.value, ['email_settings.manage']))

  const canPickOrganization = computed(
    () => canManageEmailSettings.value && (isGlobalAdmin.value || isCompanyAdmin.value),
  )

  return {
    canViewEmailSettings,
    canManageEmailSettings,
    canPickOrganization,
    defaultOrganizationId: computed(() => user.value?.organization_id ?? null),
  }
}
