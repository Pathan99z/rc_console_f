<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useToast } from '@/shared/utils/useToast'

const toast = useToast()

function onRcToast(e: Event) {
  const d = (e as CustomEvent<{ type?: 'error' | 'success' | 'info'; message: string; duration?: number }>).detail
  if (!d?.message) return
  const duration = d.duration ?? 4000
  if (d.type === 'success') toast.success(d.message, duration)
  else if (d.type === 'info') toast.info(d.message)
  else toast.error(d.message)
}

onMounted(() => globalThis.addEventListener('rc:toast', onRcToast as EventListener))
onUnmounted(() => globalThis.removeEventListener('rc:toast', onRcToast as EventListener))
</script>

<template>
  <div class="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-3" aria-live="polite">
    <div
      v-for="item in toast.items"
      :key="item.id"
      class="pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3.5 text-sm shadow-lg"
      :class="{
        'border-slate-200 border-l-4 border-l-indigo-500': item.type === 'success',
        'border-red-200 bg-red-50 text-red-700': item.type === 'error',
        'border-blue-200 bg-blue-50 text-blue-700': item.type === 'info',
      }"
    >
      <span
        v-if="item.type === 'success'"
        class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white"
        aria-hidden="true"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <div class="min-w-0 flex-1 pr-1">
        <p class="leading-snug" :class="item.type === 'success' ? 'font-semibold text-slate-900' : ''">
          {{ item.message }}
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-600"
        aria-label="Dismiss notification"
        @click="toast.dismiss(item.id)"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>
