<script setup lang="ts">
import { formatLiveStatus, liveStatusClass } from '@/modules/demo-links/utils/demoLinkFormat'
import type { DemoLinkLiveStatus } from '@/modules/demo-links/types/demoLink.types'

defineProps<{
  status?: DemoLinkLiveStatus | null
}>()
</script>

<template>
  <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold uppercase" :class="liveStatusClass(status)">
    {{ formatLiveStatus(status) }}
  </span>
</template>
