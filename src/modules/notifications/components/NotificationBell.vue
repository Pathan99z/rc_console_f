<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import NotificationDropdown from '@/modules/notifications/components/NotificationDropdown.vue'
import { useNotifications } from '@/modules/notifications/composables/useNotifications'

const {
  store,
  dropdownOpen,
  badgeText,
  showBadge,
  closeDropdown,
  handleNotificationClick,
  handleMarkAllRead,
  startPolling,
  stopPolling,
  openDropdown,
} = useNotifications()

const rootRef = ref<HTMLElement | null>(null)
const listError = ref(false)

async function onMarkAllRead() {
  try {
    listError.value = false
    await handleMarkAllRead()
  } catch {
    /* parent may toast from page; bell stays silent */
  }
}

async function onRetry() {
  listError.value = false
  try {
    await openDropdown()
  } catch {
    listError.value = true
  }
}

async function onToggle() {
  if (!dropdownOpen.value) {
    listError.value = false
    try {
      await openDropdown()
    } catch {
      listError.value = true
    }
  } else {
    closeDropdown()
  }
}

function onDocumentClick(event: MouseEvent) {
  if (!dropdownOpen.value) return
  const target = event.target as Node | null
  if (rootRef.value && target && !rootRef.value.contains(target)) {
    closeDropdown()
  }
}

onMounted(() => {
  startPolling()
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  stopPolling()
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div v-if="!store.accessDenied" ref="rootRef" class="relative">
    <button
      type="button"
      class="icon-btn relative"
      aria-label="Notifications"
      :aria-expanded="dropdownOpen"
      @click.stop="onToggle"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 00-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
      </svg>
      <span
        v-if="showBadge"
        class="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-none text-white"
      >
        {{ badgeText }}
      </span>
    </button>

    <NotificationDropdown
      :open="dropdownOpen"
      :unread-count="store.unreadCount"
      :list-error="listError"
      @close="closeDropdown"
      @select="handleNotificationClick"
      @mark-all-read="onMarkAllRead"
      @retry="onRetry"
    />
  </div>
</template>

<style scoped>
.icon-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #e3e8ef;
  border-radius: 0.7rem;
  background: #ffffff;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover {
  background: #f8fafc;
  color: #334155;
}
</style>
