<script setup lang="ts">
defineProps<{
  title?: string
  message?: string
  showRetry?: boolean
}>()

const emit = defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-10 text-center">
    <div
      class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"
      aria-hidden="true"
    >
      <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 00-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
      </svg>
    </div>
    <p class="text-sm font-semibold text-slate-800">{{ title || 'No notifications' }}</p>
    <p class="mt-1 max-w-xs text-xs text-slate-500">{{ message || "You're all caught up." }}</p>
    <button
      v-if="showRetry"
      type="button"
      class="mt-4 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      @click="emit('retry')"
    >
      Try again
    </button>
  </div>
</template>
