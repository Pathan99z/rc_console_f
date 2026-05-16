<script setup lang="ts">
import { computed } from 'vue'
import type { DashboardActivityItem } from '@/modules/dashboard/types/dashboard.types'
import DashboardEmptyState from '@/modules/dashboard/components/DashboardEmptyState.vue'

const props = defineProps<{ items?: DashboardActivityItem[] }>()

const activityIcon = (type?: string) => {
  const t = (type || '').toLowerCase()
  if (t.includes('deal')) return '📊'
  if (t.includes('commission')) return '💰'
  if (t.includes('license')) return '🔑'
  if (t.includes('contact')) return '👤'
  if (t.includes('company')) return '🏢'
  if (t.includes('resource') || t.includes('collateral')) return '📄'
  if (t.includes('reseller')) return '🤝'
  return '•'
}

const sorted = computed(() =>
  [...(props.items || [])].sort((a, b) => {
    const da = new Date(a.occurred_at || a.created_at || 0).getTime()
    const db = new Date(b.occurred_at || b.created_at || 0).getTime()
    return db - da
  }),
)

function formatWhen(raw?: string) {
  if (!raw) return '—'
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? raw : d.toLocaleString()
}
</script>

<template>
  <DashboardEmptyState v-if="!sorted.length" title="No recent activity" message="Activity will appear as your team works in CRM and PRM." />
  <ul v-else class="divide-y divide-[var(--rc-border-soft)]" role="list">
    <li v-for="item in sorted" :key="String(item.id ?? item.title)" class="flex gap-3 py-3 first:pt-0 last:pb-0">
      <span class="mt-0.5 text-lg" aria-hidden="true">{{ activityIcon(item.type) }}</span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-slate-900">{{ item.title || item.type || 'Activity' }}</p>
        <p v-if="item.entity_label || item.description" class="mt-0.5 text-xs text-slate-500">
          {{ item.entity_label || item.description }}
        </p>
        <time class="mt-1 block text-xs text-slate-400">{{ formatWhen(item.occurred_at || item.created_at) }}</time>
      </div>
    </li>
  </ul>
</template>
