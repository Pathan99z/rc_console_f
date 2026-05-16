import { computed } from 'vue'
import { hasAnyPermission } from '@/modules/auth/composables/useCapabilities'
import { useAuthStore } from '@/modules/auth/store/auth.store'

export function useDemoLinkAccess() {
  const authStore = useAuthStore()
  const user = computed(() => authStore.user)

  const canViewDemoLinks = computed(() => hasAnyPermission(user.value, ['demo_links.view']))
  const canManageDemoLinks = computed(() => hasAnyPermission(user.value, ['demo_links.manage']))
  const canShareDemoLinks = computed(() => hasAnyPermission(user.value, ['demo_links.share']))
  const canManageAllDemoLinks = computed(() => hasAnyPermission(user.value, ['demo_links.manage_all']))

  return {
    canViewDemoLinks,
    canManageDemoLinks,
    canShareDemoLinks,
    canManageAllDemoLinks,
  }
}
