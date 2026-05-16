import { computed } from 'vue'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { hasAnyPermission, hasAnyRole } from '@/modules/auth/composables/useCapabilities'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { TaskViewMode } from '@/modules/tasks/types/task.types'

export function useTaskAccess() {
  const authStore = useAuthStore()
  const { isGlobalAdmin, isCompanyAdmin, isPartnerChannelUser, isResellerUser, isPartnerAdmin } = useAuth()

  const user = computed(() => authStore.user)

  const canViewTasks = computed(
    () => hasAnyPermission(user.value, ['tasks.view']) || hasAnyRole(user.value, ['global_admin', 'company_admin']),
  )

  const canManageTasks = computed(
    () => hasAnyPermission(user.value, ['tasks.manage']) || hasAnyRole(user.value, ['global_admin', 'company_admin']),
  )

  const canAssignTasks = computed(
    () => hasAnyPermission(user.value, ['tasks.assign', 'tasks.manage']) || hasAnyRole(user.value, ['global_admin', 'company_admin']),
  )

  const canManageAllTasks = computed(
    () =>
      hasAnyPermission(user.value, ['tasks.manage_all']) ||
      hasAnyRole(user.value, ['global_admin', 'company_admin', 'finance_admin']),
  )

  const isChannelUser = computed(() => isPartnerChannelUser.value || isResellerUser.value)

  const availableViews = computed((): Array<{ value: TaskViewMode; label: string }> => {
    const views: Array<{ value: TaskViewMode; label: string }> = [
      { value: 'my', label: 'My tasks' },
      { value: 'created_by_me', label: 'Created by me' },
    ]
    if (isChannelUser.value || canManageAllTasks.value) {
      views.push({ value: 'organization', label: 'Organization' })
    }
    if (isPartnerAdmin.value || canManageAllTasks.value) {
      views.push({ value: 'organization_tree', label: 'Organization tree' })
    }
    if (canManageAllTasks.value) {
      views.push({ value: 'tenant', label: 'All tasks' })
    }
    return views
  })

  const needsScopeOrgOnCreate = computed(() => isChannelUser.value && !canManageAllTasks.value)

  return {
    canViewTasks,
    canManageTasks,
    canAssignTasks,
    canManageAllTasks,
    isChannelUser,
    availableViews,
    needsScopeOrgOnCreate,
    defaultOrgId: computed(() => user.value?.organization_id ?? null),
  }
}
