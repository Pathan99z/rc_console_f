<script setup lang="ts">
import AuditLogEventBadge from '@/modules/audit-logs/components/AuditLogEventBadge.vue'
import AuditLogSkeleton from '@/modules/audit-logs/components/AuditLogSkeleton.vue'
import type { AuditLogListItem } from '@/modules/audit-logs/types/auditLog.types'
import {
  actorLabel,
  entityLabel,
  formatAuditTimestamp,
  organizationLabel,
} from '@/modules/audit-logs/utils/auditLogFormat'
import { formatModuleLabel, formatSourceLabel } from '@/modules/audit-logs/utils/auditLogLabels'

defineProps<{
  rows: AuditLogListItem[]
  loading: boolean
  error?: boolean
}>()

const emit = defineEmits<{
  (e: 'view', item: AuditLogListItem): void
}>()
</script>

<template>
  <AuditLogSkeleton v-if="loading && !rows.length" />

  <div
    v-else
    class="overflow-x-auto rounded-xl border border-[var(--rc-border-soft)] bg-white"
  >
    <table class="min-w-full divide-y divide-[var(--rc-border-soft)] text-sm">
      <thead class="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th class="px-4 py-3 text-left">Timestamp</th>
          <th class="px-4 py-3 text-left">Event</th>
          <th class="px-4 py-3 text-left">Module</th>
          <th class="px-4 py-3 text-left">Actor</th>
          <th class="px-4 py-3 text-left">Organization</th>
          <th class="px-4 py-3 text-left">Entity</th>
          <th class="px-4 py-3 text-left">Source</th>
          <th class="px-4 py-3 text-left">Correlation ID</th>
          <th class="px-4 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[var(--rc-border-soft)]">
        <tr v-if="error">
          <td colspan="9" class="px-4 py-8 text-center text-sm text-rose-600">
            Unable to load audit logs. Try refreshing or adjusting filters.
          </td>
        </tr>
        <tr v-else-if="!rows.length">
          <td colspan="9" class="px-4 py-8 text-center text-sm text-slate-500">
            No audit events match your filters.
          </td>
        </tr>
        <tr v-for="item in rows" v-else :key="item.public_id" class="hover:bg-slate-50/80">
          <td class="whitespace-nowrap px-4 py-3 text-slate-700">{{ formatAuditTimestamp(item.occurred_at) }}</td>
          <td class="px-4 py-3">
            <AuditLogEventBadge :event-key="item.event_key" :action="item.action" />
          </td>
          <td class="px-4 py-3 text-slate-700">{{ formatModuleLabel(item.module) }}</td>
          <td class="max-w-[10rem] truncate px-4 py-3 text-slate-700" :title="actorLabel(item)">
            {{ actorLabel(item) }}
          </td>
          <td class="max-w-[10rem] truncate px-4 py-3 text-slate-700" :title="organizationLabel(item)">
            {{ organizationLabel(item) }}
          </td>
          <td class="max-w-[10rem] truncate px-4 py-3 text-slate-700" :title="entityLabel(item)">
            {{ entityLabel(item) }}
          </td>
          <td class="px-4 py-3 text-slate-600">{{ formatSourceLabel(item.source) }}</td>
          <td class="max-w-[8rem] truncate px-4 py-3 font-mono text-xs text-slate-500" :title="item.correlation_id || ''">
            {{ item.correlation_id || '—' }}
          </td>
          <td class="px-4 py-3 text-right">
            <button
              type="button"
              class="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              @click="emit('view', item)"
            >
              View
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
