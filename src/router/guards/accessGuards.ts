import type { RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useNavigationStore } from '@/modules/auth/store/navigation.store'
import { canAccessRoute } from '@/modules/auth/composables/useCapabilities'

export async function authAndRoleGuard(to: RouteLocationNormalized, _from: RouteLocationNormalized) {
  if (to.path === '/' && typeof to.query.token === 'string' && to.query.token.trim()) {
    return { path: '/partner/accept', query: { token: to.query.token } }
  }

  const auth = useAuthStore()
  const token = auth.token || localStorage.getItem('accessToken')
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const requiredRoles = (to.meta.roles as string[] | undefined) || []
  const requiredPermissions = (to.meta.requiredPermissions as string[] | undefined) || []
  const requiredFeatures = (to.meta.requiredFeatures as string[] | undefined) || []

  if (requiresAuth && !token) {
    return '/login'
  }

  if (requiresAuth) {
    const hydrated = await auth.hydrateSession()
    if (!hydrated || !auth.user) return '/login'
  }

  const navigationStore = useNavigationStore()
  const featureFlagSnapshot = navigationStore.mergedFeatureFlags

  if (
    requiresAuth &&
    !canAccessRoute(auth.user, {
      roles: requiredRoles,
      permissions: requiredPermissions,
      features: requiredFeatures,
      featureFlagSnapshot,
    })
  ) {
    return '/app/dashboard'
  }

  return true
}
