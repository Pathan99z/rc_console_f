<script setup lang="ts">
import type { NotificationIconKind } from '@/modules/notifications/utils/notificationFormat'

defineProps<{
  kind: NotificationIconKind
}>()
</script>

<template>
  <svg v-if="kind === 'checklist'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
  <svg v-else-if="kind === 'document'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2v6h6" />
  </svg>
  <svg v-else-if="kind === 'briefcase'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2m-8 0h10a2 2 0 012 2v9a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2z" />
  </svg>
  <svg v-else-if="kind === 'user'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
  <svg v-else-if="kind === 'wallet'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h2m10 0h2M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
  </svg>
  <svg v-else-if="kind === 'shield'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3l7 4v5c0 4.4-3.1 8.4-7 9-3.9-.6-7-4.6-7-9V7l7-4z" />
  </svg>
  <svg v-else-if="kind === 'building'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M5 21V7l8-4 6 3v15M9 9h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1" />
  </svg>
  <svg v-else-if="kind === 'users'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.36-1.86M17 20H7m10 0v-2c0-.65-.13-1.28-.36-1.86M7 20H2v-2a3 3 0 015.36-1.86M7 20v-2c0-.65.13-1.28.36-1.86M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
  <svg v-else-if="kind === 'settings'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317a1 1 0 011.35-.936l.862.345a1 1 0 00.927-.073l.79-.527a1 1 0 011.296.115l.707.707a1 1 0 01.115 1.296l-.527.79a1 1 0 00-.073.927l.345.862a1 1 0 01-.936 1.35h-1a1 1 0 00-.95.684l-.315.946a1 1 0 01-1.9 0l-.315-.946a1 1 0 00-.95-.684h-1a1 1 0 01-.936-1.35l.345-.862a1 1 0 00-.073-.927l-.527-.79a1 1 0 01.115-1.296l.707-.707a1 1 0 011.296-.115l.79.527a1 1 0 00.927.073l.862-.345z" /><circle cx="12" cy="12" r="3" stroke-width="2" />
  </svg>
  <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 00-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
  </svg>
</template>
