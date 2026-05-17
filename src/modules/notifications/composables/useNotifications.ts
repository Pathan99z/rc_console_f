import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/modules/notifications/store/notification.store'
import { isNotificationRead } from '@/modules/notifications/utils/notificationFormat'
import { navigateToNotificationAction } from '@/modules/notifications/utils/notificationNavigation'
import type { NotificationItem } from '@/modules/notifications/types/notification.types'

const POLL_MS = 60_000

export function useNotifications() {
  const store = useNotificationStore()
  const router = useRouter()
  const dropdownOpen = ref(false)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  const badgeText = computed(() => {
    const n = store.unreadCount
    if (n <= 0) return ''
    return n > 99 ? '99+' : String(n)
  })

  const showBadge = computed(() => store.unreadCount > 0 && !store.accessDenied)

  async function refreshUnreadCount() {
    if (store.accessDenied) return
    try {
      await store.fetchUnreadCount()
    } catch {
      /* polling should not toast */
    }
  }

  async function openDropdown() {
    if (store.accessDenied) return
    dropdownOpen.value = true
    try {
      await Promise.all([store.fetchDropdownNotifications(), store.fetchUnreadCount()])
    } catch {
      /* dropdown shows retry via child */
    }
  }

  function closeDropdown() {
    dropdownOpen.value = false
  }

  function toggleDropdown() {
    if (dropdownOpen.value) closeDropdown()
    else void openDropdown()
  }

  async function handleNotificationClick(item: NotificationItem) {
    const wasUnread = !isNotificationRead(item)
    if (wasUnread) {
      try {
        await store.markRead(item.id)
      } catch {
        return
      }
    }
    closeDropdown()
    await navigateToNotificationAction(router, item.action_url)
  }

  async function handleMarkAllRead() {
    try {
      await store.markAllRead()
    } catch {
      throw new Error(store.message || 'Unable to mark all as read.')
    }
  }

  function startPolling() {
    stopPolling()
    void refreshUnreadCount()
    pollTimer = setInterval(() => {
      void refreshUnreadCount()
    }, POLL_MS)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return {
    store,
    dropdownOpen,
    badgeText,
    showBadge,
    toggleDropdown,
    closeDropdown,
    openDropdown,
    refreshUnreadCount,
    handleNotificationClick,
    handleMarkAllRead,
    startPolling,
    stopPolling,
  }
}
