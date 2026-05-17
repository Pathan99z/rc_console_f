<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import NotificationList from '@/modules/notifications/components/NotificationList.vue'
import { useNotificationStore } from '@/modules/notifications/store/notification.store'
import { categoryToQueryParams, isNotificationRead } from '@/modules/notifications/utils/notificationFormat'
import { navigateToNotificationAction } from '@/modules/notifications/utils/notificationNavigation'
import type { NotificationCategoryFilter, NotificationItem } from '@/modules/notifications/types/notification.types'

const store = useNotificationStore()
const toast = useToast()
const router = useRouter()

const category = ref<NotificationCategoryFilter>('all')
const page = ref(1)
const listError = ref(false)

const categories: { key: NotificationCategoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'quotes', label: 'Quotes' },
  { key: 'deals', label: 'Deals' },
  { key: 'payments', label: 'Payments' },
  { key: 'organizations', label: 'Organizations' },
  { key: 'users', label: 'Users' },
]

const unreadInView = computed(() => store.centerItems.filter((n) => !isNotificationRead(n)).length)

function buildParams() {
  return {
    page: page.value,
    per_page: 20,
    ...categoryToQueryParams(category.value),
  }
}

async function load() {
  if (store.accessDenied) return
  listError.value = false
  try {
    await store.fetchCenterNotifications(buildParams())
    await store.fetchUnreadCount()
  } catch {
    listError.value = true
    toast.error(store.message || 'Unable to load notifications.')
  }
}

async function refresh() {
  await load()
}

async function onItemClick(item: NotificationItem) {
  const wasUnread = !isNotificationRead(item)
  if (wasUnread) {
    try {
      await store.markRead(item.id)
    } catch {
      toast.error(store.message || 'Unable to mark notification as read.')
      return
    }
  }
  await navigateToNotificationAction(router, item.action_url)
}

async function markAllRead() {
  try {
    await store.markAllRead()
    toast.success('All notifications marked as read.')
    await load()
  } catch {
    toast.error(store.message || 'Unable to mark all as read.')
  }
}

watch(page, () => {
  void load()
})

function onCategoryChange(key: NotificationCategoryFilter) {
  if (category.value === key) return
  category.value = key
  page.value = 1
  void load()
}

onMounted(() => {
  if (store.accessDenied) return
  void load()
})
</script>

<template>
  <section v-if="store.accessDenied" class="rounded-xl border bg-white p-8 text-center text-sm text-slate-600">
    Notifications are not available for your account.
  </section>

  <section v-else class="space-y-5">
    <header class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
      <div>
        <h2 class="text-xl font-bold tracking-tight text-slate-900">Notifications</h2>
        <p class="mt-1 text-sm text-slate-600">
          Stay on top of tasks, quotes, deals, and organization updates.
          <span v-if="store.unreadCount > 0" class="font-medium text-indigo-600">
            {{ store.unreadCount }} unread
          </span>
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          :disabled="store.centerLoading"
          @click="refresh"
        >
          {{ store.centerLoading ? 'Refreshing…' : 'Refresh' }}
        </button>
        <button
          type="button"
          class="btn-primary rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
          :disabled="!unreadInView || store.markingAll"
          @click="markAllRead"
        >
          Mark all read
        </button>
      </div>
    </header>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="c in categories"
        :key="c.key"
        type="button"
        class="rounded-full px-3 py-1.5 text-xs font-semibold transition"
        :class="
          category === c.key
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
        "
        @click="onCategoryChange(c.key)"
      >
        {{ c.label }}
      </button>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100">
      <NotificationList
        :items="store.centerItems"
        :loading="store.centerLoading"
        :error="listError"
        @select="onItemClick"
        @retry="refresh"
      />
    </div>

    <PaginationControls
      v-if="store.pagination.last_page > 1"
      :current-page="store.pagination.current_page"
      :last-page="store.pagination.last_page"
      @change="page = $event"
    />
  </section>
</template>
