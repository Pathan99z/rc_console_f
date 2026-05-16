<script setup lang="ts">
defineProps<{ title?: string; message?: string }>()
</script>

<template>
  <div class="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center">
    <p class="text-sm font-semibold text-slate-700">{{ title || 'No data yet' }}</p>
    <p v-if="message" class="mt-1 text-xs text-slate-500">{{ message }}</p>
  </div>
</template>
