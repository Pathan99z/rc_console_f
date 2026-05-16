import type { Pagination } from '@/modules/users/services/users.api'

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskRelatedType =
  | 'contact'
  | 'company'
  | 'deal'
  | 'quote'
  | 'payment_record'
  | 'payout'
  | 'license_entitlement'
  | 'other'

export type TaskViewMode =
  | 'my'
  | 'created_by_me'
  | 'organization'
  | 'organization_tree'
  | 'tenant'

export type TaskUserRef = {
  id: number
  name: string
  email?: string
}

export type TaskOrgRef = {
  id: number
  type?: string
  display_name?: string
  legal_name?: string
}

export type TaskRelatedRef = {
  type: TaskRelatedType
  id?: number | null
  summary?: string
  label?: string
}

export type TaskPermissions = {
  can_view?: boolean
  can_edit?: boolean
  can_assign?: boolean
  can_complete?: boolean
  can_cancel?: boolean
  can_reopen?: boolean
}

export type TaskItem = {
  id: number
  title: string
  description?: string | null
  priority: TaskPriority
  status: TaskStatus
  is_overdue?: boolean
  due_at?: string | null
  completed_at?: string | null
  cancelled_at?: string | null
  assignee_user_id?: number | null
  created_by_user_id?: number
  scope_organization_id?: number | null
  related_type?: TaskRelatedType | null
  related_id?: number | null
  assignee?: TaskUserRef | null
  creator?: TaskUserRef | null
  scope_organization?: TaskOrgRef | null
  related?: TaskRelatedRef | null
  permissions?: TaskPermissions
  metadata?: Record<string, unknown> | null
  created_at?: string
  updated_at?: string
}

export type TaskListParams = {
  page?: number
  per_page?: number
  view?: TaskViewMode
  search?: string
  status?: TaskStatus | string
  priority?: TaskPriority | string
  assignee_user_id?: number
  created_by_user_id?: number
  scope_organization_id?: number
  related_type?: TaskRelatedType | string
  overdue?: boolean
}

export type TaskListResponse = ApiEnvelope<{ items: TaskItem[]; pagination: Pagination }>
export type TaskDetailResponse = ApiEnvelope<{ task: TaskItem }>

export type CreateTaskPayload = {
  title: string
  description?: string
  priority?: TaskPriority
  due_at?: string
  assignee_user_id?: number
  scope_organization_id?: number
  related_type?: TaskRelatedType
  related_id?: number
  metadata?: Record<string, unknown>
}

export type UpdateTaskPayload = Partial<Omit<CreateTaskPayload, 'assignee_user_id'>>

export type AssignableUser = TaskUserRef & {
  role?: string | null
  role_name?: string | null
  organization_name?: string | null
  organization_display_name?: string | null
  organization?: {
    id?: number
    display_name?: string | null
    legal_name?: string | null
    type?: string | null
  } | null
}
