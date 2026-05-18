import { computed } from 'vue'
import { hasPermission } from '@/modules/auth/composables/useCapabilities'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useLoginDashboardStore } from '@/modules/dashboard/store/loginDashboard.store'
import { profileFromUser, profileSubtitle, profileTitle } from '@/modules/dashboard/utils/loginDashboardProfile'

export function useLoginDashboard() {
  const store = useLoginDashboardStore()
  const authStore = useAuthStore()

  const profile = computed(() => store.payload?.dashboard_profile ?? profileFromUser(authStore.user))

  const title = computed(() => store.payload?.title || profileTitle(profile.value))
  const subtitle = computed(() => store.payload?.subtitle || profileSubtitle(profile.value))

  const canViewAudit = computed(() => hasPermission(authStore.user, 'audit.view'))
  const canViewNotifications = computed(() => {
    const perms = authStore.user?.permissions || []
    if (!perms.length) return true
    return hasPermission(authStore.user, 'notifications.view') || hasPermission(authStore.user, 'audit.view')
  })

  async function load(force = false) {
    await store.fetchLoginDashboard(force)
  }

  return {
    store,
    profile,
    title,
    subtitle,
    canViewAudit,
    canViewNotifications,
    load,
  }
}
