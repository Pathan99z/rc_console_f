import { apiClient } from '@/core/http/apiClient'
import type {
  ApiEnvelope,
  NotificationListParams,
  NotificationListResponse,
  NotificationUnreadCountResponse,
} from '@/modules/notifications/types/notification.types'

export const notificationApi = {
  list(params?: NotificationListParams) {
    return apiClient.get<NotificationListResponse>('/notifications', { params })
  },

  unreadCount() {
    return apiClient.get<NotificationUnreadCountResponse>('/notifications/unread-count')
  },

  markRead(id: number) {
    return apiClient.patch<ApiEnvelope<Record<string, unknown>>>(`/notifications/${id}/read`)
  },

  markAllRead() {
    return apiClient.patch<ApiEnvelope<Record<string, unknown>>>('/notifications/read-all')
  },
}
