<script setup lang="ts">
import { computed } from 'vue'
import { eventBadgeClass } from '@/modules/audit-logs/utils/auditLogFormat'
import { formatEventLabel, resolveEventCode } from '@/modules/audit-logs/utils/auditLogLabels'

const props = defineProps<{
  eventKey?: string | null
  action?: string | null
}>()

const code = computed(() => resolveEventCode(props.eventKey, props.action))
const label = computed(() => formatEventLabel(props.eventKey, props.action))
</script>

<template>
  <span
    v-if="code"
    class="inline-flex max-w-[14rem] truncate rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset"
    :class="eventBadgeClass(eventKey, action)"
    :title="code"
  >
    {{ label }}
  </span>
  <span v-else class="text-slate-400">—</span>
</template>
