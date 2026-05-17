<script setup lang="ts">
import { RouterLink } from 'vue-router'
import NotificationList from '@/modules/notifications/components/NotificationList.vue'
import { useNotificationStore } from '@/modules/notifications/store/notification.store'
import type { NotificationItem } from '@/modules/notifications/types/notification.types'

defineProps<{
  open: boolean
  unreadCount: number
  listError?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', item: NotificationItem): void
  (e: 'mark-all-read'): void
  (e: 'retry'): void
}>()

const store = useNotificationStore()
</script>

<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0 translate-y-1 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-1 scale-95"
  >
    <div
      v-if="open"
      class="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-200/80"
      role="dialog"
      aria-label="Notifications"
    >
      <div class="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 class="text-sm font-semibold text-slate-900">Notifications</h2>
          <p class="text-xs text-slate-500">
            <span v-if="unreadCount > 0">{{ unreadCount }} unread</span>
            <span v-else>All caught up</span>
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
          :disabled="!unreadCount || store.markingAll"
          @click="emit('mark-all-read')"
        >
          {{ store.markingAll ? 'Updating…' : 'Mark all read' }}
        </button>
      </div>

      <NotificationList
        :items="store.dropdownItems"
        :loading="store.dropdownLoading"
        :error="listError ?? false"
        compact
        @select="emit('select', $event)"
        @retry="emit('retry')"
      />

      <div class="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-center">
        <RouterLink
          to="/app/notifications"
          class="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          @click="emit('close')"
        >
          View all notifications
        </RouterLink>
      </div>
    </div>
  </Transition>
</template>
