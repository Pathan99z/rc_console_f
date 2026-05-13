import { computed } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { NavigationMenuItem, User } from '@/modules/auth/types/auth.types'

export function hasRole(user: User | null, role: string): boolean {
  if (!user || !role) return false
  if (user.role === role) return true
  return (user.roles || []).includes(role)
}

export function hasAnyRole(user: User | null, roles: string[] = []): boolean {
  if (!roles.length) return true
  return roles.some((role) => hasRole(user, role))
}

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user || !permission) return false
  return (user.permissions || []).includes(permission)
}

export function hasAnyPermission(user: User | null, permissions: string[] = []): boolean {
  if (!permissions.length) return true
  const userPermissions = user?.permissions || []
  if (!userPermissions.length) return true
  return permissions.some((permission) => userPermissions.includes(permission))
}

export function hasFeature(featureFlags: Record<string, boolean> | undefined, feature: string): boolean {
  if (!feature) return true
  return Boolean(featureFlags?.[feature])
}

export function canAccessRoute(
  user: User | null,
  options: {
    roles?: string[]
    permissions?: string[]
    features?: string[]
    /** When set, used for feature checks instead of user.feature_flags (e.g. user + navigation merge). */
    featureFlagSnapshot?: Record<string, boolean>
  } = {},
): boolean {
  const { roles = [], permissions = [], features = [], featureFlagSnapshot } = options
  if (!user) return false
  if (roles.length && !hasAnyRole(user, roles)) return false
  if (permissions.length && !hasAnyPermission(user, permissions)) return false
  const flags = featureFlagSnapshot ?? user.feature_flags ?? {}
  if (features.length && !features.every((feature) => hasFeature(flags, feature))) return false
  return true
}

export function canAccessNavItem(
  user: User | null,
  item: NavigationMenuItem,
  featureFlags: Record<string, boolean>,
): boolean {
  if (!item) return false
  if (item.permission && !hasAnyPermission(user, [item.permission])) return false
  if (item.feature_flag && !hasFeature(featureFlags, item.feature_flag)) return false
  return true
}

export function useCapabilities() {
  const auth = useAuthStore()
  const user = computed(() => auth.user)

  return {
    user,
    hasRole: (role: string) => hasRole(user.value, role),
    hasAnyRole: (roles: string[]) => hasAnyRole(user.value, roles),
    hasPermission: (permission: string) => hasPermission(user.value, permission),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(user.value, permissions),
    hasFeature: (feature: string) => hasFeature(user.value?.feature_flags || {}, feature),
  }
}
