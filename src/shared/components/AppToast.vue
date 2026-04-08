<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useToast } from '@/shared/utils/useToast'

const toast = useToast()
const { items } = toast

function onRcToast(e: Event) {
  const d = (e as CustomEvent<{ type?: 'error' | 'success' | 'info'; message: string }>).detail
  if (!d?.message) return
  if (d.type === 'success') toast.success(d.message)
  else if (d.type === 'info') toast.info(d.message)
  else toast.error(d.message)
}

onMounted(() => window.addEventListener('rc:toast', onRcToast as EventListener))
onUnmounted(() => window.removeEventListener('rc:toast', onRcToast as EventListener))
</script>

<template>
  <div class="fixed right-4 top-4 z-[60] space-y-2">
    <div
      v-for="item in items"
      :key="item.id"
      class="rounded-lg border px-4 py-3 text-sm shadow-lg"
      :class="{
        'border-emerald-200 bg-emerald-50 text-emerald-700': item.type === 'success',
        'border-red-200 bg-red-50 text-red-700': item.type === 'error',
        'border-blue-200 bg-blue-50 text-blue-700': item.type === 'info',
      }"
    >
      {{ item.message }}
    </div>
  </div>
</template>
