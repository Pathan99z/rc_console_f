<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm">
    <header class="mb-4">
      <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
      <p v-if="subtitle" class="mt-0.5 text-xs text-slate-500">{{ subtitle }}</p>
    </header>
    <slot />
  </article>
</template>
