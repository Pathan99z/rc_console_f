<script setup lang="ts">
import { statusBadgeClass, statusBadgeLabel } from '@/modules/settings/email/utils/emailSettingsFormat'
import type { EmailConfigStatus } from '@/modules/settings/email/types/emailSettings.types'

defineProps<{
  status: EmailConfigStatus
}>()
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset"
    :class="statusBadgeClass(status)"
  >
    {{ statusBadgeLabel(status) }}
  </span>
</template>
