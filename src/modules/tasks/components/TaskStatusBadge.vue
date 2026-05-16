<script setup lang="ts">
import { formatTaskStatus, taskStatusClass } from '@/modules/tasks/utils/taskFormat'

defineProps<{ status: string }>()
</script>

<template>
  <span class="rounded-full px-2 py-0.5 text-xs font-semibold capitalize" :class="taskStatusClass(status)">
    {{ formatTaskStatus(status) }}
  </span>
</template>
