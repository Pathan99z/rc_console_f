<script setup lang="ts">
import { formatTaskPriority, taskPriorityClass } from '@/modules/tasks/utils/taskFormat'

defineProps<{ priority: string }>()
</script>

<template>
  <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="taskPriorityClass(priority)">
    {{ formatTaskPriority(priority) }}
  </span>
</template>
