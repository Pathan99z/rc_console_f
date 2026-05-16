<script setup lang="ts">
import { payoutStatusClass } from '@/modules/payouts/utils/payoutFormat'

defineProps<{ status: string }>()
</script>

<template>
  <span class="rounded-full px-2 py-0.5 text-xs font-semibold capitalize" :class="payoutStatusClass(status)">
    {{ status.replace(/_/g, ' ') }}
  </span>
</template>
