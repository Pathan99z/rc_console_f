<script setup lang="ts">
defineProps<{
  currentPage: number
  lastPage: number
}>()
const emit = defineEmits<{
  (e: 'change', page: number): void
}>()
</script>

<template>
  <div class="mt-4 flex items-center justify-end gap-2">
    <button class="rounded border px-3 py-1 text-sm disabled:opacity-50" :disabled="currentPage <= 1" @click="emit('change', currentPage - 1)">
      Prev
    </button>
    <span class="text-sm text-slate-600">Page {{ currentPage }} / {{ lastPage }}</span>
    <button class="rounded border px-3 py-1 text-sm disabled:opacity-50" :disabled="currentPage >= lastPage" @click="emit('change', currentPage + 1)">
      Next
    </button>
  </div>
</template>
