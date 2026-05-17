<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 5 })
</script>

<template>
  <div v-for="i in rows" :key="i" class="flex gap-3 border-b border-slate-100 px-4 py-3 last:border-0">
    <div class="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-slate-200" />
    <div class="min-w-0 flex-1 space-y-2">
      <div class="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
      <div class="h-2.5 w-full animate-pulse rounded bg-slate-100" />
      <div class="h-2 w-16 animate-pulse rounded bg-slate-100" />
    </div>
  </div>
</template>
