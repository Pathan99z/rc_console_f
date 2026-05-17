import type { Pagination } from '@/modules/users/services/users.api'

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export type NotificationItem = {
  id: number
  /** Normalized from API `notification_type` or `type`. */
  type: string
  notification_type?: string
  title: string
  message: string
  read_at?: string | null
  is_read?: boolean
  priority?: NotificationPriority | string | null
  action_url?: string | null
  category?: string | null
  created_at: string
  updated_at?: string
}

export type NotificationListParams = {
  page?: number
  per_page?: number
  read?: boolean
  unread?: boolean
  category?: string
  notification_type?: string
}

export type NotificationListResponse = ApiEnvelope<{
  items: NotificationItem[]
  pagination: Pagination
}>

export type NotificationUnreadCountResponse = ApiEnvelope<{
  unread_count: number
}>

export type NotificationCategoryFilter =
  | 'all'
  | 'unread'
  | 'tasks'
  | 'quotes'
  | 'deals'
  | 'payments'
  | 'organizations'
  | 'users'
