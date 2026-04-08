import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'

export async function authAndRoleGuard(to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) {
  const auth = useAuthStore()
  const token = auth.token || localStorage.getItem('accessToken')
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const requiredRoles = (to.meta.roles as string[] | undefined) || []

  if (requiresAuth && !token) {
    next('/login')
    return
  }

  if (token && !auth.user) {
    await auth.fetchUser()
  }

  if (requiredRoles.length && auth.user && !requiredRoles.includes(auth.user.role)) {
    next('/app/dashboard')
    return
  }

  next()
}
