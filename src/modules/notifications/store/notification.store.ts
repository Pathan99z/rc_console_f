import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { notificationApi } from '@/modules/notifications/services/notification.api'
import type {
  NotificationItem,
  NotificationListParams,
} from '@/modules/notifications/types/notification.types'
import type { Pagination } from '@/modules/users/services/users.api'
import {
  normalizeNotificationItem,
  unwrapNotificationList,
  unwrapUnreadCount,
} from '@/modules/notifications/utils/notificationFormat'

const emptyPagination = (): Pagination => ({
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
})

export const useNotificationStore = defineStore('notifications', () => {
  const message = ref('')
  const accessDenied = ref(false)
  const unreadCount = ref(0)
  const dropdownItems = ref<NotificationItem[]>([])
  const centerItems = ref<NotificationItem[]>([])
  const pagination = ref<Pagination>(emptyPagination())
  const dropdownLoading = ref(false)
  const centerLoading = ref(false)
  const unreadLoading = ref(false)
  const markingAll = ref(false)

  function handleForbidden(error: unknown) {
    const err = toApiError(error)
    if (err.isForbidden) {
      accessDenied.value = true
      unreadCount.value = 0
      dropdownItems.value = []
      centerItems.value = []
    }
    return err
  }

  async function fetchUnreadCount() {
    if (accessDenied.value) return 0
    unreadLoading.value = true
    try {
      const { data } = await notificationApi.unreadCount()
      const inner = (data.data ?? data) as Record<string, unknown>
      unreadCount.value = unwrapUnreadCount(inner)
      return unreadCount.value
    } catch (error) {
      const err = handleForbidden(error)
      if (!err.isForbidden) message.value = err.message
      throw error
    } finally {
      unreadLoading.value = false
    }
  }

  async function fetchDropdownNotifications() {
    if (accessDenied.value) return []
    dropdownLoading.value = true
    try {
      const { data } = await notificationApi.list({ per_page: 10, page: 1 })
      const inner = (data.data ?? data) as Record<string, unknown>
      const { items } = unwrapNotificationList(inner)
      dropdownItems.value = items
        .map((row) => normalizeNotificationItem(row) ?? row)
        .filter((row): row is NotificationItem => Boolean(row?.id))
      return items
    } catch (error) {
      const err = handleForbidden(error)
      if (!err.isForbidden) message.value = err.message
      throw error
    } finally {
      dropdownLoading.value = false
    }
  }

  async function fetchCenterNotifications(params?: NotificationListParams) {
    if (accessDenied.value) return []
    centerLoading.value = true
    try {
      const { data } = await notificationApi.list(params)
      const inner = (data.data ?? data) as Record<string, unknown>
      const { items, pagination: pag } = unwrapNotificationList(inner)
      centerItems.value = items
        .map((row) => normalizeNotificationItem(row) ?? row)
        .filter((row): row is NotificationItem => Boolean(row?.id))
      if (pag && typeof pag === 'object') {
        pagination.value = { ...emptyPagination(), ...(pag as Pagination) }
      }
      message.value = data.message
      return items
    } catch (error) {
      const err = handleForbidden(error)
      if (!err.isForbidden) message.value = err.message
      throw error
    } finally {
      centerLoading.value = false
    }
  }

  function markItemReadLocally(id: number) {
    const patch = (list: NotificationItem[]) => {
      const item = list.find((n) => n.id === id)
      if (item && !item.read_at) {
        item.read_at = new Date().toISOString()
        item.is_read = true
        if (unreadCount.value > 0) unreadCount.value -= 1
      }
    }
    patch(dropdownItems.value)
    patch(centerItems.value)
  }

  async function markRead(id: number) {
    markItemReadLocally(id)
    try {
      await notificationApi.markRead(id)
    } catch (error) {
      await Promise.all([fetchUnreadCount(), fetchDropdownNotifications()])
      throw handleForbidden(error)
    }
  }

  async function markAllRead() {
    markingAll.value = true
    const now = new Date().toISOString()
    dropdownItems.value.forEach((n) => {
      n.read_at = now
      n.is_read = true
    })
    centerItems.value.forEach((n) => {
      n.read_at = now
      n.is_read = true
    })
    unreadCount.value = 0
    try {
      await notificationApi.markAllRead()
      await Promise.all([fetchUnreadCount(), fetchDropdownNotifications()])
    } catch (error) {
      await Promise.all([fetchUnreadCount(), fetchDropdownNotifications()])
      throw handleForbidden(error)
    } finally {
      markingAll.value = false
    }
  }

  return {
    message,
    accessDenied,
    unreadCount,
    dropdownItems,
    centerItems,
    pagination,
    dropdownLoading,
    centerLoading,
    unreadLoading,
    markingAll,
    fetchUnreadCount,
    fetchDropdownNotifications,
    fetchCenterNotifications,
    markRead,
    markAllRead,
    markItemReadLocally,
  }
})
