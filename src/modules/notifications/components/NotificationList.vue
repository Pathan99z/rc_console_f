<script setup lang="ts">
import NotificationEmptyState from '@/modules/notifications/components/NotificationEmptyState.vue'
import NotificationItem from '@/modules/notifications/components/NotificationItem.vue'
import NotificationSkeleton from '@/modules/notifications/components/NotificationSkeleton.vue'
import type { NotificationItem as NotificationRow } from '@/modules/notifications/types/notification.types'

defineProps<{
  items: NotificationRow[]
  loading?: boolean
  error?: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', item: NotificationRow): void
  (e: 'retry'): void
}>()
</script>

<template>
  <NotificationSkeleton v-if="loading" :rows="compact ? 4 : 6" />
  <NotificationEmptyState
    v-else-if="error"
    title="Unable to load notifications"
    message="Check your connection and try again."
    show-retry
    @retry="emit('retry')"
  />
  <NotificationEmptyState v-else-if="!items.length" />
  <div v-else class="max-h-[min(24rem,60vh)] overflow-y-auto">
    <NotificationItem
      v-for="item in items"
      :key="item.id"
      :item="item"
      :compact="compact"
      @select="emit('select', $event)"
    />
  </div>
</template>
