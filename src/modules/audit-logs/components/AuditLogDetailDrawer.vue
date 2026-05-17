<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AuditLogEventBadge from '@/modules/audit-logs/components/AuditLogEventBadge.vue'
import AuditLogJsonBlock from '@/modules/audit-logs/components/AuditLogJsonBlock.vue'
import type { AuditLogDetail } from '@/modules/audit-logs/types/auditLog.types'
import {
  actorLabel,
  entityLabel,
  formatAuditTimestamp,
  organizationLabel,
  resolveEntityRecordLink,
} from '@/modules/audit-logs/utils/auditLogFormat'
import {
  formatEventLabel,
  formatModuleLabel,
  formatSourceLabel,
  resolveEventCode,
} from '@/modules/audit-logs/utils/auditLogLabels'

const props = defineProps<{
  open: boolean
  detail: AuditLogDetail | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const recordLink = computed(() => {
  const entity = props.detail?.entity
  return resolveEntityRecordLink(entity?.type, entity?.id)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex justify-end bg-black/40" @click.self="emit('close')">
      <aside class="flex h-full w-full max-w-xl flex-col bg-white shadow-xl" @click.stop>
        <header class="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div class="min-w-0 flex-1 pr-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Audit event detail</p>
            <h2 v-if="detail" class="mt-1 text-lg font-semibold text-slate-900">{{ detail.public_id }}</h2>
          </div>
          <button type="button" class="rounded-lg border px-2 py-1 text-xs text-slate-600" @click="emit('close')">
            Close
          </button>
        </header>

        <div v-if="loading" class="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">Loading…</div>
        <div v-else-if="detail" class="flex-1 space-y-6 overflow-y-auto px-5 py-4">
          <div class="flex flex-wrap items-center gap-2">
            <AuditLogEventBadge :event-key="detail.event_key" :action="detail.action" />
            <span v-if="detail.is_archived" class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Archived</span>
          </div>

          <section class="space-y-3">
            <h3 class="text-sm font-semibold text-slate-900">General info</h3>
            <dl class="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt class="text-xs text-slate-500">Public ID</dt>
                <dd class="font-mono text-xs">{{ detail.public_id }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Stream</dt>
                <dd>{{ detail.stream || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Timestamp</dt>
                <dd>{{ formatAuditTimestamp(detail.occurred_at) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Event</dt>
                <dd>{{ formatEventLabel(detail.event_key, detail.action) }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs text-slate-500">Event code</dt>
                <dd class="font-mono text-xs text-slate-500">{{ resolveEventCode(detail.event_key, detail.action) || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Module</dt>
                <dd>{{ formatModuleLabel(detail.module) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Action</dt>
                <dd>{{ detail.action ? formatEventLabel(detail.action, null) : '—' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs text-slate-500">Actor</dt>
                <dd>{{ actorLabel(detail) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Tenant</dt>
                <dd>{{ detail.tenant?.name || (detail.tenant?.id != null ? `Tenant #${detail.tenant.id}` : '—') }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Organization</dt>
                <dd>{{ organizationLabel(detail) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Source</dt>
                <dd>{{ formatSourceLabel(detail.source) }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs text-slate-500">Correlation ID</dt>
                <dd class="break-all font-mono text-xs">{{ detail.correlation_id || '—' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs text-slate-500">Entity</dt>
                <dd class="flex flex-wrap items-center gap-2">
                  <span>{{ entityLabel(detail) }}</span>
                  <RouterLink
                    v-if="recordLink"
                    :to="recordLink"
                    class="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    @click="emit('close')"
                  >
                    Open record →
                  </RouterLink>
                </dd>
              </div>
            </dl>
          </section>

          <section class="space-y-3">
            <h3 class="text-sm font-semibold text-slate-900">Technical info</h3>
            <dl class="grid gap-3 text-sm">
              <div>
                <dt class="text-xs text-slate-500">IP address</dt>
                <dd class="font-mono text-xs">{{ detail.ip_address || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">User agent</dt>
                <dd class="break-all text-xs text-slate-700">{{ detail.user_agent || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Immutable timestamp</dt>
                <dd>{{ formatAuditTimestamp(detail.immutable_at) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Archived timestamp</dt>
                <dd>{{ formatAuditTimestamp(detail.archived_at) }}</dd>
              </div>
            </dl>
          </section>

          <section class="space-y-4">
            <h3 class="text-sm font-semibold text-slate-900">Payload</h3>
            <AuditLogJsonBlock title="Before JSON" :value="detail.payload_before" />
            <AuditLogJsonBlock title="After JSON" :value="detail.payload_after" />
            <AuditLogJsonBlock title="Metadata JSON" :value="detail.metadata" />
          </section>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
