<script setup lang="ts">
import { computed } from 'vue'
import NotificationIcon from '@/modules/notifications/components/NotificationIcon.vue'
import type { NotificationItem } from '@/modules/notifications/types/notification.types'
import {
  formatRelativeTime,
  isNotificationRead,
  notificationIconKind,
  priorityClasses,
  resolveNotificationType,
} from '@/modules/notifications/utils/notificationFormat'

const props = defineProps<{
  item: NotificationItem
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', item: NotificationItem): void
}>()

const isRead = computed(() => isNotificationRead(props.item))
const iconKind = computed(() =>
  notificationIconKind(resolveNotificationType(props.item), props.item?.category ?? null),
)
</script>

<template>
  <button
    type="button"
    class="flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-slate-50/90"
    :class="[priorityClasses(item?.priority), !isRead ? 'bg-indigo-50/30' : '']"
    @click.stop="emit('select', item)"
  >
    <div
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
      :class="isRead ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-700'"
    >
      <NotificationIcon :kind="iconKind" />
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-start gap-2">
        <p class="min-w-0 flex-1 text-sm font-semibold text-slate-900" :class="{ 'font-bold': !isRead }">
          {{ item.title }}
        </p>
        <span v-if="!isRead" class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-600" aria-label="Unread" />
      </div>
      <p class="mt-0.5 line-clamp-2 text-xs text-slate-600" :class="compact ? 'line-clamp-1' : ''">
        {{ item.message }}
      </p>
      <p class="mt-1 text-[11px] text-slate-400">{{ formatRelativeTime(item.created_at) }}</p>
    </div>
  </button>
</template>
